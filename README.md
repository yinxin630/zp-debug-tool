# zp-debug-tool

[zan-proxy](https://github.com/youzan/zan-proxy) 插件, 功能包括:

* 修改HTML响应, 响应内容添加 `eruda` 工具

例如原本的页面为:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```

经过该插件后为:
```html
<!DOCTYPE html>
<html lang="en">
<head>
<script src="https://cdn.bootcss.com/eruda/1.4.4/eruda.min.js"></script><script>eruda.init()</script>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```

`eruda` 功能详见 [https://github.com/liriliri/eruda](https://github.com/liriliri/eruda)