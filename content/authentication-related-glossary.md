---
layout: ../../layouts/MarkdownPostLayout.astro
title: 認証周りの用語整理 (Token, Session, Cookie...)
pubDate: "2022-03-29T09:00:00.000Z"
draft: false
---

認証周りの用語の理解が曖昧だったので調べて整理してみた。(理解できたとは言っていない)

## 用語整理

### Session

- ユーザの認証後にアプリがユーザを認識するためのもの ([Auth0](https://auth0.com/blog/application-session-management-best-practices/) のブログを要約)。
  - Session が有効な間ユーザはアプリで一連の操作を行うことができる。
  - (上位から順に)アプリ層、IDaaS 層、IdP 層の層ごとに層がある。(もちろん IDaaS や IdP 使ってなかったらないが)
  - これがどういうことかというと上位層のセッションが切れてしまったとしても下位のセッションが生きて入れば上位のセッションを再ログインを促すことなく再生成することができるということ。

###  Cookie
- Cookie は何らかの情報をサーバーとクライアント間で共有するための特別なヘッダーであって必ずしも認証に使われないのだが、認証のコンテキスト下では Cookie は下記 2 種類に大別されるらしい ([Auth0 のブログ](https://auth0.com/docs/manage-users/cookies)を参照)
- Stateful Cookie
  - Session に対するポインター (Session ID) を保持する
    - Stateful というのはサーバー側で情報を保持するかどうかを指すらしい
- Stateless Cookie
  - Self-contained な Session。Stateful Cookie ならサーバー側で管理していた情報を Cookie 内に含めてしまう。
  - Open ID Connect で出てくる ID Token がこの部類なのではと思ったが、ID Token が Session トークンとして使えるかどうかはサービスによって違うっぽい ([参考](https://ritou.hatenablog.com/entry/2020/01/08/070000))
    - Auth0 は ID token 自体が Sesion トークンとして扱われる
    - Google は ID Token を受け取った側がアプリケーショントークンを作成することを想定している。
###  Token
- [StackOverflow の投稿](https://stackoverflow.com/questions/17000835/token-authentication-vs-cookies) によると Session ID (投稿内では auth ID とよんでいる) だけでなく他の認証情報も含むものが Token であると言っている。Self-contained な認証情報という点では Stateless Cookie と同じか。
- ただ、Cookie はサーバーとクライアント間での情報共有手段であるので Token を Cookie に乗せることもできるし、そうしない方法も取れるはず (Local Storage に保存したりとか)
- ちなみに Token というと JWT が使われることが多そう (自分の感覚 (汗))

## 認証方法

上記の用語整理から Cookie と Token はそもそも並列な関係ではないということがなんとなくわかったが、Auth0 の記事などでちらほら下記のような認証方法が比較されている。

- Cookie based authentication
  - 単純に Cookie をつかった認証方法
- Token based authentication
  - Cookie 以外を使った認証方法を指していそう (Authorization header とか)
  - Cookie based と比べたメリットとしてリクエストに明示的に組み込む必要があるので不必要にトークンを送るリスクが減る

## まとめ

Token とか Session とか Cookie とかごちゃまぜで語られることが多そうだが、コンテキストによって意味が異なって使われることがあるということは意識したほうがよさそう。
