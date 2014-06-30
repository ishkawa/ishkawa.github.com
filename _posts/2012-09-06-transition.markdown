---
layout: post
title: "UINavigationControllerのトランジションをBlocksで記述するカテゴリ"
date: 2012-09-06 13:07
comments: true
categories: 
---

UINavigationControllerのpush/pop時のトランジションは左右にスライドするものですが、  
これをカスタマイズするためのTransitionというカテゴリを書きました。  

アニメーションの以下のフェーズ毎に`fromView`と`toView`の配置を指定することで、  
独自のトランジションを記述することができます。  

- アニメーション前の配置
- アニメーション
- アニメーション後の処理

インターフェースは以下の形式です。

```objectivec
[navigationController pushViewController:viewController
                                duration:.3f
                              prelayouts:^(UIView *fromView, UIView *toView) {
                                  ;
                              }
                              animations:^(UIView *fromView, UIView *toView) {
                                  ;
                              }
                              completion:^(UIView *fromView, UIView *toView) {
                                  ;
                              }];
```

```objectivec
[navigationController popViewControllerWithDuration:.3f
                                         prelayouts:^(UIView *fromView, UIView *toView) {
                                             ;
                                         }
                                         animations:^(UIView *fromView, UIView *toView) {
                                             ;
                                         }
                                         completion:^(UIView *fromView, UIView *toView) {
                                             ;
                                         }];
```

コードはGitHubで公開しています。   
一度デモアプリを動かしてみてください。  
[UINavigationController-Transition](https://github.com/ishkawa/UINavigationController-Transition)  

READMEにも書いておきましたが、毎回上記のコードを呼ぶのは大変なので、  
これらをラップした自分用のカテゴリを書くと使いやすいと思います。

