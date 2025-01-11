---
title: Shuttle.rsからShuttle.appに移行する
layout: ../../layouts/MarkdownPostLayout.astro
draft: false
tags:
  - rust
  - shuttle
---
ついこないだShuttleからメールが
「shuttle.rsは2025年1月31日にretireするため新しいプラットフォームであるshuttle.appに移行していく必要がある」といった内容のメールが来ていた。
[公式ブログ](https://www.shuttle.dev/blog/2024/10/10/shuttle-redefining-backend-development)でも10月にアナウンスされていた。shuttle.appの方がパフォーマンスなど様々な面で改善しているらしい。
Microsoft Azureだと少なくともアナウンスから1年とか2年は猶予が与えられている印象があり、Shuttleに関しては4ヶ月ぐらいしかないのでかなり攻めているなと思った。
ただ、サービス提供者としては確かにレガシーなプラットフォームは負の遺産になるので早く閉じたいというのはよく分かる。

[公式の手順](https://docs.shuttle.dev/platform-update/migration)に従って移行したときのメモを残しておく。
# 1. 最新のCLIに更新

LinuxとMacは下記で更新できる。
```bash
curl -sSfL https://www.shuttle.dev/install | bash
```

更新するとcargo shuttleに加えてshuttleコマンドが使えるようになり、shuttleのほうが新しいプラットフォーム用のCLIになっている。

# 2. Shuttle関連のcrateを更新する

`Cargo.toml` を下記のバージョンを最新に更新 (2024/12/14時点)。
shuttle-runtime以外にもshuttleのcrateを使っていれば更新する必要がある。
自分の場合はshuttle-axumを使っているのでそちらも合わせて更新。

```toml:Cargo.toml
shuttle-runtime = "0.49.0"
shuttle-axum = "0.49.0"
```


`Shuttle.toml`で`name`が使えなくなっている。
これまでは`name`を使うことによってデプロイ先プロジェクト名をカスタマイズすることができた (デフォルトはcrate名だったかディレクトリ名だったか忘れたが)。

新しいCLIでは[`shuttle project link`](https://docs.shuttle.dev/docs/projects#project-linking) を使ってプロジェクト名をカスタマイズすることができる。

```
shuttle project link --name my-project
```

# 3. Shuttleのエンドポイントを使っている箇所の更新

新しいプラットフォームではホスト先が `*.shuttleapp.rs`から`*.shuttle.app` に変わっているためアプリ内でドメインをしている箇所があれば更新が必要。

# 4. GitHub Actions

[公式ドキュメント](https://docs.shuttle.dev/platform-update/migration#8-optional-update-github-action)に従って
* GitHub Actionsの `shuttle-hq/deploy-action@main` を`shuttle-hq/deploy-action@v2`に更新
* deploy-keyはshuttle-api-keyに変更
* project-idを追加。これに伴ってPROJECT_IDをGitHub ActionsのSecretに追加
```
      - uses: shuttle-hq/deploy-action@v2
        with:
          shuttle-api-key: ${{ secrets.SHUTTLE_API_KEY }}
          project-id: ${{ secrets.PROJECT_ID }}

```