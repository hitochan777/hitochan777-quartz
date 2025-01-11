---
layout: ../../layouts/MarkdownPostLayout.astro
title: Ratatuiのcomponent architectureスタータテンプレートを読む 
tags: [rataui,rust,tui]
draft: true
---

RustのTUIライブラリである[ratatui](https://ratatui.rs)にはアプリケーションアーキテクチャの一つとして[コンポーネントアーキテクチャ](https://ratatui.rs/concepts/application-patterns/component-architecture/)が紹介されている。
これはコンポーネント自体がステートやイベントハンドラーレンダリングといった処理を担う方法だ。
ReactやVueなどフロントエンドのライブラリでもこのアーキテクチャはよく使われるため個人的にはしっくり来る。

今回はratatuiがコンポーネントアーキテクチャのスタータテンプレートを公開しているのでコードリーディングしてみた。

かなりざっくりいうと各コンポーネントはイベントハンドラーやレンダリング処理などを実装する必要があり

コンポーネントは`Component` traitを実装する必要がある。
このtraitは
* 初期化処理 (init)
* イベントハンドラー
* handle_events)

* AppがターミナルのラッパーであるTuiに対してeventのポーリングをする
  * eventにはキー入力のイベントやレンダリングのイベントなどがある
    * レンダリングのイベントは指定されたフレームレートに毎に発行されるようになっていおり、レンダリングのイベントがレンダリングのアクションに変換され処理されることでレンダリングが実行される仕組みになっている。このレンダリングのアクションは定期的に発行される以外にもコンポーネントなどが手動で発行することもできるため何らかの理由で強制サイレンダリングする際にも使用できる。
* Appはeventに基づいてactionを生成する
  * App自身がeventに応じて生成する
  * コンポーネントがhandle_eventを実行した際に返り値としてactionを返すこともできる
* Appはactionをactionのキューにエンキュー
* Appはhandle_actionでactionに応じた処理をする
  * App自身がactionを処理する
  * コンポーネントがactionを処理する

<pre class="mermaid">
    sequenceDiagram
        Tui->>App: Event (キー入力や再描画など)
        App->>App: EventをActionに変換する 
        App->>action queue: Actionをエンキューする
        App->>Component: Componentのhandle_eventをEventとともに呼び出す
        Component->>Component: Eventを処理する
        Component->>App: EventをActionに変換しAppに返す
        App->>action queue: Actionをエンキューする
        action queue->>App: Actionをデキューする
        App->>App: App::handle_actionでアクションに応じた処理を実行する
        App->>Component: Componentのhandle_actionをActionとともに呼び出す
        Component->>Component: Actionに応じた処理をする
</pre>
