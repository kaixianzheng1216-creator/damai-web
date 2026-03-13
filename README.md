# damai-web

此模板旨在帮助你快速开始使用 Vite 进行 Vue 3 开发。

## 推荐 IDE 配置

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用 Vetur 插件)。

## 推荐浏览器配置

* **Chromium 系浏览器**（如 Chrome、Edge、Brave 等）：
* 安装 [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 扩展程序。
* [在 Chrome 开发者工具中开启“自定义对象格式化程序” (Custom Object Formatter)](http://bit.ly/object-formatters)。


* **Firefox**：
* 安装 [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/) 插件。
* [在 Firefox 开发者工具中开启“自定义对象格式化程序”](https://fxdx.dev/firefox-devtools-custom-object-formatters/)。

## TypeScript 对 `.vue` 导入的类型支持

由于 TypeScript 默认无法处理 `.vue` 文件的类型信息，我们使用 `vue-tsc` 代替 `tsc` 命令行工具来进行类型检查。在编辑器中，我们需要 [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件来让 TypeScript 语言服务识别 `.vue` 文件的类型。

## 自定义配置

请参阅 [Vite 配置参考](https://vite.dev/config/)。

## 项目设置

```sh
# 安装依赖
npm install
```

### 编译并启动开发服务器（支持热重载）

```sh
npm run dev
```

### 类型检查、编译并压缩代码以用于生产环境

```sh
npm run build
```

### 使用 [ESLint](https://eslint.org/) 进行代码检查

```sh
npm run lint
```