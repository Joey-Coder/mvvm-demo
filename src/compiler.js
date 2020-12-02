import Watcher from "./watcher";
export default class Compiler {
  constructor(context) {
    // console.log(context);
    // console.log(context.el);
    this.$el = context.$el;
    this.context = context;
    if (this.$el) {
      // 将原始dom转换为文档片段
      this.$fragment = this.nodeToFragment(this.$el);
      //   console.log(this.$fragment);
      // 编译模版
      this.compiler(this.$fragment);
      // 把文档片段添加到页面中
      this.$el.appendChild(this.$fragment);
    }
  }
  /**
   *  el转为文档片段
   * @param {*} node
   */
  nodeToFragment(node) {
    let fragment = document.createDocumentFragment();
    // console.log(node.childNodes);
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach((child) => {
        // console.log(child);
        // 判断是不是我们需要添加的节点，排除掉注释和换行
        if (!this.ignorable(child)) {
          //   console.log(child);
          //   console.log(child.nodeType);
          fragment.appendChild(child);
          //   console.log(fragment);
        }
      });
    }
    // console.log(fragment);
    return fragment;
  }
  /**
   * 排除掉注释和文本中的换行
   * @param {*} node
   */
  ignorable(node) {
    var reg = /^[\t\n\r]+/;
    return (
      node.nodeType === 8 || (node.nodeType === 3 && reg.test(node.textContent))
    );
  }
  /**
   * 编译文档片段
   * @param {*} node
   */
  compiler(node) {
    if (node.childNodes && node.childNodes.length) {
      node.childNodes.forEach((child) => {
        // console.log(child);
        // nodeType=1 元素节点
        if (child.nodeType === 1) {
          //   console.log(child);
          this.compilerElementNode(child);
        } else if (child.nodeType === 3) {
          // nodeType=3 文本节点
          //   console.log(child);
          this.compilerTextNode(child);
        }
      });
    }
  }
  /**
   * 编译元素节点
   * @param {*} node
   */
  compilerElementNode(node) {
    // console.log("ELement", node);
    let attrs = [...node.attributes];
    // let that = this
    attrs.forEach((attr) => {
      let { name: attrName, value: attrValue } = attr;
      //   console.log(attrName, attrValue);
      if (attrName.indexOf("v-") === 0) {
        let dirName = attrName.slice(2);
        switch (dirName) {
          case "text":
            new Watcher(attrValue, this.context, (newValue) => {
              node.textContent = newValue;
            });
            break;
          case "model":
            new Watcher(attrValue, this.context, (newValue) => {
              node.value = newValue;
            });
            // input 事件监听
            node.addEventListener("input", (e) => {
              this.context[attrValue] = e.target.value;
            });
            break;
        }
      }
      if (attrName.indexOf("@") === 0) {
        this.compilerMethods(this.context, node, attrName, attrValue);
      }
    });
    // console.log(attrs);
    this.compiler(node);
  }

  /**
   * 编译文本节点
   * @param {*} node
   */
  compilerTextNode(node) {
    // console.log("Text: ", node);
    let text = node.textContent.trim();
    // console.log(text);
    if (text) {
      // 把text转换为表达式

      let exp = this.parseTextExp(text);
      //   console.log(exp);
      // 添加订阅者计算表达式的值
      new Watcher(exp, this.context, (newValue) => {
        // console.log(node.textContent, newValue);
        // 将表达式的值更改为真实值
        node.textContent = newValue;
      });
      // 当表达式依赖的数据发生变化时
      // 1.重新计算表达式的值
      // 2.node.textContent给最新的值
    }
  }

  /**
   * 函数编译
   * @param {*} scope
   * @param {*} node
   * @param {*} attrName
   * @param {*} attrValue
   */
  compilerMethods(scope, node, attrName, attrValue) {
    // 获取类型
    // 事件名称
    let type = attrName.slice(1);
    let fn = scope[attrValue];
    node.addEventListener(type, fn.bind(scope));
  }

  /**
   * 该函数完成了文本到表达式的转换
   * @param {*} text
   */
  parseTextExp(text) {
    // 匹配花括号里面的数组
    let regText = /\{\{(.+?)\}\}/g;
    // 分割字符串
    var pices = text.split(regText);
    // console.log(pices);
    var matches = text.match(regText);
    // console.log(matches);
    // 表达式数组
    let tokens = [];
    //
    pices.forEach((item) => {
      if (matches && matches.indexOf("{{" + item + "}}") > -1) {
        tokens.push("(" + item + ")");
      } else {
        tokens.push("`" + item + "`");
      }
    });
    return tokens.join("+");
  }
}
