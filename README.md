# zp-debug-tool

[zan-proxy](https://github.com/youzan/zan-proxy) 插件, 功能包括:

* 向HTML页面注入 `eruda` 工具
* 向HTML页面注入 `vorlon` 工具
* 向HTML页面注入自定义内容

例如原本的页面内容为:
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

开启注入erada功能后的页面内容为:
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

`eruda` 介绍 [https://github.com/liriliri/eruda](https://github.com/liriliri/eruda)  
`vorlon` 介绍 [http://www.vorlonjs.io/](http://www.vorlonjs.io/)

## 修改插件配置

在 zan-proxy 的插件管理页面中, 点击 zp-debug-tool 插件即可进入插件配置页面

## 使用 eruda

开启 `注入eruda` 功能后, 再次打开页面, 页面右下角将会多出一个图标为齿轮浮层, 如下图:

![](https://cdn.suisuijiang.com/ImageMessage/5adad39555703565e7903f78_1531837924867.png)

点击齿轮浮层即可打开/关闭 eruda

## 使用 vorlon

在插件配置页点击插入vorlon后面的 "前往vorlon仪表盘", 如下图:

![](https://cdn.suisuijiang.com/ImageMessage/5adad39555703565e7903f78_1531838333264.png)

*暂不支持https页面使用*