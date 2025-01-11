---
layout: ../../layouts/MarkdownPostLayout.astro
title: vscode-neovimでノーマルモードに戻れない
date: '2021-09-13T09:00:00.000Z'
---

[vscode-neovim](https://github.com/asvetliakov/vscode-neovim)でノーマルモードに戻るキーバインディングをjjとjkに設定してみたのだが、jjもjk押してもノーマルモードから抜け出せない。

キーマップをいろいろ確認していると下記の通りESCをNOPしているところがあった。

```tsx
inoremap <esc> <NOP>
```

6, 7年以上前のことだと思うのだが、なるべくESCを押さないように強制的に無効にしていたのだった。

vscode-neovimではインサートモードの管理は完全にVSCodeに委ねており、jjとかjk押されたときにvscodeからneovimにノーマルモードに戻るよう入力を送信している。

vscode-neovimのコードを確認すると、[ノーマルモードに戻る際にESCを送っている](https://github.com/asvetliakov/vscode-neovim/blob/19991afdf7faf4739d1ebca90463293f7a915057/src/typing_manager.ts#L134)のが分かる。

```tsx
await this.client.input(`<Esc>${keys}`);
```

なので、プラグイン側はノーマルモードに戻れたと思いこんでいるが、neovim側はインサートモードのままなので不整合が生じてしまっているっぽい。

対策としては下記のようにvscodeからneovimを起動しているときは上記のキーマップを無効にするれば正常に動作した。

```tsx
if !exists('g:vscode')
  inoremap <esc> <NOP>
endif
```

使ってみてインサートモード以外実質neovim上で操作ができるため、プラグインなどの恩恵を受けられる点でかなり魅力的だと思ったのだが...

他にもinit.vimのキーマップがvscode-neovimと相容れないものがあるのかわからないが、勝手にファイルが開いたり、ノーマルモードに戻る際に直前に入力されたテキストがコピーされたりと、挙動が不自然な点が多い。

バージョンもまだ1.0.0にもなっていないことだし、それまではvscode-vimを使い続けようと思う。
