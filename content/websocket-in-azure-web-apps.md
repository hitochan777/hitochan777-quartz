---
layout: ../../layouts/MarkdownPostLayout.astro
title: Azure Web AppsでWebSocketを使う
pubDate: '2021-06-26T09:00:00.000Z'
tags: [Azure]
---

LinuxのApp Service Planで動くAzure Web AppsでWebSocket通信をしようとしたら少しだけハマったのでメモ。
やったことは下記の2つ。

### ポータルでWebsocketの有効化

Configuration > General からWebSocketをOnにする。
デフォルトではoffになっている。

### SKUの変更

SKUをB2以上に上げる。([GitHubのイシュー参考](https://github.com/MicrosoftDocs/azure-docs/issues/49245))

F1 (無料)のLinuxではWebSocketは使えない様子。B2に上げてからB1に下げるとWebSocketが使えたりするらしい。自分の場合はB2→B1→F1と下げて行ったらF1でもWebSocketが使えてる。

ただ、長時間放置した後にアクセスしてもコールドスタートになっていないっぽいので本当にF1にスケールダウンできているかすら怪しい。
(ポータル見るとちゃんとF1になっているが...)

### 補足

[2013年の記事](https://azure.microsoft.com/ja-jp/blog/introduction-to-websockets-on-windows-azure-web-sites/#:~:text=WebSockets%20Connection%20Limits\&text=Shared%3A%20\(35\)%20concurrent%20connections,Standard%3A%20no%20limit)にSKUごとのWebSocket同時コネクション数の上限が書かれているが、今はどうなっているんだろう。
