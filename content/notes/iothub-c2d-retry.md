---
layout: ../../layouts/MarkdownPostLayout.astro
title: IoTHubにおける受信処理を開始する前に送られたC2Dメッセージの扱い
pubDate: '2021-06-06T09:00:00.000Z'
---

IoTHubで受信処理を開始する前に送られたC2Dメッセージ(以下、古いメッセージ)がどういう扱いになるのかがわからなかったので動作確認をしてみました。

# TL; DR;

- 通信プロトコルがMQTTでなければ古いメッセージも取得される
- MQTTの場合はCleanSessionフラグによって古いメッセージが取得されるかが決まる

# MQTTじゃない場合

通信プロトコルがMQTTでなければ古いメッセージも取得されます。試しにaz cliで動きを確認してみました。

1. ポータルからC2Dを送る
2. `az iot device c2d-message receive -d $DEVICE_NAME -n $HUB` 実行→ C2Dが表示される

ちなみに、MQTTじゃない場合は明示的にメッセージを処理 (complete, reject, abandon)しない限りは、キューに残ってしまうようです ([公式ドキュメントのステートマシン](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-messages-c2d#the-cloud-to-device-message-life-cycle)を参照)。

ただ、受信されたメッセージは一定期間ロック状態となり再度取得しても見えない状態となるようです。一定期間がすぎると再度取得したときに同じメッセージが受信できるようになります。

**受信してもメッセージを処理しない場合**

1. ポータルからC2Dを送る
2. `az iot device c2d-message receive -d $DEVICE_NAME -n $HUB` 実行→ C2Dが表示される
3. 1分間は2のコマンドを実行→何も取得されない
[ロックのデフォルトは60秒になっている](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-devguide-messages-c2d#cloud-to-device-configuration-options)ようす。
4. 1分後2のコマンドを実行→2と同じC2Dが表示される

**受信してからメッセージを処理 (complete)する場合**

1. ポータルからC2Dを送る
2. `az iot device c2d-message receive -d $DEVICE_NAME -n $HUB --complete true` 実行→ C2Dが表示される
3. コマンドを実行し続ける→何も取得されない

# MQTTの場合

MQTTの場合はCleanSessionフラグによって古いメッセージが取得されるかが決まるようです。

CleanSessionは[MQTTのプロトコル仕様](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)にも明記されています。

> If CleanSession is set to 0, the Server MUST resume communications with the Client based on state from the current Session (as identified by the Client identifier). If there is no Session associated with the Client identifier the Server MUST create a new Session.
> 

上記を要約すると下記の通り。 (ほぼ翻訳に近いが)

> CleanSessionが0なら保存されたセッション状態から再開しないといけない。セッション状態が保存されてなかったらセッション作成。
> 

[mosquitto](https://mosquitto.org/)を使って動きを見ていきます。

mosquittoでは`-c` をつけることでCleanSessionを無効化することができます。

まず、事前準備として変数定義とSASトークンの生成を行います。

```bash
# 必要な変数を定義
HUB_NAME=<hub name>
HUB_ENDPOINT=${HUB_NAME}.azure-devices.net
DEVICE_NAME=dummy1

# SASトークンの生成
az iot hub generate-sas-token -n $HUB_NAME
```

```bash
mosquitto_sub -d \
  --capath /etc/ssl/certs/ \
  -c \
  -V mqttv311 \
  -p 8883 \
  -h $HUB_ENDPOINT \
  -i $DEVICE_NAME \
  -u "$HUB_ENDPOINT/$DEVICE_NAME/api-version=2018-06-30" \
  -P "SASキー" \
  -t "devices/dummy1/messages/devicebound/#"
```

**CleanSession無効化されている場合**

1. スクリプトを止めた状態でポータルからC2Dを送る

2. `-c` 有りでスクリプト実行→1で送ったC2Dが受信される

**CleanSession有効化されている場合**

1. スクリプトを止めた状態でポータルからC2Dを送る

2. `-c` 無しでスクリプト実行→何も受信されない

ちなみにいずれの場合も、スクリプト実行後az CLIで受信処理を実行した場合、何も取得されず終了します。スクリプトを実行する前にaz CLIを実行すれば古いメッセージも取得できるところが、MQTTでサブスクライブ処理が走ることで古いメッセージはクリアされます。

これは[MQTTの仕様](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)にも書かれている通りの挙動となっているようですが、IoTHubに置いてセッションがどう定義されているのかがよくわかりませんでした。(セッションがそもそも確立されていないのにもかかわらずC2Dデータがクリアされているのは謎。IoTHub特有の挙動なのかもしれないです。)

> If CleanSession is set to 1, the Client and Server MUST discard any previous Session and start a new one. This Session lasts as long as the Network Connection. State data associated with this Session MUST NOT be reused in any subsequent Session
