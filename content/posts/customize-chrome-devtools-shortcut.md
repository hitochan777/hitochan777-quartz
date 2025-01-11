---
layout: ../../layouts/MarkdownPostLayout.astro
title: Chrome DevToolsでショートカットキーをカスタマイズする
date: '2021-07-01T09:00:00.000Z'
---

Chrome DevToolsでネットワークのオンライン/オフラインを切り替えれるのですが、わざわざDevToolsを開いてNetworkタブからOffline / No throttlingをマウスポチポチして切り替えるのも面倒だったのでショートカットとかないか調べてみました。

![](http://res.cloudinary.com/deg7fjtmj/image/upload/v1647875431/Untitled\_h7ngta.png "")

### ショートカットのカスタマイズを有効化

Chrome DevToolsのショートカットのカスタマイズはExperimental (v91時点で)であり、明示的に有効にしてあげないといけません。

DevToolsを開いた状態で`Ctrl + Shift + P` を押しコマンドパレットを開き、experimentと入力すると `Settings Show Experiments` が候補に出てくるのでそれを選びます。

(右上の歯車アイコンからでもExperimentの設定にはたどり着けます)

![](http://res.cloudinary.com/deg7fjtmj/image/upload/v1647875489/Untitled\_1\_uuzgyc.png "")

次に `Enable keyboard shortcut editor` にチェックを入れます。

これで有効化の設定は完了です。

![](http://res.cloudinary.com/deg7fjtmj/image/upload/v1647875497/Untitled\_2\_uvgp8r.png "")

### ショートカットをカスタマイズ

次にコマンドパレットから `Settings Shortcuts` を選択します。

![](http://res.cloudinary.com/deg7fjtmj/image/upload/v1647875508/Untitled\_3\_gt6tzc.png "")

ショートカットが設定できるアクションの一覧が並んでいます。

あとは、カスタマイズしたいアクションをホバーすると右側に編集アイコンが出てくるので、好きなショートカットを設定してください。

![](http://res.cloudinary.com/deg7fjtmj/image/upload/v1647875514/Untitled\_4\_l59u9i.png "")
