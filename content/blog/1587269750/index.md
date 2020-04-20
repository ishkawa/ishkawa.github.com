---
title: "CircleCIでbuild matrixを構成する"
date: 2020-04-19 09:00 +0900
description: ""
---

いつの間にかCircleCIのジョブにパラメーターを設定できるようになっていた。そして、パラメーターの組み合わせでbuild matrixを構成できるようになっていた。昔に設定した時にこれらの機能がなくて憤慨していた記憶があるので、比較的最近に導入された機能だと思う。

## ジョブのパラメーターとbuild matrix

ジョブのパラメーターは、ステップが共通した複数のジョブを1つにまとめる時に役立つ。

例えばモバイルアプリの開発では、ストアにリリースされるアプリのビルドの他に、接続先を開発用サーバーに変更したアプリのビルドや、署名の方法を変更したアプリのビルドなどが必要になる。この差分をパラメーターとして定義しておけば、ジョブを1つにまとめることができ、各々のビルドに対するジョブを1から書く必要はなくなる。

build matrixは、ジョブのパラメーターを組み合わせて構成するビルド群のこと。サーバーにproductionとdevelopmentがあり、署名の方法にApp StoreとAd Hocがあった場合、パラメーターの組み合わせには以下の4つがある。

- production / App Store
- production / Ad Hoc
- development / App Store
- development / Ad Hoc

## CircleCIの設定

以下の手順でbuild matrixを構成できる。

- `jobs`で`parameters`を定義する。
- `workflows`の`jobs`で`parameters`のmatrixを定義する。

```
version: 2.1

jobs:
  build:
    parameters:
      server:
        type: string
      codesign:
        type: string
    steps:
      - checkout
      - run: echo "<< parameters.server >> << parameters.codesign >>"

workflows:
  build:
    jobs:
      - build:
          matrix:
            parameters:
              server: ["development", "production"]
              codesign: ["appstore", "adhoc"]
```

これで、1つのジョブで4つのビルドを担えるようになった。

## 参考ドキュメント

- [Reusable Config Reference Guide](https://circleci.com/docs/2.0/reusing-config/#authoring-parameterized-jobs)
- [Configuring CircleCI](https://circleci.com/docs/2.0/configuration-reference/#matrix-requires-version-21)
