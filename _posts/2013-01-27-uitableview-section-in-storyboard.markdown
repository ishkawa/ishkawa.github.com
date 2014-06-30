---
layout: post
title: "StoryboardでUITableViewのセクションのヘッダ/フッタを設定する"
date: 2013-01-27 03:47
comments: true
categories: 
---

StackOverflowで見つけました。  
おそらく正攻法ではないのですが、面白かったので紹介します。  
[How to Implement Custom Table View Section Headers and Footers with Storyboard](http://stackoverflow.com/a/11396643)


以下のようなStoryboardを組んで  
![](/assets/2013-01-27/storyboard.png)

以下のような結果を得られます。  
![](/assets/2013-01-27/ss.png)

## やり方

- Storyboardで`UITableView`にヘッダ用とフッタ用のプロトタイプセルを追加する。  
  Identifierにはそれぞれ`Header`とか`Footer`とかを設定します。
- `tableView:viewForHeaderInSection:`で先ほど指定したIdentifierのセルをdequeueします。
```objectivec
- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
{
    static NSString *identifier = @"Header";
    UITableViewCell *headerView = [tableView dequeueReusableCellWithIdentifier:identifier];
    if (headerView == nil){
        [NSException raise:@"headerView == nil.." format:@"No cells with matching CellIdentifier loaded from your storyboard"];
    }
    return headerView;
}
```

- 高さも指定する場合は`tableView:heightForHeaderInSection:`も実装します。
```objectivec
- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section
{
    static NSString *identifier = @"Header";
    UITableViewCell *headerView = [tableView dequeueReusableCellWithIdentifier:identifier];
    if (headerView == nil){
        [NSException raise:@"headerView == nil.." format:@"No cells with matching CellIdentifier loaded from your storyboard"];
    }
    return headerView.frame.size.height;
}
```

そのうち、Storyboardで公式にヘッダが設定できるようになるのかもしれませんが、  
それまでのつなぎとしては良いのかもしれません。

