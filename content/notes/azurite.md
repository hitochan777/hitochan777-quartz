---
layout: ../../layouts/MarkdownPostLayout.astro
title: Azure Functions実行時に出るBlobのエラーの解消方法
date: '2023-03-10T09:00:00.000Z'
tags: [Azure]
---

# 問題

Azure FunctionsのEventHubTriggerを使ったコードを実行すると下記のようなエラーが出た。  
x-ms-versionが古いと怒られている。Azure FunctionsのSDK?が使おうとしているBlob StorageのAPIバージョンがAzuriteがサポートしているものよりも新しいのが原因そう。

```console
An exception occurred while stopping the event processor instance with identifier '*****-****-****-****-************' for Event Hub: ********* and Consumer Group: $Default.  Error Message: 'The value for one of the HTTP headers is not in the correct format.
RequestId: ************

Status: 400 (The value for one of the HTTP headers is not in the correct format.)
ErrorCode: InvalidHeaderValue
Additional Information:
HeaderName: x-ms-version
HeaderValue: 2021-06-08
```

Azuriteのバージョンを `azurite --version` で確認すると、3.14.1であることが判明 (2023/3/10時点)。
3.14.1はリリースノート見ると2021年7月にリリースされているようなのでだいぶ古いが、[その時点のコード](https://github.com/Azure/Azurite/blob/v3.14.0/src/blob/utils/constants.ts#L99)を確認すると確かに`2020-10-02`がサポートされている最新のバージョンっぽい。 (なぜか3.14.1時点のタグがなかったので3.14.0のリンクだが)

Azuriteを最新にすれば解消されるかもしれないが、自分の場合Visual Studioの管理下にあるので勝手にバージョンを更新しても問題ないのかはわからない。多分大丈夫と思うが...  
そもそもBlob Storageはそれほどコストかからないので頑張ってEmulatorを使う必要もないのかもしれない。

下記にいくつか解決方法を(実証できていないものも含むが)挙げておく。

# 解決方法
* 方法1: AzuriteがAPIバージョンチェックしないようにして走らせる  
  azuriteを`--skipApiVersionCheck`オプションをつけて実行するるとAPIバージョンチェックしないようにできる。  
  もちろんバージョンチェックをしないので意図しない動きになるリスクもあるため自己責任で。

  ```powershell
  azurite --loose --location "C:\Users\username\AppData\Local\Temp\Azurite" --debug "C:\Users\username\AppData\Local\Temp\Azurite\debug.log" --skipApiVersionCheck
  ```

  Visual Studioを使っている場合は、Visual Studioを起動する前にコマンドプロンプトなどで上記コマンドを実行することでVisual Studio起動時に勝手にデフォルトのパラメータでAzuriteが起動してしまうのを防げる。
* 方法2: Azuriteのバージョンを上げる (試していないの動くか不明)
  * 方法2-1: Visual Studioのバージョンを上げる?
  * 方法2-2: Azuriteを手動でアップグレードする
