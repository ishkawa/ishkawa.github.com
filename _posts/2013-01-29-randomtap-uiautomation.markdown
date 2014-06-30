---
layout: post
title: "0.1秒ごとにランダムタップするUIAutomationスクリプト"
date: 2013-01-29 20:51
comments: true
categories: 
---

書きました。

```javascript
var target = UIATarget.localTarget();
 
function sleep(time) {
    var d1 = new Date().getTime();
    var d2 = new Date().getTime();
    while (d2 < d1 + time) {
        d2 = new Date().getTime();
    }
    return;
}
 
var width = target.rect().size.width;
var height = target.rect().size.height;
 
while (1) {
    var x = Math.floor(Math.random() * width);
    var y = Math.floor(Math.random() * height);
    target.tap({x:x, y:y});
 
    sleep(100);
}
```

Q. 何に使うの？  
A. わかりません…
