---
layout: post
title: "OCUnitのLogic Testsではできないこと"
date: 2013-03-13 23:46
comments: true
categories: 
---

- `[UIApplication sharedApplication]`が絡むテスト
- `[NSBundle mainBundle]`が絡むテスト
- ドキュメントディレクトリへのアクセスが絡むテスト

いずれもApplication Testsでは可能です。

Logic Testsはアプリとは独立して実行されるから不可能で、
Application Testsはアプリの中で実行されるから可能というのは当然なのですが、
それがわからずにモヤモヤしたこともありました。

