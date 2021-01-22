import Watcher from "./watcher";
export default class Compiler {
  // compiler作用，遍历所有子节点Dom，识别特殊符号，例如{{}}，v-model，v-text等，将其转换为正确的数值
  // 但频繁的操作原生DOM节点会使性能下降
  constructor(context) {
    // console.log(context);
    console.log(context.$el);
    this.$el = context.$el;
    this.context = context;
    if (this.$el) {
      // 将原始dom转换为文档片段
      this.$fragment = this.nodeToFragment(this.$el);
      // console.log(this.$fragment);
      // 编译模版
      this.compiler(this.$fragment);
      // 把文档片段添加到页面中
      this.$el.appendChild(this.$fragment);
    }
  }
  /**
   *  将el转为文档片段
   * @param {*} node
   */
  nodeToFragment(node) {
    //DocumentFragments 是DOM节点。它们不是主DOM树的一部分。通常的用例是创建文档片段，将元素附加到文档片段，然后将文档片段附加到DOM树。在DOM树中，文档片段被其所有的子元素所代替。
    // 因为文档片段存在于内存中，并不在DOM树中，所以将子元素插入到文档片段时不会引起页面回流（对元素位置和几何上的计算）。因此，使用文档片段通常会带来更好的性能。
    // 使用appendChild方法dom树的节点添加到DF中时，会删除原来的节点
    let fragment = document.createDocumentFragment();
    // console.log(node.childNodes);
    if (node.childNodes && node.childNodes.length) {
      // console.log(node.childNodes);
      node.childNodes.forEach((child) => {
        // console.log(child);
        // 判断是不是我们需要添加的节点，排除掉注释和换行
        if (!this.ignorable(child)) {
          // console.log(child);
          //   console.log(child.nodeType);
          fragment.appendChild(child);
          // console.log(fragment);
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
  compiler(fragment) {
    if (fragment.childNodes && fragment.childNodes.length) {
      // console.log(fragment.childNodes.length);
      fragment.childNodes.forEach((child) => {
        // console.log(child);
        // nodeType=1 元素节点, 元素节点需要解析指令,需要递归调用compile
        if (child.nodeType === 1) {
          //   console.log(child);
          // console.log("eleNode: ", child);
          this.compilerElementNode(child);
        } else if (child.nodeType === 3) {
          // nodeType=3 文本节点， 文本节点直接渲染
          // console.log("textNode: ", child);
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
    // 获取元素文档的属性
    let attrs = [...node.attributes];
    // console.log("attrs: ", attrs);
    // let that = this
    // 获取属性名和属性值，例如v-model和msg
    attrs.forEach((attr) => {
      let { name: attrName, value: attrValue } = attr;
      // console.log(attrName, attrValue);
      if (attrName.indexOf("v-") === 0) {
        // dirName 为提取“v-”后面的内容
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
    // type事件名称，例如click
    // fn对应的事件函数，例如handleClick
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
    var pices = text.split(regText); // ["111-", "msg + 'Vue'", "-222"]
    // console.log("pices: ", pices);
    var matches = text.match(regText); // ["{{msg + 'Vue'}}"]
    // console.log("matches: ", matches);
    // 表达式数组
    let tokens = [];
    // 对item进行遍历，对非花括号包围的内容使用``包裹，对使用花括号包围的内容，使用()包裹，然后此次push进数组，[`111-`,(msg+'vue'),`-222`]
    pices.forEach((item) => {
      if (matches && matches.indexOf("{{" + item + "}}") > -1) {
        tokens.push("(" + item + ")");
      } else {
        tokens.push("`" + item + "`");
      }
    });
    // console.log(tokens.join("+")); // "`111-`+(msg + 'Vue')+`-222`"
    return tokens.join("+");
  }
}
