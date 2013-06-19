---
layout: post
title: "ISRefreshControl 1.4.0をリリースしました"
date: 2013-06-09 01:25
comments: true
categories: 
---

### 内容

- iOS 4に対応
- `drawRect:`で描画する方式から`CAShapeLayer`に移行
- `UIActivityIndicatorView`の表示/非表示を切り替えるときに回転させる

　


### 理由

- iOS 4で使えないとクソって誰かが言ってた
- 描画周り(特に`beginRefreshing`後のアニメーション)の実装がダサくて耐え難かった
- `UIRefreshControl`は`endRefreshing`で`UIActivityIndicatorView`を回転させながら縮小させる  
  というようなことを[@DNPP](https://twitter.com/dnpp)氏がつけ麺を食べながら言ってたので確かめてみたら本当だった

