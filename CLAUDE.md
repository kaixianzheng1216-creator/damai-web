# CLAUDE.md

该文件为在本项目中进行代码开发时的 Claude Code (claude.ai/code) 提供指南。

## 项目概览

这是一个名为 **damai-web** 的高性能大麦网票务平台前端应用，基于 Vue 3 + Vite + TypeScript 构建。

## 核心技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 6
- **语言**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 5
- **UI 组件**: shadcn-vue (New York 风格) + Lucide Icons
- **样式**: Tailwind CSS v4
- **数据获取**: Axios + TanStack Vue Query v5
- **验证**: Zod
- **代码规范**: ESLint + Oxlint + Prettier

## 常用命令

- **安装依赖**: `npm install`
- **启动开发服务器**: `npm run dev`
- **构建生产环境版本**: `npm run build`
- **类型检查**: `npm run type-check`
- **Lint 与代码修复**: `npm run lint`
- **代码格式化**: `npm run format`

## 项目结构

```text
src/
├── api/            # API 请求定义与类型（按领域划分）
├── components/     # UI 组件
│   ├── common/ui/  # shadcn-vue 基础组件
│   └── common/     # 公共业务组件
├── composables/    # 可复用的组合式函数 (Composables)
├── constants/      # 全局常量
├── layouts/        # 页面布局
├── lib/            # 工具库 (shadcn/ui 依赖)
├── router/         # 路由配置
├── stores/         # Pinia 状态管理 (user.ts, admin.ts)
├── styles/         # 全局样式
├── types/          # 全局 TypeScript 类型定义
├── utils/          # 工具函数
└── views/          # 页面组件
```

## 关键架构特性

### 1. API 层 (`src/api/`)

- 集中化的 API 请求，按业务领域（活动、票务、交易、账户等）组织。
- 使用在 `src/api/request.ts` 中配置的 Axios 实例及其拦截器。
- **身份验证**:
  - 前端用户端点: `/front/*` 使用 `Authorization-User` 请求头。
  - 管理后台端点: `/admin/*` 使用 `Authorization-Admin` 请求头。
- 支持日期时间字段自动转换（datetime-local → ISO 8601）。
- 支持分页字段自动转换（字符串 → 数字）。
- 包含 Toast 通知错误处理。
- 基于 Token 的验证，身份验证失败（代码 10002）时会自动重定向到登录页。

### 2. 路由 (`src/router/index.ts`)

- 两套主要布局系统：
  - `MainLayout.vue`: 用于前端用户页面。
  - `AdminLayout.vue`: 用于后台管理页面。
- 路由守卫：
  - `requiresAuth`: 用于需要用户身份验证的页面。
  - `requiresAdmin`: 用于需要管理员身份验证的页面。

### 3. 状态管理 (`src/stores/`)

- `user.ts`: 前端用户状态（Token、用户信息等）。
- `admin.ts`: 管理员用户状态（AdminToken、管理员信息等）。

### 4. 自动导入配置

本项目使用 `unplugin-auto-import` 和 `unplugin-vue-components` 实现自动导入：

- 自动导入的 API: Vue, Vue Router, Pinia, @vueuse/core, TanStack Query, Zod, clsx, tailwind-merge。
- 自动导入的目录: `src/utils`, `src/composables`, `src/api`, `src/stores`。
- 图标: 通过 `icon-` 前缀使用 `unplugin-icons` 自动导入。
- 自动生成的类型定义: `src/types/auto-imports.d.ts`, `src/types/components.d.ts`。

### 5. TanStack Vue Query 配置

- 默认缓存过期时间 (stale time): 5 分钟。
- 默认垃圾回收时间 (GC time): 30 分钟。
- 窗口聚焦时重新获取数据 (refetch on window focus): 已禁用。

## 重要环境变量

- `VITE_API_BASE_URL`: API 基础路径（用于代理）。
- `VITE_API_TARGET_URL`: API 目标地址（用于代理）。

## 文档

API 文档位于 `docs/` 目录下，以 OpenAPI JSON 文件格式提供。
