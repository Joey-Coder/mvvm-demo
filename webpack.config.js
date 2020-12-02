const path = require("path");

module.exports = {
  mode: "production",
  // 打包源文件
  entry: path.resolve(__dirname, "./src/index.js"),
  // 打包输出
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "vue.js",
  },
};
