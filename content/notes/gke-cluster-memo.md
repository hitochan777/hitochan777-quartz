---
layout: ../../layouts/MarkdownPostLayout.astro
title: GKEでクラスタ作るときのメモ
date: '2019-01-15T09:00:00.000Z'
---

f1-micro インスタンスは 3 個以上でないと GKE クラスタが作れないが、
一度クラスタを作成してからインスタンスグループをスケーリングすることで一個でのクラスタに変更できる。([参考](https://snyke.net/post/kubernetes-playground/))
f1-micro はメモリが 0.6GB しかないので、自動でデプロイされるコンテナできちきちな状況。
ログのコンテナとか色々無効にすれば空きはでるものの ([参考](https://qiita.com/apstndb/items/1c3f8ea026ed6b27e357))、いろんなコンテナデプロイして試すにはやっぱりメモリがある程度欲しいよねってことで n1-standard-1 を使うことにした。
n1-standard-1 だとノードの数が 1 個でもクラスタは起動できるみたい。

1. クラスタを作成
  ```
  $ gcloud container clusters create hitochan-cluster \\
    --machine-type=n1-standard-1 \\
    --num-nodes=1 \\
    --disk-size=10 \\
    --no-enable-cloud-logging \\
    --enable-autorepair \\
    --preemptible
  ```
1. インスタンスグループの一覧を表示して名前をメモしておく。
  ```
  $ gcloud compute instance-groups managed list
  NAME                                            LOCATION       SCOPE  BASE_INSTANCE_NAME                        SIZE  TARGET_SIZE  INSTANCE_TEMPLATE                           AUTOSCALED
  gke-hitochan-cluster-default-pool-6618700a-grp  us-central1-a  zone   gke-hitochan-cluster-default-pool-6618700a  1     1            gke-hitochan-cluster-default-pool-6618700a  no
  ```
1. 2 でメモしたインスタンスグループ名を指定して、インスタンス数を変更する。節約したいので使わないときは 0 にしておく。
  ```
  $ gcloud compute instance-groups managed resize gke-hitochan-cluster-default-pool-6618700a-grp --size=0
  ```
