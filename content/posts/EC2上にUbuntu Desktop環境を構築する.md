---
tags:
  - tauri
  - ubuntu
  - aws
  - ec2
---

Ubuntu DesktopをEC2に構築した際のメモ。
# 背景
ローカルPCでTauriを用いたGUIアプリを構築しているがVSCodeとTauri Devサーバ同時起動しているとメモリが足りずフリーズする。
src-tauriをルートディレクトリとして起動すると固まりづらくなっているようには見えるがこれ以上原因追求に時間をかけられないと判断した。固まるとマシンを強制終了しないといけないのもかなり痛い。

そこでEC2上にUbuntu Desktopを構築することにした。

# 他に考えた解決策
* 
* 新しい高スペックマシンを調達する
	* 費用がかかる
	* Tauri以外の開発では特に困っていないし、長期的にTauriを用いた開発をするかもわからないので他の方法があるなら購入は避けたい
* Tauriをやめる
	* Tauriは興味があるため極力使いたい (個人的な嗜好)8
	* Tauriをやめるとしてもコアな部分はRustで書かれているのでできるだけ活用したい
		* Ankiのようにprotocol bufferを使うことでデスクトップアプリは別のフレームワークや言語で開発も可能だがTauriでいけるなら余計な工数を使わなくて済む

# Ubuntu Desktopを構築する方法

VNCとRDPを使うのがメインな様子。

## VNCとxRDPの比較

* VNC
	* PRO: ログイン中の既存セッションを共有することができる???
	* CON: ピクセル単位での共有なため帯域消費が大きい
* RDP
	* PRO: GUIをコントロール部やフォントなどグラフィカルな要素として捉えるため帯域消費が小さくVNCよりも高速である
	* CON: 既存セッションを共有することができない ???

## VNCを使う場合

https://ubuntu.com/tutorials/ubuntu-desktop-aws#2-setting-up-tightvnc-on-aws に従いTightVNCをインストール

VNC Serverの設定を変更。

```bash
#!/bin/sh

unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS

[ -x /etc/vnc/xstartup ] && exec /etc/vnc/xstartup
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources

export XKL_XMODMAP_DISABLE=1
export XDG_CURRENT_DESKTOP="GNOME-Flashback:Unity"
export XDG_MENU_PREFIX="gnome-flashback-"

gnome-session --session=gnome-flashback-metacity --disable-acceleration-check &
```

### 試してみて
VNCでもパフォーマンス面では気になるところはなかった。
UIが自分が普段使っているUbuntuのものと異なっていたが、デスクトップ環境がGNOME-Flashbackになっているところを適宜変更すればよさそう。

## RDPを使う場合
