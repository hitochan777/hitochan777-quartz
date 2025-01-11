---
layout: ../../layouts/MarkdownPostLayout.astro
title: Flutterでスナックバーを出す 
date: '2023-02-26T09:00:00.000Z'
---

Reactライクにクロスプラットフォームなアプリがかけるところに魅力を感じ最近はFlutterの勉強をしている。

ボタンが押されたときとかにスナックバーを出したい。
MaterialAppのScaffoldを使っているのであればScaffoldMessengerというものを使えば良い。
具体的には下記のような感じ。

```dart
ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
      content: Text("fabbed!"),
));
```

ビルドコンテキストで一番近い親のScaffoldMessengerに対してスナックバーを出す指示を送る感じ。
なので、注意点としては`ScaffoldMessenger.of(context)` が実行されたウィジェットより上の階層でScaffoldMessengerがいないとエラーになるということ。  
下記のサンプルコードではスナックバーを表示するロジックをHomeというウィジェット内で実行しており、そのウィジェットをMyAppというウィジェットで使っている。そのためHomeからみると親としてMyApp内でScaffoldMessengerが定義されているので (正確にはMaterialApp)、ScaffoldMessengerを見つけることができる。  
一方でもしHomeに切り出さずMyApp内でスナックバー表示ロジックを実行すると、MyAppより上の階層にはScaffoldMessengerはいないのでエラーになる。


```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
          appBarTheme: const AppBarTheme(backgroundColor: Colors.amber)),
      debugShowCheckedModeBanner: true,
      home: const Home(),
    );
  }
}

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        floatingActionButton: FloatingActionButton(
            onPressed: () => _showToast(context),
            child: const Icon(Icons.ac_unit)),
        appBar: AppBar(centerTitle: true, title: const Text("hoge")),
        body: const Center(child: Text("hello world!")));
  }

  void _showToast(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
      content: Text("fabbed!"),
    ));
  }
}
```
