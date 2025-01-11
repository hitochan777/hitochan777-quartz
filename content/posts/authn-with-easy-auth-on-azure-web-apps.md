---
layout: ../../layouts/MarkdownPostLayout.astro
title: Azure App ServiceのAuthenticationで認証する際にハマったこと
date: '2021-04-16T09:00:00.000Z'
tags: [Azure]
---

Azure App Serviceには[Authentication (Easy Authとも呼ばれる)なる機能](https://docs.microsoft.com/en-us/azure/app-service/overview-authentication-authorization)があり、Azure AD (B2Cも含む)やソーシャルプロバイダーを用いた認証を簡単に組み込むことができるようになっている。

一般にはクッキーなどで管理された認証情報をサーバーに渡し、その情報をバリデートしてユーザ情報を取得するなどの一連の流れを自前で実装する必要がある。

Authenticationを使うことでApp Service上のサーバーへのリクエストヘッダーにアクセストークンやユーザ情報など必要な情報を詰め込んでくれるので、認証認可周りの実装負荷が大きく軽減できることになる。

今回は[この記事](https://blog.azure.moe/2020/01/20/azure-active-directory-b2c-%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6-web%E3%81%A8api%E3%82%92%E4%BF%9D%E8%AD%B7%E3%81%99%E3%82%8Btips/)を参考にしつつAzure AD B2Cというコンシューマー向けの認証プラットフォームとApp Serviceを連携することで、認証機能を手軽に実現しようとしたときにハマったポイントを備忘録的に残しておく。

# Implicit grantじゃないとWebアプリでエラーになるっぽい

## Implict grant有効化すれば行ける

Azure AD B2CのアプリのAuthenticationから認可エンドポイントがAccess tokensとID tokensを発行するように設定する。こうすることによってtoken用エンドポイントからトークンを発行するのではなく、認可時にトークンが得られるようになる様子 (つまりImplicit grant)。

![](http://res.cloudinary.com/deg7fjtmj/image/upload/v1647874702/Untitled_sgt3sc.png)

これを設定しないとAzure App ServiceでAuthenticationの設定をしてもWebアプリにアクセスした際に下記のようなエラーが出た。

```go
{"code":401,"message":"An error of type 'unauthorized_client' occurred during the login process: 'AADB2C90057: The provided application is not configured to allow the 'OAuth' Implicit flow.\r\nCorrelation ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\r\nTimestamp: 2021-04-09 10:06:00Z\r\n'"}
```

[Stackoverflow](https://stackoverflow.com/questions/67019433/how-to-add-authentication-on-azure-web-app-using-authentication-feature-via-azur)で質問した際にAuthorization code grantももちろん使えるぜ〜というコメントがあったが、どちらもチェックしないとエラーがでるのでどうしようもなさそう。

## Authorization code grant試したものの...

後述する `additionalLoginParams` で `response_type=code id_token` と指定しているためauthorizeのエンドポイントから直接id\_tokenが返却されている。(OIDCにおけるresponse\_typeは[この記事](https://darutk.medium.com/diagrams-of-all-the-openid-connect-flows-6968e3990660)が参考になる)

これにによって、implicit flowが必要となるのかなと思い、 `response_type=code` にしてB2Cの先程のチェックを外してみたら、 `authorize`と `./auth/login/aad/callback` に数回リクエストを繰り返した後最終的に `./auth/login/aad/callback` で401となり終了。

ただ リクエストにはちゃんと `code` が含まれていおり `authorize` からきちんとトークン生成用のコードは取得できてそう。

そもそもApp ServiceのAuthenticationが `response_type=code` に対応しているのか? がドキュメントを調べてもはっきりわからなかった。

[B2C自体はサポートしている](https://docs.microsoft.com/en-us/azure/active-directory-b2c/authorization-code-flow)ようだが...

Access code grantを使って認可ができる方法をご存知の方がいればぜひ教えていただきたいです 🙇

# Azure App ServiceのAuthentication v2だとAzure Resource Explorerが使えない?

App ServiceのAuthenticationは4月に新しくなり従来のAuthentication/AuthorizationはAuthentication (classic)となったみたい。新しいAuthenticationがv2と呼ばれているようだ。

問題はv2のAuthenticationを使っている場合、[Azure Resource Explorer](https://resources.azure.com/) (ポータルからは設定できない項目を設定できる) を使って `additionalLoginParams` を設定しようとすると、v2は設定できないぜ！って怒られる。

\~~これも[Stackoverflowで質問した](https://stackoverflow.com/questions/67067017/cannot-change-authsetting-of-web-apps-with-new-authentication-feature-enabled-fr/67120994#67120994)が回答がなく、~~結局v1 (classicの方)を使うことにした。
[公式ドキュメント](https://docs.microsoft.com/en-us/azure/app-service/app-service-authentication-how-to#updating-the-configuration-version) によるとCLIとかでAuthenticationの管理ができなくなるとのこと。
CLIなどは結局裏でREST APIを叩いており、Resource Explorerも同じくREST APIを使っているのでエラーになっているのだろうのこと。
なので現時点では、v2にマイグレーションしてしまっている場合はApp Serviceを再作成し、v1を使うようにするしか無いっぽい

# フロントエンドアプリをv1で認証するなら、API側 (Azure Functions)もv1でないといけない (確信ない)

これはドキュメントなどに書かれておらず自分の経験則のみによるものなので、実際は間違っている可能性がある。

もともとフロントエンド側もAPI側もどちらもv2のAuthenticationを使っていたのだが、上記の理由からフロントエンド側はv1にした。

そうすると、APIに対してちゃんと `Authorization: Bearer <フロントエンドアプリから取得したacess_token>`を指定してリクエストを送ると下記の結果が返ってきた。 (Status codeは401)

```
IDX10501: Signature validation failed. Unable to match keys:
```

ひょっとしてと思ってAPI側のAuthenticationをv1に変更する (要するにFunctionsの作り直す)とうまく呼べるようになった。。。謎。

# まとめ: Authenticationは便利だがドキュメントが少ない

App ServiceのAuthenticationは自前でトークンをパースしたりするなどの手間が減るのでめちゃ便利な感じではあるが、なんせドキュメントが乏しいので結構詰まったりする。(単純に自分の知識、実力不足もあるが...)
