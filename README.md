#

## 实现一个简单的 MVVM 框架，学习用

### index.js

入口, 先进行数据劫持，再进行模版编译

### observer.js

进行数据的劫持，监听 data 的数据获取以及更新。当数据被获取时，调用 dep 收集 Watcher。当数据被修改时，调用 dep 内 Watcher 的 notify 方法，通知更新。

### compiler.js

将原生 DOM 转换为虚拟节点（fragment），识别 DOM 中的特殊符号，如"{{}}","v-model","v-if"等，对节点创建相应的 Watcher 类

### watcher.js

获取 data 中的数据，用来计算和更新插值表达式

### dep.js

获取 data 的时候进行 Watcher 的收集，设置 data 时进行 Watcher 中的 update 调用
