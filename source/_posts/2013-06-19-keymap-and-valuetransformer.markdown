---
layout: post
title: "MantleのようなノリでJSON>NSManagedObjectを楽にしたかった"
date: 2013-06-19 21:00
comments: true
categories: 
---

MantleのREADMEを読んでスゲーって思い、ヘッダーを読んでメンドクセーって思いました。  
CoreDataを使っていてもスゲーってところだけうまく取り込めないかと思って、考えました。

### Mantle

Mantleはいくらか前にGitHubがリリースしたモデルフレームワークです。  
MantleはJSONなどのkey-valueなものに対して、

- モデルのキーに対応するJSONのキーを定義する。
- 各キーに対応した`NSValueTransformer`を定義する。

というやり方で、JSONなどからモデルオブジェクトを作成します。  
具体的には、普通は以下のように書くコードを

```objectivec
- (id)initWithDictionary:(NSDictionary *)dictionary
{
    self = [super init];
    if (self) {
        self.hogeString = [dictionary objectForKey:@"hoge"];
        self.fugaNumber = [dictionary objectForKey:@"fuga"];
        self.piyoURL    = [NSURL URLWithString:[dictionary objectForKey:@"piyo"]];
    }
    return self;
}
```

以下のように書くことで同等の処理ができるようになります。

```
+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{
        @"hogeString": @"hoge",
        @"fugaNumber": @"fuga",
        @"piyoURL":    @"piyo",
    };
}

+ (NSValueTransformer *)piyoURLJSONTransformer
{
    return [NSValueTransformer valueTransformerForName:MTLURLValueTransformerName];
}
```

キーの対応と`NSValueTransformer`さえ提供すれば、同様にして`NSCoding`や`NSCopying`などの  
プロトコルにも適合できるというのもMantleの優れているところです。　

上記のコードのように値の操作がかなり隠蔽されてしまうため、デバッグしづらくなるのが  
個人的には少し気になりますが、そこは許すことにするという前提で話を進めます。


### 自分の場合

既にCoreDataを使って書いたコードがたくさんあったのと、MantleのCoreDataが絡む部分を
よく把握できていなかったことを考えて、Mantle自体の採用は見送りました。

- モデルのキーに対応するJSONのキーを定義する。
- 各キーに対応した`NSValueTransformer`を定義する。

というアイディアのみを採用してMantleを模倣したインターフェースを作り、  
`NSManagedObject`でもMantleの`MTLModel`と大体同じようなことができるようにしました。


### 感想

Mantleはモデルが軽量な場合に良さそうなので、良い機会があれば積極的に使いたいと思いました。  
CoreDataとMantleを合わせて使うのは、もう少し自分に技術がついたら試そうかなと思いました。

