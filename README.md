# Damai Web (大麦网前端)

基于 Vue 3 + TypeScript + Vite 构建的企业级前端项目。

## 🛠 技术栈

- **框架**: [Vue 3](https://cn.vuejs.org/) (Composition API + `<script setup>`)
- **构建工具**: [Vite](https://vitejs.dev/)
- **开发语言**: [TypeScript](https://www.typescriptlang.org/)
- **路由管理**: [Vue Router](https://router.vuejs.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **UI 组件库**: [daisyUI](https://daisyui.com/) (基于 Tailwind CSS 的组件库)
- **CSS 框架**: [Tailwind CSS](https://tailwindcss.com/)
- **消息提示**: [Vue3-Toastify](https://vue3-toastify.js-org.netlify.app/)
- **数据请求**: [Axios](https://axios-http.com/) + [TanStack Query (Vue Query)](https://tanstack.com/query/latest/docs/framework/vue/overview)
- **Mock 数据**: [Mock.js](http://mockjs.com/) + `vite-plugin-mock`
- **工具库**: [VueUse](https://vueuse.org/), [Day.js](https://day.js.org/), [Zod](https://zod.dev/)
- **代码规范**: ESLint, Oxlint, Prettier, Husky, lint-staged

## ✨ 特性

- **自动按需引入**: 自动导入 Vue API、组件库以及 Icon 图标，减少手动 `import` 的繁琐操作。
- **完善的代码规范**: 集成了 ESLint + Oxlint 进行代码检查，Prettier 进行格式化，并配合 Husky + lint-staged 实现提交前的自动校验。
- **Mock 支持**: 内置 Mock 数据支持，方便前后端并行开发。
- **TypeScript 支持**: 严格的 TypeScript 类型检查，保证代码健壮性。

## 🚀 快速开始

### 环境要求

- Node.js: `>=20.19.0` 或 `>=22.12.0`

### 安装依赖

```bash
npm install
```

### 运行开发环境

```bash
npm run dev
```

### 构建生产环境

```bash
npm run build
```

### 预览生产环境构建结果

```bash
npm run preview
```

## 📜 常用命令

| 命令                 | 说明                               |
| -------------------- | ---------------------------------- |
| `npm run dev`        | 启动本地开发服务器                 |
| `npm run build`      | 执行类型检查并打包生产环境代码     |
| `npm run type-check` | 运行 TypeScript 类型检查           |
| `npm run lint`       | 运行代码规范检查 (Oxlint + ESLint) |
| `npm run format`     | 运行 Prettier 格式化代码           |

## 📁 目录结构

```text
├── mock/                  # Mock 数据
├── public/                # 静态资源 (不经过 Vite 处理)
├── src/
│   ├── api/               # API 接口请求
│   ├── components/        # 公共业务组件
│   ├── constants/         # 全局常量
│   ├── layouts/           # 页面布局组件
│   ├── router/            # Vue Router 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 全局样式文件
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 项目入口文件
├── .env                   # 默认环境变量
├── .env.production        # 生产环境变量
├── eslint.config.ts       # ESLint 配置文件
├── vite.config.ts         # Vite 配置文件
└── tsconfig.json          # TypeScript 配置文件
```
