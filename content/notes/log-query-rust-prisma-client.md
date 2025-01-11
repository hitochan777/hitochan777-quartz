---
layout: ../../layouts/MarkdownPostLayout.astro
title: Prisma Rust Clientで実行ログを表示する
pubDate: '2023-05-14T09:00:00.000Z'
tags: [rust, prisma]
---

仕事と趣味でやっている技術領域が違いすぎて投稿内容に全く統一性がなく、ブログの方向性が見えないが
とりあえず今日も今日とて書いていく。

Prisma Client Rustで実際に実行されたログの叩き方がわからなかったので調査した。

ちなみに、Prisma Client RustはPrismaというORMのRustクライアント。
本家のJavascript/Typescriptクライアントと構造は同じでクライアントがprisma engineという中間層経由でDBMSとやりとりをする。

# TL; DR;

1. `tracing`と`tracing-subscriber`のcrateを入れる.
2. 実行コードの先頭で `tracing_subscriber::fmt::init();`を記述
3. `RUST_LOG=quaint=debug LOG_QUERIES=1 cargo run` でログを有効にしで実行.

# `tracing`と`tracing-subscriber` crateの導入

Rust Prisma Clientは内部的にtracingというログライブラリを使用しているためログ出力側もtracingを使う必要がある.

```bash
cargo add tracing tracing-subscriber
```

# ロガーの登録
部分的に別のロガーを使うといったこともできるようだが、
今回は簡単のため`tracing_subscriber::fmt::init();` でグローバルなロガーを登録.


# ログの有効化
- prisma engineが実際に実行したクエリをログとして吐くのだが、[ドキュメント](https://github.com/prisma/prisma-engines/tree/main/quaint#query-debug)によると、環境変数`LOG_QUERIES`を適当な値で設定すればログが出力されるようになる.
- `tracing_subscriber::fmt::init()`は環境変数 `RUST_LOG` を使うことにより[ログのフィルタができる](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/fmt/index.html#filtering-events-with-environment-variables).
  - prisma engineはquaintというSQLデータベスの抽象化層を経由してクエリを実行しているため、`RUST_LOG`で`quaint=debug`とすることでquaintのDEBUGレベル以上のログだけを出力することができる.
  - [ドキュメント](https://github.com/prisma/prisma-engines/tree/main/quaint#query-debug)にはINFOレベルで出力されると書かれているがDEBUGレベルで出力されていたのでinfoではなくdebugを設定

