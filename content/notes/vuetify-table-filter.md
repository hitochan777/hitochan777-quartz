---
title: Vuetify3のv-data-tableのfilterの落とし穴
layout: ../../layouts/MarkdownPostLayout.astro
tags: [vuetify3, vuetify2, vuetify]
---

Vuetify には v-data-table というフィルタやページネーションなど便利な機能を備えたテーブルコンポーネントがある。
カラムのごとの設定できる[headers](https://vuetifyjs.com/en/api/v-data-table/#props-headers)と言う props があり、カラムごとのフィルタを設定するには下記のように`filter`にフィルタ用関数を渡せばよい。
フィルタ関数はアイテム情報やクエリを引数として受けとりマッチしたかどうかを boolean で返す関数だ (下記の例では必ず true を返している)。

```vue
<template>
  <v-data-table :headers="headers" :items="desserts"></v-data-table>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        {
          value: "name",
          title: "Dessert (100g serving)",
          filter: () => true,
        },
        { value: "calories", title: "Calories", filter: () => true },
        { value: "fat", title: "Fat (g)", filter: () => true },
      ],
      desserts: [
        {
          name: "Frozen Yogurt",
          calories: 159,
          fat: 6.0,
        },
        {
          name: "Ice cream sandwich",
          calories: 237,
          fat: 9.0,
        },
        {
          name: "Eclair",
          calories: 262,
          fat: 16.0,
        },
      ],
    };
  },
};
</script>
```

この`filter`は Vuetify2 からあり Vuetify3 でも最近(3.6.8)で実装された。
上記のコードを Vuetify2 に食わせると filter が true を返すため必ずすべてのアイテムが表示される。しかし、Vuetify3 では何もマッチしない.  
これは[`filter-mode`](https://vuetifyjs.com/en/api/v-data-table/#props-filter-mode)という props のデフォルトが `intersection`となっているための様子。
`intersection`のドキュメントを見ると...

> intersection: There is at least one match from the custom filter, and all columns match the custom key filters.

「少なくとも 1 つのカラムで`custom-filter`がマッチして、かつ、すべての`custom-key-filter`がマッチしたものがマッチする」挙動らしい。
`custom-filter`というのは`custom-key-filter`を使っていないカラムに適用されるフィルタ関数であり、上記の例のようにすべてのカラムに対して`filter`を設定している場合は`custom-filter`が少なくとも 1 つマッチすることはありえないため何もマッチしないという動きになっているようだ。

Vuetify2 にも`filter-mode`はあってデフォルトは`intersection`である。`intersection`はドキュメントで下記のように説明されている。

> intersection: There is at least one match from the default filter, AND all custom column filters match.

Vuetify3 では`custom filter`となっているところが`default filter`になっている以外は同じに内容に読める。
更に今回は custom filter は使っていないので Vuetify3 のドキュメントの custom filter は default filter と読み替えてもよいため、この場合同じ内容になるはずだ。
しかし Vuetify2 と Vuetify3 では挙動が異なる。

ということで何が正しいのかわからないので[イシュー](https://github.com/vuetifyjs/vuetify/issues/19970)を作成した。

ちなみに workaround として`filter-mode`を`every`にすれば全カラムに`filter`を設定している場合に全 filter がマッチした場合のアイテムを返すことができるようになる。  
Vuetify2 の intersection は Vuetify3 の every と同じ挙動になっているように見える。Vuetify3 の intersection のユースケースは何なんだろう。
