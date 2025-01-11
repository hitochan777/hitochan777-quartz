---
layout: ../../layouts/MarkdownPostLayout.astro
title: AstroでLaTeXを使う
pubDate: '2023-02-06T09:00:00.000Z'
---

markdownが標準サポートされているとはいえ、LaTeXまではサポートされていないようなので導入方法を調べてみた。

1. まずmarkdown内でのLaTeXをパースできるようにremark-mathを、markdownのASTをKaTeX用のHTMLに変換するためのrehype-katexを入れる。

    ```bash
    pnpm add remark-math rehype-katex
    ```

    `astro.config.mjs` でインストールしたパッケージを使うように記載する。
    ```json
    export default defineConfig({
      ...
      markdown: {
        remarkPlugins: [
          'remark-math',
        ],
        rehypePlugins: [
          ['rehype-katex', {
            // Katex plugin options
          }]
        ]
      },
      ...
    });
    ```

2. KaTeXのスタイルシートやスクリプトを読み込むようにする

    KaTeXのバージョンは本記事執筆時とは変わっている可能性があるので、公式ページから最新を見るようにすること。

    ```html
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css" integrity="sha384-vKruj+a13U8yHIkAyGgK1J3ArTLzrFGBbBc0tDp4ad/EyewESeXE/Iv67Aj8gKZ0" crossorigin="anonymous">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js" integrity="sha384-PwRUT/YqbnEjkZO0zZxNqcxACrXe+j766U2amXcgMg5457rve2Y7I6ZJSm2A0mS4" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05" crossorigin="anonymous"
        onload="renderMathInElement(document.body);"></script>
    </head>
    ```
