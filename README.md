# damai-web

高性能大麦网票务平台前端应用。

## 技术栈

Vue 3 (Composition API + `<script setup>`) · Vite 6 · TypeScript 5.9 · Pinia · Vue Router 5 · TanStack Vue Query v5 · shadcn-vue (New York) · Tailwind CSS v4 · Zod · Vitest

## 常用命令

```bash
npm run dev           # 启动开发服务器（带代理和 SSL）
npm run type-check    # vue-tsc --build
npm run lint:check    # ESLint 检查（无缓存）
npm run lint:oxlint   # Oxlint 快速检查
npm run test          # vitest run（happy-dom）
npm run ci            # 完整质量门禁：type-check → lint → audit → openapi → test → format → build
npm run build         # 类型检查 + 生产构建
```

> 提交前必须运行 `npm run ci`。pre-commit hook 只运行 `lint-staged`，不跑类型检查和测试。

## 环境变量

- `VITE_API_BASE_URL`：API 基础路径（用于 Vite 代理）
- `VITE_API_TARGET_URL`：代理转发目标地址（开发时指向后端服务）

本地覆写使用 `.env.local`（未入库）。

## 项目结构

```text
src/
├── api/            # API 请求（按领域：account/ event/ trade/ ticket/ ai/ file/）
├── components/     # UI 与业务组件（common/ui/、admin/、features/ 自动注册）
├── composables/    # 组合式函数（按领域划分）
├── constants/      # 常量、枚举、queryKeys、校验规则
├── layouts/        # MainLayout、AdminLayout、EmptyLayout
├── router/         # 路由配置（单文件 index.ts）
├── stores/         # Pinia 状态（user.ts、admin.ts）
├── styles/         # 全局样式与 Tailwind 入口
├── types/          # 全局类型与自动导入声明
├── utils/          # 纯函数工具（自动导入目录）
└── views/          # 页面组件（按领域划分）
```

## 开发约定

- **业务逻辑放 composable**，视图层保持声明式。Page 级 composable 命名：`useXxxPage`。
- **服务端状态**使用 TanStack Vue Query，query key 统一维护在 `src/constants/queryKeys.ts`。
- **自动导入**：Vue、Vue Router、Pinia、`@vueuse/core`、TanStack Query API、`z`、`clsx`、`twMerge` 无需 import；`src/utils/` 和 `src/composables/` 下所有导出自动导入；`src/components/common/ui/`、`admin/`、`features/` 下组件自动注册。图标格式：`icon-lucide-xxx`。
- **仍需手动 import**：`src/api/*`、`src/stores/*`、`src/router/*`、`src/views/*`、第三方库、所有 TypeScript 类型。
- **Dialog 弹窗**：禁止 `v-if`，必须使用 `:open` prop 配合 `@update:open`；业务弹窗用 `useDialog()` 管理状态；禁止 Dialog 套 Dialog。
- **实体 ID**：始终为 `string`，禁止 `Number(id)` / `parseInt(id)` / `+id`。
- **页面三态**：所有页面必须处理 loading / error / success。

## API 与认证

- 请求统一经过 `src/api/request.ts` 封装，禁止直接调用 axios。
- 认证头按路径自动注入：`/front/*` → `Authorization-User`，`/admin/*` → `Authorization-Admin`。
- 登录失效（code `10002`）由 `request.ts` 全局处理，业务层不重复写跳转。

## 参考

- `docs/openapi/`：OpenAPI JSON 接口契约文档（CI 契约检查来源）。
- `AGENTS.md`：面向 AI 会话的详细开发指南（命令、配置、硬性约束）。
