# 大麦网 Web 端项目 (damai-web)

基于 Vue 3 + TypeScript + Vite + TDesign + Tailwind CSS 4 构建的大麦网前端项目。

## 技术栈

- **前端框架**: [Vue 3.5+](https://vuejs.org/) (Composition API, `<script setup lang="ts">`)
- **构建工具**: [Vite 7+](https://vitejs.dev/)
- **编程语言**: [TypeScript 5+](https://www.typescriptlang.org/)
- **UI 组件库**: [TDesign Vue Next](https://tdesign.tencent.com/vue-next/)
- **CSS 框架**: [Tailwind CSS v4](https://tailwindcss.com/)
- **状态管理**: [Pinia 3+](https://pinia.vuejs.org/)
- **路由管理**: [Vue Router 5](https://router.vuejs.org/)
- **HTTP 客户端**: [Axios](https://axios-http.com/)
- **Mock 服务**: [Mock.js](http://mockjs.com/) & [vite-plugin-mock](https://github.com/vbenjs/vite-plugin-mock)
- **代码规范**: [ESLint](https://eslint.org/), [Oxlint](https://oxc.rs/docs/guide/usage/oxlint.html), [Prettier](https://prettier.io/)

## 项目结构

```text
src/
├── api/          # Axios 实例及 API 接口定义
├── assets/       # 静态资源 (图片, 全局样式)
├── components/   # 通用业务组件
├── composables/  # 组合式函数 (Reusable Logic)
├── layouts/      # 布局组件 (如 MainLayout)
├── router/       # 路由配置 (支持 meta.title)
├── stores/       # Pinia 状态库
├── types/        # TypeScript 类型/接口定义
├── utils/        # 通用工具函数 (formatDate, debounce, etc.)
└── views/        # 页面视图组件
```

## 开发脚本

在项目根目录下运行：

### 启动开发服务器
```bash
npm run dev
```

### 构建生产环境包
```bash
npm run build
```

### 预览构建后的项目
```bash
npm run preview
```

### 代码检查与修复
```bash
# 运行 Oxlint 和 ESLint
npm run lint

# 运行 Prettier 格式化
npm run format
```

## 环境要求

- **Node.js**: `^20.19.0` 或 `>=22.12.0`
- **推荐编辑器**: [VS Code](https://code.visualstudio.com/)
- **推荐扩展**:
  - [Vue - Official (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 开发规范

- 使用 `<script setup lang="ts">`。
- 组件名使用 `PascalCase`，目录名使用 `kebab-case`。
- 变量名使用 `camelCase`。
- Tailwind 配置及自定义主题在 `src/assets/main.css` 的 `@theme` 中定义。
