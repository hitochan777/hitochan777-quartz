---
tags:
  - bookreadlog
  - functional-programming
---
[Grokking Functional Programming](https://www.manning.com/books/grokking-functional-programming)はScalaを使ってFunctional Programming (FP)の意義、FPの実現方法、テストの仕方など幅広くカバーしている本。
ソースコード多めでかなり丁寧に説明されていた印象。

以下気になったところをまとめ。
# なぜPure Functionが重要か?
状態の管理する責務とと状態から値を算出する責務を両方持ったクラスを例にとって、Pureではない関数が存在するため誤った値を算出してしまう問題点を指摘。
それぞれの責務を分けPureにすることで不具合を解消することができる、というところから有用性を説いている。
読み過ごしたかもしれないがテストの容易性についてもここで軽く触れてほしかった感はある。

immutableでない(かもしれない)関数は危険。例えばJavaのListはmutableなため関数のシグネチャを見るだけではimmutableかはわからず実装も確認する必要がある。でないと呼び出し方によっては意図せず値が変更されて不具合につながる。
一方でScalaのListやStringはimmutableがnativeサポートされているので安心。

# Streamについて

Streamを使うことによってProviderとConsumerを粗結合にできるメリットがある。やりとりするデータの型さえ合意しておけばよく、データをどう使うかや何回データが送られてくるかお互い知る必要がない。

おもしろかったのが、Streamを用いてAPIコールを一定間隔で実行するときに一定間隔に値をgenerateするStreamを別で用意してAPIコール用のStreamとzipしていた点。
zipしたあと必要なのはAPIコール用のほうだけなのだがなんとzipしたあと片方だけ返してくれるutlity関数(zipLeft, zipRight)がscalaには用意されていて本当にFP向けに考えられているなと感じた。

# テストについて

* Property based Test vs Example based test
	* Exmaple based Test: 手動でテストケースのパターンを実装する手法
	* Property based Test: 制約を提示するだけで具体的なテストケース生成はツールに任せる方法。Example based Testだとパターンを考える必要があるが、いいパターンが思いつかないときはProperty based Testを勧めている。
* SUTは単一責務を持つように設計しSUTの責務に絞ってテストすべき。
	* データを何らかの方法で取得し、「整形すること」が責務であればデータを取得する部分はモックし整形する部分だけをテストする
	* データを取得することが責務な関数であれば実サービス (DBなど)を用意してIntegration Testする
		* Integaration TestでもIOやResourceオブジェクトを使ってリーダブルかつメンテ性のあるテストを実現すする

