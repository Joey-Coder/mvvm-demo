import Observer from "./observer";
import Compiler from "./compiler";
class Vue {
  constructor(options) {
    // 获取dom对象el
    this.$el = document.querySelector(options.el);
    // console.log(this.$el);
    // 转存数据data
    this.$data = options.data || {};

    // 数据和函数代理
    // vm.msg 代理 vm.$data.msg
    this._proxyData(this.$data);
    this._proxyMethods(options.methods);

    // 数据劫持
    new Observer(this.$data);
    // 模版编译
    new Compiler(this);
  }
  /**
   * 数据代理
   * @param {*} data
   */
  _proxyData(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        set(newValue) {
          data[key] = newValue;
        },
        get() {
          return data[key];
        },
      });
    });
  }

  /**
   * 函数代理
   * @param {*} methods
   */
  _proxyMethods(methods) {
    if (methods && typeof methods === "object") {
      Object.keys(methods).forEach((key) => {
        this[key] = methods[key];
      });
    }
  }
}
// 挂载到全局
window.Vue = Vue;
