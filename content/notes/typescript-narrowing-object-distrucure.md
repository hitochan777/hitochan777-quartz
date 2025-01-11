---
layout: ../../layouts/MarkdownPostLayout.astro
title: TypescriptのNarrowingはObject Distructuringするときは注意が必要
pubDate: '2022-04-27T09:00:00.000Z'
draft: false
---

Typescriptには[Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)というものがあり、プログラムのある時点までの実行可能なパスからその時点でとりうる型を推測してくる。

たとえば下記のように人を表すインターフェースPersonがあり、名前と好きな図形をキーとして持つ。

図形ShapeはCircleとSquareのUnion型となっている。どちらの図形型もkindというString Literalを持っている。

printShapeInfoはPersonを受けとり好きな図形に基づいた情報をコンソールに出力する関数だ。(コンソール出力処理という副作用が入ってしまっているが今回は気にしない)

Narrowingはswitch-caseの中で起きていて、person.favoriteShape.kindが"circle"ならCircle、"square"ならSquareと推論してくれる。なのでcaseブロックの中で、もう片方のインターフェースには存在しないキーにアクセスしているが、Narrowingが起きているおかげでエラーにならない。型補完も効くしめちゃ便利。

```typescript
interface Circle {
  kind: "circle";
  radius: number;
}
 
interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

interface Person {
  name: string;
  favoriteShape: Shape;
}

function printShapeInfo(person: Person) {
  switch (person.favoriteShape.kind) {
    case "circle":
      console.log(person.favoriteShape.radius);
      break;
    case "square":
      console.log(person.favoriteShape.sideLength);
      break;
    default:
      throw new Error("unknown shape") 
  }
}
```

さてここでprintShapeInfoを下記のように変えるとどうなるだろうか。

差分は関数の先頭でpersonをobject destructure (分割代入っていうんだっけ)してfavoriteShapeという変数に代入した上でそれをswitchの条件式で使用しているところ。

これだとradiusやsideLengthがないと怒られる。理由はNarrowingできているのはあくまでfavoriteShapeという変数の型であってperson.favoriteShapeではないからだろう。personから分割代入している時点でperson.favoriteShapeとfavoriteShapeは別扱いとなる。なのでfavoriteShapeがSquareだったとしてもswitchまでの間に例えばperson.favoriteShapeがCircleとなるよう代入してしまうと当然各変数が指す値の値は異なる。

下記コードの場合はそんなことはしていないので静的に検知できそうではあるがそこまで親切ではない。(動的なコード入れられたら対応できないからなんだろう)

```typescript
function printShapeInfo(person: Person) {
  const { favoriteShape } = person;
  switch (favoriteShape.kind) {
    case "circle":
    　// Property 'radius' does not exist on type 'Square'.
      console.log(person.favoriteShape.radius);
      break;
    case "square":
      // Property '
      console.log(person.favoriteShape.sideLength);
      break;
    default:
      throw new Error("unknown shape") 
  }
}
```
