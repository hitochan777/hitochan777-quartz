---
layout: ../../layouts/MarkdownPostLayout.astro
title: .editorconfigが親ディレクトリにある場合、Prettier CLI実行時に勝手にオプションが適用される
date: '2021-07-25T09:00:00.000Z'
---

## TL; DR;

- prettier CLI実行時に指定していないオプションのデフォルトが書き換わっているような事象が発生。
- 原因は.editorconfig。プロジェクト外の.editorconfigの設定がprettier実行時に読み込まれてしまう。
- 勝手にデフォルトが書き換わってるように見えるときはプロジェクト外に.editorconfigが無いかどうかを確認してみること

## 調査内容

インデントがスペースなファイルに対してprettierを実行するとなぜかタブに置き換わってしまっている事象が発生。

[公式ドキュメント](https://prettier.io/docs/en/options.html#tabs)を見ても `—use-tabs` はデフォルトで `false` なのに何故？と思い `--loglevel` をdebugにして実行してみるとたしかに `useTabs` が `true` になっている。

```bash
$ prettier index.ts -w --loglevel debug
[debug] normalized argv: {"_":["index.ts"],"color":true,"editorconfig":true,"loglevel":"debug","config-precedence":"cli-override","debug-repeat":0,"ignore-path":".prettierignore","plugin":[],"plugin-search-dir":[],"write":true}
[debug] resolve config from 'index.ts'
[debug] loaded options `{"useTabs":true,"endOfLine":"lf"}`
[debug] applied config-precedence (cli-override): {"endOfLine":"lf","useTabs":true}
index.ts 166ms
```

一行目のdebug出力を見ると `editorconfig` が `true` になっている。

なるほど、デフォルトではeditorconfigの設定も加味されるんだっけ。ただ、現プロジェクトにeditorconfigを入れた記憶はない。

まさかと思って親ディレクトリを見るといました。editorconfig。

しかもきっちりindent_styleがtabになってる。

```bash
root = true

[*]
indent_style = tab
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.yml]
indent_style = space
indent_size = 2
```

.editorconfigをどこで入れたか正直記憶にないぐらいだったので、削除して再度実行したらしっかりインデントはスペースになっていた。

.editorconfigを削除しなくても `[—no-editorconfig](https://prettier.io/docs/en/cli.html#--no-editorconfig)` でeditorconfigを無効化できそう。

ちなみにこの現象は[GitHubにissue化](https://github.com/prettier/prettier/issues/8303)されいる
