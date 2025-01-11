---
layout: ../../layouts/MarkdownPostLayout.astro
title: Axumのハンドラーでコンパイルエラー
pubDate: '2024-03-23T09:00:00.000Z'
tags: [rust, axum]
---

axumで下記のようなハンドラーを定義したがコンパイルエラーになった。

```rust
async fn awesome_handler_func(
    Path(user_id): Path<String>,
    Json(payloads): Json<Vec<Payload>>,
    Extension(awesome_service): Extension<Arc<SomeAwesomeService>>,
) -> StatusCode {
 // ...
}
```

↓コンパイルエラー

```
error[E0277]: the trait bound `fn(axum::extract::Path<std::string::String>, axum::Json<std::vec::Vec<Payload>>, Extension<Arc<SomeAwesomeService>>) -> impl Future<Output = axum::http::StatusCode> {awesome_handler_func}: Handler<_, _>` is not satisfied
   --> src/main.rs:93:42
    |
93  |         .route("/changes/:user_id", post(awesome_handler_func))
    |                                     ---- ^^^^^^^^^^^^^ the trait `Handler<_, _>` is not implemented for fn item `fn(Path<String>, Json<Vec<Payload>>, Extension<Arc<SomeAwesomeService>>) -> ... {awesome_handler_func}`
    |                                     |
    |                                     required by a bound introduced by this call
    |
    = help: the following other types implement trait `Handler<T, S>`:
              <axum::handler::Layered<L, H, T, S> as Handler<T, S>>
              <MethodRouter<S> as Handler<(), S>>
note: required by a bound in `post`
   --> /home/my_user/.cargo/registry/src/index.crates.io-6f17d22bba15001f/axum-0.7.4/src/routing/method_routing.rs:389:1
    |
389 | top_level_handler_fn!(post, POST);
    | ^^^^^^^^^^^^^^^^^^^^^^----^^^^^^^
    | |                     |
    | |                     required by a bound in this function
    | required by this bound in `post`
    = note: this error originates in the macro `top_level_handler_fn` (in Nightly builds, run with -Z macro-backtrace for more info)

```


[Axumのドキュメント](https://docs.rs/axum/latest/axum/handler/trait.Handler.html#debugging-handler-type-errors)に丁寧にハンドラーの型エラーをデバッグする方法が書かれており、その中にどのような関数に対してのHandler traitのブランケット実装が提供されているかが書かれている。

> Take no more than 16 arguments that all implement Send.
All except the last argument implement FromRequestParts.
The last argument implements FromRequest.

条件の一つに最後の引数が「FromRequestを実装していること」とある。
今回の例だと`Extension<Arc<SomeAwesomeService>>`がFromRequestを実装していないためブランケット実装が提供されておらずエラーになってしまっているようだ。

最後の引数を FromRequestを実装している`Json(payloads): Json<Vec<Payload>>` に変更するとエラーは解消された。
