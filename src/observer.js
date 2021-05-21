// 数据劫持
import Dep from "./dep";
export default class Observer {
  constructor(data) {
    // console.log(data);
    this.data = data;
    // 遍历对象完成所有数据劫持
    this.walk(this.data);
  }
  /**
   * 遍历对象data
   * @param {*} data
   */
  walk(data) {
    if (!data || typeof data !== "object") {
      return;
    }
    Object.keys(data).forEach((key) => {
      //   console.log(key);
      this.defineReactive(data, key, data[key]);
    });
  }

  /**
   * 动态设置响应式数据
   * @param {*} data
   * @param {*} key
   * @param {*} value
   */
  defineReactive(data, key, value) {
    var dep = new Dep();
    Object.defineProperty(data, key, {
      // 可遍历
      enumerable: true,
      // 不可再配置
      configurable: false,
      // 获取数据
      get: () => {
        // console.log("get");
        //  添加Watcher, 第一次触发get方法在watcher类的get方法中的computeExpression, 对应的watcher会被收集起来
        // 这里的Dep.target是Watcher实例的this
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      // 设置数据
      set: (newValue) => {
        // console.log("set");
        value = newValue;
        // 触发Watcher中的update
        dep.notify();
      },
    });
    // 递归处理value中的对象
    this.walk(value);
  }
}
