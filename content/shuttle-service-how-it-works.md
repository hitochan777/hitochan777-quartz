---
layout: ../../layouts/MarkdownPostLayout.astro
title: shuttleでServiceが実行されるまでの流れ
draft: false 
pubDate: "2024-05-12T09:00:00.000Z"
tags: [shuttle, rust]
---

# はじめに

shuttle という Rust 専用の BaaS (Backend as a Service)では Service を shuttle のランタイムが実行してくれる。
Service にはメジャーなフレームワーク (actix-web や Axum)をラップした Service がデフォルトで提供されているが、自分で実装することもできる。
今回はこの Service がどのようなフローで実行されるのかコードを読んでざっくり調べたのでメモしておく。

# 実行までの流れ

[`::shuttle_runtime::__internals::start`](https://github.com/shuttle-hq/shuttle/blob/f00a0987206857f2e39a47a5a390f4c8f52b5859/codegen/src/shuttle_main.rs#L23-L24) が実行されることで `shuttle_runtime::main` で我々がアノテーションした関数が実行される。
アノテーションした関数は `__runner` として渡される。

```rust
pub(crate) fn tokens(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let mut user_main_fn = parse_macro_input!(item as ItemFn);
    let loader_runner = LoaderAndRunner::from_item_fn(&mut user_main_fn);

    quote! {
        fn main() {
            // manual expansion of #[tokio::main]
            ::shuttle_runtime::tokio::runtime::Builder::new_multi_thread()
                .enable_all()
                .build()
                .unwrap()
                .block_on(async {
                    ::shuttle_runtime::__internals::start(__loader, __runner).await;
                })
        }

        #loader_runner

        #user_main_fn
    }
    .into()
}
```

`::shuttle_runtime::__internals::start`の定義は `runtime/src/alpha.rs`の [`start`](https://github.com/shuttle-hq/shuttle/blob/f00a0987206857f2e39a47a5a390f4c8f52b5859/runtime/src/alpha.rs#L86-L87)にある。

`Alpha` という一見どういった役割をもつ struct かわからないものに runner を食わせて`Alpha` のインスタンスを生成している。
それを`RuntimeServer`に食わせて `server_builder` に Service として登録する。
`server_builder`は`tonic::Server::builder()`で生成されている。[tonic](https://github.com/hyperium/tonic)という rust 用の gRPC ライブラリらしい。
そして最後に `router.serve` で gRPC サーバーを起動しているようだ。

```rust
pub async fn start(loader: impl Loader + Send + 'static, runner: impl Runner + Send + 'static) {
    // (略)

    let router = {
        let alpha = Alpha::new(args.beta, loader, runner, token);

        let svc = RuntimeServer::new(alpha);
        server_builder.add_service(svc)
    };

    tokio::select! {
        res = router.serve(addr) => {
            match res{
                Ok(_) => println!("router completed on its own"),
                Err(e) => panic!("Error while serving address {addr}: {e}")
            }
        }
        _ = cloned_token.cancelled() => {
            panic!("runtime future was cancelled")
        }
    }
}
```

この gRPC サーバーは [`/runtime.Runtime/Load`や`/runtime.Runtime/Start` といったパスに反応するようになっており](https://github.com/shuttle-hq/shuttle/blob/f00a0987206857f2e39a47a5a390f4c8f52b5859/proto/src/generated/runtime.rs#L432-L433)、Shuttle ラインタイムのライフサイクルを gRPC ベースの API で管理できるようにしているようだ。
ちなみに `/runtime.Runtime/Start` が呼ばれると `StartSvc`の`call` によって `RuntimeServer`が持つ underlying なサービスである[`Alpha`の`start`が呼ばれる](https://github.com/shuttle-hq/shuttle/blob/f00a0987206857f2e39a47a5a390f4c8f52b5859/proto/src/generated/runtime.rs#L481)。

```rust
fn call(
    &mut self,
    request: tonic::Request<super::StartRequest>,
) -> Self::Future {
    let inner = Arc::clone(&self.0);
    let fut = async move { <T as Runtime>::start(&inner, request).await };
    Box::pin(fut)
}
```

`Alpha` の`start` の中でようやく[`service.bind` が呼ばれる](https://github.com/shuttle-hq/shuttle/blob/f00a0987206857f2e39a47a5a390f4c8f52b5859/runtime/src/alpha.rs#L398)。この `bind` こそが Shuttle の`Service` (Shuttle によるもとから提供されている ShuttleAxum だったり、我々がカスタムで定義した Service) の`bind`である。

`start` の中身は下記のような感じ。
Shuttle の`Service`を起動するだけでなく、kill receiver で kill 信号を受けたら Service を中断するようになっている。
どういうタイミングで kill 信号が発生するかまでは今回調べられていない。

```rust
        let handle = tokio::runtime::Handle::current();

        // start service as a background task with a kill receiver
        tokio::spawn(async move {
            let mut background = handle.spawn(service.bind(service_address));

            tokio::select! {
                res = &mut background => {
                  // 省略
                },
                message = kill_rx => {
                    match message {
                        Ok(_) => {
                            let _ = stopped_tx
                                .send((StopReason::Request, String::new()))
                                .map_err(|e| println!("{e}"));
                        }
                        Err(_) => println!("the kill sender dropped")
                    };

                    println!("will now abort the service");
                    background.abort();
                    background.await.unwrap().expect("to stop service");
                }
            }
        });
```
