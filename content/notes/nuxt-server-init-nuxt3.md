---
layout: ../../layouts/MarkdownPostLayout.astro
title: Nuxt3でNuxt2のnuxtServerInitを実現する
pubDate: "2024-01-31T09:00:00.000Z"
tags: [nuxt3]
draft: false
---

Nuxt2 では[`nuxtServerInit`](https://v2.nuxt.com/docs/directory-structure/store/#the-nuxtserverinit-action)という Vuex のアクションを使うことで SSR の最初に何らかの情報を commit してクライアントでも利用可能なグローバルなステートを持つことができた。何らかの情報というのは例えばリクエストからセッション情報が挙げられる。

Nuxt3 には`nuxtServerInit`はないがいくつかの代替案がある。[このブログ](https://krutiepatel.com/blog/nuxt-server-init-where-is-it-in-nuxt-3/)で紹介されているいくつかの方法のうち本記事では Nuxt Plugin と useState を組み合わせる方法を紹介する。

## TL; DR;

composables/useUser.ts
```typescript
export const useUser = () =>
  useState<User | null>("user", () => {
    // リクエストヘッダーなどからユーザ情報を抽出する
    const user = extractUserInfoFromReq();
    return user;
  });
```

plugins/00.init.server.ts
```typescript
export default defineNuxtPlugin(() => {
  useUser();
});
```

## useState でグローバルなステートを作成する  
   useState は Nuxt3 で導入されたリアクティブかつ SSR 対応なグローバルステートを作成・使用するための composable である。  
   useState は SSR および CSR 横断で指定たされたキーで初めて呼び出されるときに初期化処理が走る。

   ```typescript
   const useUser = () =>
     useState<User | null>("user", () => {
       // リクエストヘッダーなどからユーザ情報を抽出する
       const user = extractUserInfoFromReq();
       return user;
     });
   ```
## Plugin で useUser を呼び出す  
`nuxtServerInit`のように SSR の最初に実行してグローバルなステートをセットし後続の処理で使えるようにするために useState を Plugin で呼び出す。  
Plugin は route middleware よりも先に呼び出される (TODO: 裏取り) ためで route middleware で useState を呼ぶと例えば他の Plugin でグローバルなステートを使いたくてもまだセットされていない、という状況になってしまう。  
そのため全てのコードで利用可能にするために Plugin で実行する必要がある。
あとは user にアクセスしたいコンポーネントで`useUser`を呼び出せばよい。

```typescript
export default defineNuxtPlugin(() => {
  useUser();
});
```

下記のように`provide`を使うことで`NuxtApp`に`$user`という名前でヘルパー関数を登録することができるが、できるだけグローバルな名前空間を汚染してしまうため[composables の使用が推奨されている](https://nuxt.com/docs/guide/directory-structure/plugins#providing-helpers)。

```typescript
export default defineNuxtPlugin(() => {
  const user = useUser();
  return {
    provide: {
      user,
    },
  };
});
```

Plugin も実行順が定義されておりデフォルトではファイル名のアルファベット順に実行される。そのため一番最初にするには 00.init.ts のように若いインデックスをファイル名にしておく。

ファイル名で実行順が決まるのはメンテ性に優れていないと個人的に考えている。これは、依存関係に変更があったらファイル名を変更する必要が出ることがあるため。
明示的に依存関係を定義するのに[`dependsOn`](https://nuxt.com/docs/guide/directory-structure/plugins#plugins-with-dependencies)というフィールドがある。(オプション形式での指定が必要)

```typescript
export default defineNuxtPlugin({
  name: "a",
  dependsOn: ["b"],
  setup() {
    const user = useUser();
    return {
      provide: {
        user,
      },
    };
  },
});
```

また、サーバーサイドでしか実行しないようにするためにファイル名を`*.server.ts`という名前にするか Plugin の先頭で下記のようにクライアントサイドでの実行なら return するようにしてもよい。

```typescript
export default defineNuxtPlugin(() => {
  if (process.client) {
    return;
  }
  useUser();
});
```
