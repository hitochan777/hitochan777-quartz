---
layout: ../../layouts/MarkdownPostLayout.astro
title: TinyBaseの同期の仕組みを理解する
draft: false
tags: [local-first, code-reading]
---

# はじめに

今回は TinyBase という Local First なデータストアラッパーの同期の仕組みを見ていこうと思う。
Local First なソフトとはデータをクライアント側に保存することでオフラインでも動作するソフトのことだ。
オンライン時でも応答性の面でメリットがある。クラウドのデータストアと同期することが一般的だが、その場合でもまずローカルのデータストアに書き込んでからクラウドに同期することができるためだ。

最近、「Local First」という単語を目にすることが多くなってきたように感じる。
例えば、[localfirst.fm](https://www.localfirst.fm/)という Local First 専門のポッドキャストが登場したり、[LOCAL-FIRST CONF](https://www.localfirstconf.com/)というカンファレンスが開催されるようになったりしている。
Local First アプリを実現するための OSS やサービスも増えてきている。どのようなものがあるかは、[Syntax.fm の Local-First のエピソード](https://syntax.fm/show/793/the-local-first-landscape)を見てほしい。その中で今回紹介する TinyBase も紹介されている。

# TinyBase とは

公式サイトによると、[TinyBase](https://tinybase.org/)は「Local-first なアプリ向けのリアクティブなデータストア」だ。

データストアは[`Store`](https://tinybase.org/api/store/interfaces/store/store/)クラスで表現される。Store は Key-value 形式とテーブル形式の両方をサポートしている。

データはメモリ上に保存されるが、[Persister](https://tinybase.org/guides/persistence/)という永続化用のアダプターを使うことで、SQLite や IndexedDB など様々なデータベースに永続化できる。

# 同期機能

2024 年 7 月に v5.0 (The one you can sync) でデータストアの同期機能が追加された。
この同期のためのデータ構造として [MergeableStore](https://tinybase.org/api/mergeable-store/interfaces/mergeable/mergeablestore/)がある。このクラスは Store クラスに別のストアのデータをマージする機能を追加したラッパーのようなものだ。
また、このクラスは CRDT のデータ構造の一つである LWW (Last Write Wins) を使っている。

`MergeableStore` には別の `MergeableStore` の変更を反映したり、差分を取得するためのメソッドが提供されている。
ただ、どのように相手に差分を送信するかは `Synchronizer` の役割だ。
`Synchronizer` は同期プロトコルを抽象化したインターフェースであり、TinyBase ではこれを実装したクラスがいくつか提供されている。インターフェースを実装することで独自の同期プロトコルを実現することも可能だ。
ちなみにデータストアは Table 形式の場合、Tables の集合（以下では Root と呼ぶ） > Table > Row > Cell というツリー構造になっており、各ノードはハッシュ値を持っている。
このハッシュ値を同期先と同期元で比較することで、必要な差分のみを同期先に送信することができる。

以下では、これらのクラスがどのように同期を実現しているのか、コードをざっと読んだ内容を元に説明する。

# 同期処理のトリガー

`Synchronizer` の[`startSync()`](https://github.com/tinyplex/tinybase/blob/2d6af4a75de0a51e10cd5c4df78de178c07ff8df/src/synchronizers/index.ts#L259-L260)で同期を開始する。そうすると `Persister` の自動保存が開始される。

```typescript
const startSync = async (initialContent?: Content) =>
  await (await persister.startAutoLoad(initialContent)).startAutoSave();
```

詳細は省略するが、`startAutoSave` によってデータストアに変更があるたびに[`setPersisted`](https://github.com/tinyplex/tinybase/blob/2d6af4a75de0a51e10cd5c4df78de178c07ff8df/src/synchronizers/index.ts#L236)が呼ばれるようにイベントリスナーが登録される。
`setPersisted` は変更を引数として受け取るのだが、この引数はオプショナルである。`startAutoSave` でイベントリスナーが登録される前に `setPersisted` を引数なしで呼んでいる。

引数ありなしでの動作の違いは下記。

- 引数なし: [Root のハッシュ値 (`ContentHashes`) を `MergeableContent` から取得して相手に送信](https://github.com/tinyplex/tinybase/blob/2d6af4a75de0a51e10cd5c4df78de178c07ff8df/src/synchronizers/index.ts)
- 引数あり: [差分 (`ContentDiff`) を相手に送信](https://github.com/tinyplex/tinybase/blob/2d6af4a75de0a51e10cd5c4df78de178c07ff8df/src/synchronizers/index.ts#L242)

# 各種データを受け取ったときの動作

## 差分を受け取ったとき

`ContentDiff` にはペイロードの差分を `persisterLister` 経由で[`setContentOrChanges`](https://github.com/tinyplex/tinybase/blob/2d6af4a75de0a51e10cd5c4df78de178c07ff8df/src/persisters/index.ts#L136-L137)を呼ぶことで自身の`MergeableStore` に取り込む。

## ハッシュ値を受け取ったとき

`ContentHashes`を受け取ると`getChangesFromOtherStore()` が実行される。
受け取った側を A、送信側を B と呼ぶことにする。

- A: テーブルごとのハッシュ値を相手に送信
- B: ハッシュ値が違うテーブル ID とハッシュ値を返す
- A: 受け取ったテーブル名から Row のハッシュ値を取得し相手に送信
- B: ハッシュ値が異なる Row の ID とハッシュ値を返す
- A: 受け取った Row の ID から Cell のハッシュ値を取得し相手に送信
- B: ハッシュ値が異なる Cell の ID とハッシュ値を返す
  ...

という形で階層的にハッシュ値を交換し合うことで差分を取得する仕組みになっている。
取得した差分は [`mergeCellsOrValues`](https://github.com/tinyplex/tinybase/blob/2d6af4a75de0a51e10cd5c4df78de178c07ff8df/src/mergeable-store/index.ts#L270) という関数で Last Write Wins で更新される仕組みになっている。

# 所感

TinyBase を使うことで Local First なアプリを開発する上で必要となるアルゴリズムはケアしてくれるため、アプリロジックに集中できるのが強みだ。
きれいにインターフェース化されているため、仮に独自の永続化や同期アルゴリズムが必要になっても対応できるだろう。

懸念としては、データ数が多いとスケールしないのではないか、という点だ。
テーブルが小さいならそれほど問題にならないと思うが、テーブルの行数が多い場合、ある行を変更すると変更していない行のハッシュも含めて相手に送信する必要があるため、毎回の同期に必要な転送量が行数やカラム数に比例して大きくなるだろう。
また、データストア自体をメモリにすべて乗せる必要がありそうな点もスケーラビリティの観点から懸念がある。
