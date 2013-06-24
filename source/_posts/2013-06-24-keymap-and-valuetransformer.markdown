---
layout: post
title: "MantleのようなノリでJSON>NSManagedObjectを楽にしたかった"
date: 2013-06-24 21:00
comments: true
categories: 
---

MantleのREADMEを読んでスゲーって思い、ヘッダーを読んでメンドクセーって思いました。  
CoreDataを使っていてもスゲーってところだけうまく取り込めないかと思って、考えました。

--

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

--

### 自分の場合

既にCoreDataを使って書いたコードがたくさんあったのと、MantleのCoreDataが絡む部分を
よく把握できていなかったことを考えて、Mantle自体の採用は見送りました。

- モデルのキーに対応するJSONのキーを定義する。
- 各キーに対応した`NSValueTransformer`を定義する。

というアイディアのみを採用してMantleを真似したインターフェースを作り、  
`NSManagedObject`でもMantleの`MTLModel`と大体同じようなことができるようにしました。


#### 実装方法

Mantle方式の値のセットが出来る`NSManagedObject`の抽象的なサブクラスをつくります。  
```
@interface ISKeymapManagedObject : NSManagedObject
 
+ (NSDictionary *)JSONKeymap;
+ (NSDictionary *)JSONValueTransformerNames;
 
- (id)initWithDictionary:(NSDictionary *)dictionary
                  entity:(NSEntityDescription *)entity
    managedObjectContext:(NSManagedObjectContext *)context;

@end
```

`NSManagedObject`のキーとJSONのキーの対応を`JSONKeymap`というメソッドで定義し、
`NSManagedObject`のキーと`NSValueTransformer`の対応を`JSONValueTransformerNames`というメソッドで定義します。

```objectivec
+ (NSDictionary *)JSONKeymap
{
    return @{};
}

+ (NSDictionary *)JSONValueTransformerNames
{
    return @{};
}
```

そして、`NSDictionary`を引数に取るイニシャライザを定義して、これらの対応を行います。
`NSManagedObject`はKVCに準拠しているので、以下のようにして`setValue:forKey`で値をセット出来ます。

```objectivec
- (id)initWithDictionary:(NSDictionary *)dictionary
                  entity:(NSEntityDescription *)entity
    managedObjectContext:(NSManagedObjectContext *)context
{
    self = [super initWithEntity:entity insertIntoManagedObjectContext:context];
    if (self) {
        NSDictionary *keymap = [[self class] JSONKeymap];
        NSDictionary *valueTransformerNames = [[self class] JSONValueTransformerNames];
        for (NSString *objectKey in [keymap allKeys]) {
            id dictionaryKey = [keymap objectForKey:objectKey];
            id value = [dictionary objectForKey:dictionaryKey];
            
            NSString *transformerName = [valueTransformerNames objectForKey:objectKey];
            if (transformerName) {
                NSValueTransformer *transformer = [NSValueTransformer valueTransformerForName:transformerName];
                value = [transformer transformedValue:value];
            }
            
            [self setValue:value forKey:objectKey];
        }
    }
    return self;
}
```

以上で利用する準備は完了です。

結果、以下のようにして`NSDictionary`の値がセットされた`NSManagedObject`を
作成することができるようになります。

```objectivec
NSDictionary *dictionary;
NSEntityDescription *entity;
NSManagedObjectContext *context;

ISKeymapManagedObject *object =
[[ISKeymapManagedObject alloc] initWithDictionary:dictionary
                                           entity:entity
                             managedObjectContext:context];
```

#### サブクラスの例

具体的なサブクラスは以下のように定義します。

```objectivec
@interface ISItem : ISKeymapManagedObject
 
@property (nonatomic, readonly) NSString *identifier;
@property (nonatomic, readonly) NSString *title;
@property (nonatomic, readonly) NSString *authorName;
@property (nonatomic, readonly) NSURL    *imageURL;
@property (nonatomic, readonly) NSDate   *createdDate;
 
@end
```

```objectivec
@implementation ISItem
 
@dynamic identifier;
@dynamic title;
@dynamic authorName;
@dynamic imageURL;
@dynamic createdDate;
 
+ (NSDictionary *)JSONKeymap
{
    return @{@"identifier":  @"id",
             @"title":       @"title",
             @"authorName":  @"author",
             @"imageURL":    @"image",
             @"createdDate": @"created_at",  };
}
 
+ (NSDictionary *)JSONValueTransformerNames
{
    return @{@"imageURL":    ISStringURLTransformerName,
             @"createdDate": ISStringDateTransformerName, };
}

@end
```

※`NSValueTransformer`はあらかじめ登録されているものとしています。

--

### 感想

これが良い方式なのかというとちょっと微妙だと思っていますが、  
面白そうなので趣味のアプリはしばらくこれでやってみようかと思いました。

Mantleはモデルが軽量な場合に良さそうなので、良い機会があれば積極的に使いたいと思いました。  
CoreDataとMantleを合わせて使うのは、もう少し自分に技術がついたら試そうかなと思いました。

