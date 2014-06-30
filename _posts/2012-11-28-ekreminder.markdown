---
layout: post
title: "iCloudのリマインダーを利用してみる"
date: 2012-11-28 19:45
comments: true
categories: 
---

Mac版のリマインダーがどうしても邪魔になってしまう人(自分)のために、`remind`コマンドをつくりました。  
閲覧はiPadが担当するので、投稿専用です。

[GitHub: ishkawa/remind](https://github.com/ishkawa/remind)

```
remind "項目名"
```

### ソース(OS X)

```objectivec
#import <Foundation/Foundation.h>
#import <EventKit/EventKit.h>

NSString *const kCalendarTitle = @"Reminder";

int main(int argc, const char * argv[])
{
    @autoreleasepool {
        if (argc < 2) {
            NSLog(@"usage: remind \"title of task\"");
            return 1;
        }
        
        EKEventStore *store = [[EKEventStore alloc] initWithAccessToEntityTypes:EKEntityMaskReminder];
        EKReminder *reminder = [EKReminder reminderWithEventStore:store];
        
        reminder.title = [NSString stringWithCString:argv[1] encoding:NSUTF8StringEncoding];
        
        for (EKCalendar *calendar in [store calendarsForEntityType:EKEntityTypeReminder]) {
            if ([calendar.title isEqualToString:kCalendarTitle]) {
                reminder.calendar = calendar;
                break;
            }
        }
        if (!reminder.calendar) {
            NSLog(@"could not find specified calendar \"%@\".", kCalendarTitle);
            return 1;
        }
        
        NSError *error = nil;
        if (![store saveReminder:reminder commit:YES error:&error]) {
            NSLog(@"error: %@", error);
            return 1;
        }
    }
    return 0;
}
```



### iOSの場合

iOSで使う予定はないのですが、せっかくなので試してみました。  
`requestAccessToEntityType:completion:`を実行するとユーザーにアクセス許可を求めます。

```objectivec
NSString *const kCalendarTitle = @"Reminder";

EKEventStore *store = [[EKEventStore alloc] init];
[store requestAccessToEntityType:EKEntityTypeReminder
                      completion:^(BOOL granted, NSError *error) {
                          if (!granted) {
                              NSLog(@"denied.");
                              return;
                          }
                          if (error) {
                              NSLog(@"error: %@", error);
                              return;
                          }
                          
                          EKReminder *reminder = [EKReminder reminderWithEventStore:store];
                          reminder.title = @"hoge";
                          
                          for (EKCalendar *calendar in [store calendarsForEntityType:EKEntityTypeReminder]) {
                              if ([calendar.title isEqualToString:kCalendarTitle]) {
                                  reminder.calendar = calendar;
                                  break;
                              }
                          }
                          if (!reminder.calendar) {
                              NSLog(@"could not find specified calendar \"%@\".", kCalendarTitle);
                              return;
                          }
                          
                          NSError *saveError = nil;
                          if (![store saveReminder:reminder commit:YES error:&saveError]) {
                              NSLog(@"error: %@", error);
                              return;
                          }
                      }];
```



