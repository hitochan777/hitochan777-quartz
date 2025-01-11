---
title: libp2pとWebRTCの違い
layout: ../../layouts/MarkdownPostLayout.astro
draft: false
tags:
  - rust
  - networking
---
libp2pはWebRTCなど複数のトランスポートプロトコル (これはOSI参照モデルでのトランスポート層のプロトコルのことではない)を用いてノード (ブラウザやサーバなど)間の通信をするためのネットワークフレームワーク。

https://github.com/libp2p/specs/pull/497