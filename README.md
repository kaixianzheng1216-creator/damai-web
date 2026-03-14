# Damai Web

基于 Vue 3 + Vite + TypeScript 构建的高性能大麦网 Web 前端应用。

## 技术栈

- **框架**: [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)
- **构建工具**: [Vite 6](https://vite.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由**: [Vue Router 5](https://router.vuejs.org/)
- **UI 组件库**: [shadcn-vue](https://www.shadcn-vue.com/) + [Lucide Icons](https://lucide.dev/)
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **数据请求**: [Axios](https://axios-http.com/) + [TanStack Vue Query v5](https://tanstack.com/query/latest/docs/framework/vue/overview)
- **校验**: [Zod](https://zod.dev/)
- **代码规范**: [ESLint](https://eslint.org/) + [Oxlint](https://oxlint.js.org/) + [Prettier](https://prettier.io/)
- **Mock**: [Vite Plugin Mock](https://github.com/vbenjs/vite-plugin-mock) + [Mock.js](http://mockjs.com/)

## 项目结构

```text
src/
├── api/            # API 请求定义与类型
├── components/     # UI 组件
│   ├── ui/         # shadcn-vue 基础组件
│   └── common/     # 通用业务组件
├── composables/    # 可复用的组合式函数
├── constants/      # 全局常量
├── layouts/        # 页面布局
├── lib/            # 工具类库 (shadcn/ui 依赖)
├── router/         # 路由配置
├── stores/         # Pinia 状态管理
├── styles/         # 全局样式
├── types/          # 全局 TypeScript 类型定义
├── utils/          # 工具函数
└── views/          # 页面组件
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 代码检查与修复

```bash
npm run lint
npm run format
```

## 文档

更多详细说明请参考 `docs` 目录：

- [开发规范](./docs/开发规范.md)
