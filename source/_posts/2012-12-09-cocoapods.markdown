---
layout: post
title: "CocoaPodsを使ってみた"
date: 2012-12-09 15:56
comments: true
categories: 
---

最近、[CocoaControlsがCocoaPodsに対応した](http://www.cocoacontrols.com/posts/2012/12/03/cocoa-controls-now-supports-cocoapods)ようですね。

[以前の記事](blog/2012/10/27/xcode-git)で書いたように、いままで`git submodule`でライブラリを管理していました。
CocoaPodsのことは聞いてはいたのですが、"`git submodule`で十分じゃん"と思って使っていませんでした。
どうやらCocoaPodsはそれ以上の事をしてくれるようなので、試してみました。

## 導入手順

[cocoapods.org](http://cocoapods.org)に書いてある手順に従います。

```
gem install cocoapods
pod setup
```

プロジェクトのディレクトリに以下のような`Podfile`を作成します。

```
platform :ios, '5.0'
pod 'ISColumnsController', '~> 1.0.0'
```

`Podfile`に書いたライブラリをインストールします。

```
pod install
```

以上で導入は完了です。

元々のプロジェクト(`Hoge.xcodeproj`)とは別にワークスペースが(`Hoge.xcworkspace`)作成されるので、以降の作業ではこちらを使うようにします。
Project Navigatorは以下のようになっているはずです。

{% img /images/2012-12-09/pods.png %}

どうやらライブラリ群を`libPods.a`というスタティックライブラリにまとめて、リンクしているようです。


## CocoaPodsの良いところ

`git submodule`を直接使っている場合と比較したメリットを書きます。

### プロジェクトへの導入の自動化

`git submodule`はライブラリの**ソースコード**を管理するのであって、
どのようにXcodeプロジェクトに導入されるかまでは管理していません。
つまり、ライブラリを導入するには手動で以下の手順を行う必要があります。

- 導入に必要なファイルのみをXcodeプロジェクトに追加
- 必要に応じてフレームワークがあればリンクする。(`CoreData.framework`など)
- 必要に応じてコンパイルオプションを設定する。(`-fno-objc-arc`など)
- 必要に応じてリンカフラグを追加する。(`-ObjC`など)

また、ライブラリに以下のような変更があった場合、手動でプロジェクトを変更しなければなりません。

- ファイル構造が変わった
- リンクするフレームワークに変更があった

CocoaPodsはこういった手順を自動化してくれるようです。  
`Pods.xcconfig`を覗いてみると、その様子の一端を見ることができます。

### 導入可能か自動チェック

CocoaPodsは`Podfile`に書いたプロジェクトの環境とライブラリの環境を比較して、
そのライブラリが導入可能か自動的にチェックしてくれます。
例えば、先ほど`Podfile`に`platform :ios, '5.0'`と書きましたが、これはDeployment Targetを表していて、
iOS 5.0に対応していないライブラリは導入の時点で弾かれるようになっています。

Deployment Targetの他にも、ARCへの対応状況やOSXへの対応状況も考慮してくれるようです。


## まとめ

- CocoaPodsはXcodeプロジェクトの設定も含めたライブラリ管理をしてくれる。
- 導入可能性もチェックしてくれる

まだまだ使い込んでいないので良いことばかり書いてますが、実際的な問題もあるのかもしれません。  
ハマりどころがありそうだったら、また更新します。
