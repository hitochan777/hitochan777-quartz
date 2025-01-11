---
layout: ../../layouts/MarkdownPostLayout.astro
title: Nuxt3のuseCookieでStringがNumberに変換されてしまう
tags:
  - nuxt3
draft: false
---
Nuxt 3の[`useCookie`](https://nuxt.com/docs/api/composables/use-cookie)で数値を表す`String`（例えば`123`）をcookieとして保存し読み出した際に自動的に`Number`（`123`）に変換されてしまう現象に遭遇したのでメモ。

これは、`useCookie`の`encode`オプションの[デフォルトでは文字列をそのままCookieとして保存している](https://github.com/nuxt/nuxt/blob/2ed819ab613f864aa1ef36289b43dfb89176165a/packages/nuxt/src/app/composables/cookie.ts#L33)のにも関わらず、デコード時はJSONとしてデコードするため起きている。
`"123"`をCookieに保存する場合は`123`という文字列がそのまま保存されるが、これはJSONでデコードした場合Numberになってしまう。
保存する際に文字列としてエンコードしてあげればデコード時も文字列として取得できるのだがそうはなっていない。

対策としてcookieの値を文字列のまま保持するには、`useCookie`の`encode`オプションで文字列としてエンコードしてあげればいい。

```typescript
const cookie = useCookie(
   'your-cookie-name', 
   { encode: (value) => JSON.stringify(value)}
)
```
