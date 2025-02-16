---
tags:
  - tauri
  - rust
  - oauth2
  - oidc
---

# OAuth2.0の導入方法
[tauri-plugin-oauth](https://github.com/FabianLars/tauri-plugin-oauth) を入れるだけ。
認可コードを受け取るためのサーバを建てる方法を取っている (詳細は下記参照)。

# ネイティブアプリでのOAuth2.0

ネイティブアプリでのOAuth2.0は`OAuth 2.0 for Native Apps`というタイトルで[RFC8252](https://datatracker.ietf.org/doc/html/rfc8252)に纏められれている。

Device Authorization Grantも使えるんじゃないかと思ったがネイティブアプリやモバイルアプリ向けでないと[RFC 8628に記載がある](https://datatracker.ietf.org/doc/html/rfc8628#section-1)。

>  The device authorization grant is not intended to replace browser-
   based OAuth in native apps on capable devices like smartphones.

流れはWebアプリ上でのOAuth2.0とかなり似ている。違いとしてはWebアプリの場合はブラウザが直接認証リクエストを投げたり、認可コードを受け取っていたのに対して、ネイティブアプリではブラウザを介して (何らかの外部エージェントであればよくブラウザを使うことは必須ではない)これらのやり取りをするということだ。

認証リクエストを投げる場合は特定のURIをブラウザで開けばよい。
一方で認可コードを受け取る場合はいくつか方法がある。
(1) カスタムプロトコルを使う方法
(2) 特定URIのリダイレクト機能を使う方法
　OSによっては特定のURIが指定された場合URIにアクセスするのではなくアプリを開くといったことができるらしい。
(3) loopbackアドレスでlistenするローカルサーバにリダイレクトする方法

