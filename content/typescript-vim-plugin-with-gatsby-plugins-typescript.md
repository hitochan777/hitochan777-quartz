---
layout: ../../layouts/MarkdownPostLayout.astro
title: typescriptのvim pluginとgatsby-plugins-typescriptを一緒に使う
pubDate: '2019-01-24t09:00:00.000z'
---

[gatsby-plugins-typescript](https://www.gatsbyjs.org/packages/gatsby-plugin-typescript/)で GatsbyJS を typescript で使えるようしていた。
で今日、typescript だから VSCode を使うみたいな状況を避けたかったので、[tsuquyomi](https://github.com/Quramy/tsuquyomi)という便利な Vim の typescript プラグインを入れてみた。

すると、以下のようなエラーで怒られた。

```
src/templates/blog-post.tsx:1:8 - error TS1192: Module '"/home/hitochan/developer/me/node_modules/@types/react/index"' has no default export.

1 import React from 'react'
```

エラーが言っていることは文字通りで、react には `default export` がないのにそれを `import` しようとしてるよ！というエラーだ。

具体的には以下のコード。

```javascript
import React from 'react'
```

なんで今更こんなエラーが出るようになったかというと、
gatsby-plugins-typescript は型チェックなどはせずに js にトランスパイルするだけなので気づかなかっただけ。

解決策は 2 つ。`tsconfig.json`を追加すれば他のファイルの変更はいらないので今回は 2 にした。
ちなみに`gatsby-plugins-typescript`は`tsconfig.json`に全く影響されないっぽいので、設定は gatsby-config.js でやる必要がある。

1. `import * as React from 'react'`で全ての`export`を`React`として`import`
2. `tsconfig.json`の`compileOptions`に以下のように`"esModuleInterop": true`を設定。

```json
{
  "compilerOptions": {
    ...
    "esModuleInterop": true,
    ...
  },
  ...
}
```
