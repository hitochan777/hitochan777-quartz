---
layout: ../../layouts/MarkdownPostLayout.astro
title: Azure Application Insightsのログをazcliからクエリする
pubDate: '2020-07-28T09:00:00.000Z'
---

ブラウザ上でAzure Application Insightsを使ってログ分析をすることが結構頻繁にあるのだが
ブラウザ経由での操作はどうしてもマウス操作が必要になったり、ページのレンダリング待ちは避けられないので、
結構面倒だったりする。

azcliでさっとログ分析ができないかと思って調べてみた。

# 方法

azcliでは標準でapplication insightsに対応するコマンドは入っておらず、extensionsを入れる必要がある。

azcliにはextensionなるものがあって拡張コマンドを入れたりすることができる。
extensionはPython Wheelである必要があるらしく、自分で作ろうと思えばつくれるっぽい。

application insightsのextensionを入れる。

```bash
az extension add --name application-insights
```

あとはクエリをたたくだけ。--analytics-queryの箇所にブラウザで入力しているクエリを入れる。
Application IDはApplication Insights > Configure > API Accessに書かれているApplication IDを入れる。

```bash
az monitor app-insights query --analytics-query "traces | limit 50;" --app <Application ID>
```
