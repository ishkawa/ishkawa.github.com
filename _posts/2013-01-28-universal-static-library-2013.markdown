---
layout: post
title: "Universal Static Libraryのビルド(armv7/armv7s/i386 )"
date: 2013-01-28 12:31
comments: true
categories: 
---

最近のUniversal Static Libraryのビルド方法を見かけなかったので、書いておきます。  
"最近の"と言っても変更点はarmv6がなくなってarmv7sが追加されただけです。

### 概要

何も難しいことはありません。

- 実機用にビルド(armv7, armv7s)
- シミュレーター用にビルド(i386)
- `lipo`でくっつける
- 必要なヘッダーもコピーする

### 実行例

[JSONKit](https://github.com/johnezang/JSONKit)のUniversal Static Libraryを作る例です。

```
xcodebuild -sdk iphoneos -arch armv7 -arch armv7s clean build
xcodebuild -sdk iphonesimulator -arch i386 clean build

rm -R Product
mkdir Product/

xcrun lipo -create build/Release-iphonesimulator/libJSONKit.a build/Release-iphoneos/libJSONKit.a -output Product/libJSONKit.a
cp JSONKit/*.h Product/
```

できたものを確認します。
```
xcrun -sdk iphoneos lipo -info Product/libJSONKit.a
```

```
Architectures in the fat file: build/Release-universal/libJSONKit.a are: i386 armv7 armv7s
```
できてますね。

### 補足

`/usr/bin/lipo`はarmv7sのことを知らないらしく、`lipo -info ...`としてもarmv7sとして表示してくれません。
Xcodeの`xcrun -sdk iphoneos lipo`ではarmv7sと表示されます。

### 参考
- [[iOS] Static Library (4) Universal Static Library](http://cocoadays.blogspot.jp/2010/11/ios-static-library-4-universal-static.html)
- [Compile Library for armv7s - cputype (12) and cpusubtype (11)](http://stackoverflow.com/questions/12549489/compile-library-for-armv7s-cputype-12-and-cpusubtype-11)

