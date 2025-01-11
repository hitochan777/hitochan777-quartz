---
layout: ../../layouts/MarkdownPostLayout.astro
title: ABC080 C Shopping Street
draft: false
pubDate: '2022-04-08T14:12:00.000Z'
---

[問題](https://atcoder.jp/contests/abc080/tasks/abc080\_c)

Atcoder Problems上では難易度は1130となっているが、5年ぐらい前なので今となっては茶色ぐらいの難易度に感じる。

### 考えたこと

時間帯は10個しか無いため単純にそれぞれの時間帯について開く開かないの組み合わせを見て利益が一番高いやつを求めればよさそう。

少なくとも1個の時間帯は開いていないといけないので2^10 - 1通り見ればよく、各組み合わせでN個の店とかぶっている時間帯を見る必要があるのでオーダー的にはだいたい1000 \* NでNはたかだか100なので10^5となり2 secに十分収まる。

### コード

かぶっている時間帯を計算するのに1の個数を文字列からカウントしており効率が悪いが時間帯が10個しか無いため特に問題ない。

1の個数はビット演算により定数時間で処理できる。[参考](http://www.mwsoft.jp/programming/java/java\_lang\_integer\_bit\_count.html)

Python 10で[int.bit\_coun](https://docs.python.org/3.10/library/stdtypes.html#int.bit\_count)t というの1の個数を算出するbuiltin関数が使えるようになったらしいが、atcoderではPython3 は3.8しか対応していない(はずな)ので使えない点に注意。

```python
N = int(input())

Fs = []
for _ in range(N):
  F = int("".join(input().split()), 2)
  Fs.append(F)

Ps = []
for _ in range(N):
  P = list(int(x) for x in input().split())
  Ps.append(P)

max_profit = -10**18
for i in range(1, 1 << 10):
  profit = sum(Ps[j][bin(i & f).count("1")] for j, f in enumerate(Fs))
  max_profit = max(max_profit, profit)

print(max_profit)
```
