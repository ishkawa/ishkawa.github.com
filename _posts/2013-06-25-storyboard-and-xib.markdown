---
layout: post
title: "xib/storyboardとの付き合い方について"
date: 2013-06-25 02:12
comments: true
categories: 
---

アプリが大きくなるとstoryboardの小回りの利かなさに泣きたくなることがあると思います。  
そうした反動からすべてのUIをコードで実装しているiOS開発者も少なくないと思います。

自分は全部storyboardにして痛い目にあってから、全部コードにしてまた痛い目に遭い、  
結局コードとxibとstoryboardを上手く使い分けるのが良いという結論に達しました。  
最近、やり方が定まってきてストレスを感じなくなってきたので方法をまとめます。

これから書くことは個人の見解ですが、自分のやり方を決める上では無駄にならないと思います。

　

### 使い分け方と理由

基本方針: 以下に挙げる条件にマッチする場合除いて、コードで実装を行います。  

### xibを使う条件

viewの複雑度が高い場合(subviewが2,3個以上の場合)にはxibを使います。  
xibを利用する理由は以下のような退屈なコードをたくさん書くのがつらいからです。  

```objectivec
UILabel *label = [[UILabel alloc] initWithFrame:CGRectZero];
label.backgroundColor = [UIColor clearColor];
label.textColor = [UIColor darkGrayColor];
label.textAlignment = UITextAlignmentCenter;
label.baselineAdjustment = UIBaselineAdjustmentAlignCenters;
label.shadowOffset = CGSizeMake(0.f, -1.f);
label.numberOfLines = 0;
label.frame = CGRectMake(10.f, 10.f, 100.f, 100.f);
label.autoresizingMask = UIViewAutoresizingFlexibleWidth;
```

これはstoryboardを使う理由にもなるのですが、この条件のみの場合にはxibを使います。  
storyboardの利用に対して消極的な理由は後半の方に書きます。  

逆に、`UIWebView`だけが単品で乗っているような、`UIViewController`の`loadView`を  
オーバーライドすれば済んでしまう場合にはxibを利用せずにコードのみで実装を行います。  
配置に関するコードは大体以下のようなもので済むと思います。

```objectivec
- (void)loadView
{
    self.view = [[UIWebView alloc] init];
}
```


### storyboardを使う条件

xibを利用する条件に加えて以下の3つを満たす場合にはstoryboardを部分的に利用します。  
この条件にマッチしやすいのはチュートリアルや設定画面などのViewControllerです。

- 十分に小さい単位で他の部分から切り出すことができる
- viewの再利用性が低い (特にUITableViewのStatic Cellsが適切な場合)
- segueなどのidentifierを設定する機会が少ない

十分小さい単位でアプリの他の部分から切り出せることを条件にしている理由は以下の3つです。

- storyboardが大きいとどこで何が定義されているのか把握し切れなくなる
- storyboardが大きいとコードに対応した箇所を探すのに時間がかかる
- storyboardが大きいと分業するの妨げとなる

再利用性の低さを条件にしている理由は以下の2つです。  
後者はViewの配置を決めている箇所を特定するまでに掛かる時間に影響するので、特に重要です。

- ViewControllerの再利用性が高い場合にはstoryboard自体が複雑になり、編集しづらくなる。
- `UITableViewCell`などのパーツは再利用できず、xibかコードを利用することになる。

segueなどのidentifierを設定する機会の少なさを条件にしている理由は以下の3つです。

- プログラムを書くのにいちいちstoryboardを見てidentifierを確認するのが面倒
- identifierをコードに手打ちするのが面倒な上に間違えやすい
- コード上でidentifierを見つけたとき、storyboardを確認しなければ正確な遷移がわからない。

以上の条件をクリアしていると、とても気持ち良くstoryboardを利用できると思います。  
実際、設定画面で利用してstoryboard固有のストレスを感じる機会は少なかったです。


　

### いままでに挑戦したやり方と感想

#### 全部コードで実装する

- Viewの配置の退屈なコードが増えて、プログラミングがタイピングスポーツになった。

#### xibが利用できる箇所は全部xibで実装する

- 特に大きな問題はないが無駄なxibがいくらかあって邪魔だった。
- 設定画面がswitch祭りになった。

#### storyboardが利用できる箇所は全部storyboardで実装する

- 再利用性があるパーツにはxibを使い出したりして、結局どこに何があるかわからなくなった。  
- 長い期間を置いてから再度プロジェクトを開いたらidentifierを探すのが面倒くさかった。

アプリの規模が十分に小さい場合には全部storyboardを利用した実装にしても問題なさそうです。  
これと関連して、プロトタイプにのみ利用するという人もいるようです。


--

おそらく違う考え方をする人もたくさんいると思うので、そういう人の意見も聞きたいところです。

