#

## 实现一个简单的 MVVM 框架，学习用

index.js 入口  
compiler.js 模版编译模块，用来处理 el
observer.js 进行数据的劫持，监听 set 和 get  
watcher.js 模版和数据的桥梁，用来计算和更新插值表达式
dep.js 进行统一的 watcher 更新
