export default class Dep {
  constructor() {
    // 存放所有watcher
    this.subs = {};
  }
  addSub(target) {
    // 收集Watcher
    this.subs[target.uid] = target;
    // console.log(this.subs);
  }
  notify() {
    for (let uid in this.subs) {
      // 调用watcher的update方法
      this.subs[uid].update();
    }
  }
}
