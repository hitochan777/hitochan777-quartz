---
layout: ../../layouts/MarkdownPostLayout.astro
title: shuttleで1プロジェクト内でAPIと定期処理を両方実行する
draft: true
date: '2024-05-12T09:00:00.000Z'
tags: [shuttle,rust,axum] 
---

# TL;DR;
shuttleで1プロジェクト内でAPIと定期処理を両方実行するには両方ラッピングする`Service`を独自定義してあげればいい

# Shuttleの概要

[Shuttle](https://www.shuttle.rs/)というRust専用のBaaS (Backend-as-a-Service)的なサービスでちょっとした個人開発をしている。
Shuttleではプロジェクトという単位に一つにつきバイナリを1つデプロイすることができる。

例えばAxumというフレームワークを使うにはRouterを定義して`ShuttleAxum` というShuttle専用ラッパーに変換してあげればShuttleで動かせる。

```rust
#[shuttle_runtime::main]
async fn main() -> shuttle_axum::ShuttleAxum {
    let router = Router::new().route("/", get(hello_world));

    Ok(router.into())
}
```

axum以外にもactix-webやrocketなど様々なフレームワークがサポートされている。

# APIと定期処理の実行における課題
プロジェクトに対してAPIとしての機能だけでなく定期的な処理をするようにしたい。
ただ上記の例だとmainの返り値がShuttleAxumとなっており
[Writing Cronjobs in Rust](https://www.shuttle.rs/blog/2024/01/24/writing-cronjobs-rust)では定期処理用の`Service`を独自で作成しmainから呼び出している。
Serviceについては後述する。

Still writing... 
