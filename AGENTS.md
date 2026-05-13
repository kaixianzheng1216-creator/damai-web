# AGENTS.md

该文件为在本项目中进行代码开发时的 OpenCode / Codex 会话提供指南。

## 项目概览

高性能大麦网票务平台前端应用，基于 Vue 3 + Vite 6 + TypeScript 构建。

## 核心技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 6
- **语言**: TypeScript 5.9（`noUncheckedIndexedAccess: true`）
- **状态管理**: Pinia
- **路由**: Vue Router 5
- **UI 组件**: shadcn-vue (New York 风格) + Lucide Icons
- **样式**: Tailwind CSS v4（`@tailwindcss/vite` 插件，无 `tailwind.config.ts`）
- **数据获取**: Axios + TanStack Vue Query v5
- **验证**: Zod
- **代码规范**: ESLint + Oxlint + Prettier
- **Node 版本**: `^20.0.0 || >=22.0.0`

## 常用命令

| 命令                   | 说明                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run dev`          | 启动开发服务器（带代理和 SSL）                                                                                     |
| `npm run build`        | 并行运行类型检查 + 生产构建（`run-p type-check build-only`）                                                       |
| `npm run build-only`   | 仅生产构建（不跑类型检查）                                                                                         |
| `npm run type-check`   | `vue-tsc --build`                                                                                                  |
| `npm run test`         | `vitest run`（环境: happy-dom）                                                                                    |
| `npm run ci`           | **完整质量门禁**：type-check → lint:check → lint:oxlint → audit:ids → openapi:report → test → format:check → build |
| `npm run lint:fix`     | ESLint 自动修复（带缓存）                                                                                          |
| `npm run lint:check`   | ESLint 检查（无缓存，CI 用）                                                                                       |
| `npm run lint:oxlint`  | Oxlint 快速检查                                                                                                    |
| `npm run format`       | Prettier 格式化 `src/`                                                                                             |
| `npm run format:check` | Prettier 检查模式（CI 用）                                                                                         |

> **提交前务必运行 `npm run ci`。** pre-commit hook（`.husky/pre-commit`）只运行 `lint-staged`（ESLint + Prettier 格式化 staged 文件），**不跑类型检查、测试和审计脚本**。依赖 CI 通过 `npm run ci`。
>
> `prepare: husky` 会在 `npm install` 时自动启用 git hooks，无需手动初始化。

## 项目结构

```text
src/
├── api/                # API 请求（按领域：account/ event/ trade/ ticket/ ai/ file/）
├── components/
│   ├── common/ui/      # shadcn-vue 基础组件（自动注册）
│   ├── common/         # 通用业务组件（如 TheHeader, ConfirmDialog）
│   ├── admin/          # 后台专用组件（自动注册）
│   └── features/       # 业务功能组件（自动注册）
├── composables/        # 组合式函数（按领域划分，含 common/ 通用逻辑）
├── constants/          # 常量、枚举、queryKeys、校验规则、文案
├── layouts/            # MainLayout（前台）、AdminLayout（后台）
├── router/             # 路由配置（单文件 index.ts）
├── stores/             # Pinia 状态（user.ts, admin.ts）
├── styles/             # 全局样式与 Tailwind 入口
├── types/              # 全局类型与自动导入声明
├── utils/              # 纯函数工具（自动导入目录）
└── views/              # 页面组件（按领域：home/ event/ trade/ ticket/ profile/ ai/ auth/ admin/ error/ participant/）
```

## 关键架构约定

### 1. API 层 (`src/api/`)

- **按领域组织**：`account/`（认证、用户、管理员）、`event/`（活动、城市、分类、场馆）、`trade/`（订单、支付、工单）、`ticket/`（电子票）、`ai/`、`file/`。
- **统一使用 `request` 封装**，禁止直接调用 axios。API 函数返回 `Promise<T>`，响应数据已自动解包。
- **自定义请求选项**：`RequestConfig` 扩展了 Axios 配置，增加：
  - `showError?: boolean` — 禁用自动 toast（**默认值因方法而异**：`get` 默认为 `true`，`post/put/patch/del` 默认为 `false`）
  - `rawResponse?: boolean` — 返回完整 `ApiResponse<T>` 而非只返回 `data`
- **认证头按路径注入**：`/front/*` → `Authorization-User`，`/admin/*` → `Authorization-Admin`，由拦截器自动处理。
- **请求/响应归一化**：`requestTransforms.ts` 递归处理——响应中所有 `id` / `*Id` 转为 `string`，分页数字字段转为 `number`；请求数据中的 `datetime-local` 字段在发送前转为 ISO 8601。
- **文件上传**：使用 `uploadFormData(url, file)`，内部构造 `FormData`。
- **API 函数命名**：遵循 `fetchXxxPage`、`fetchXxxById`、`createXxx`、`updateXxx`、`deleteXxx`、`publishXxx`、`offlineXxx`。后台接口加 `Admin` 前缀（如 `fetchAdminEventPage`），当前用户视角使用 `My` 前缀（如 `fetchMyOrderPage`）。
- **错误处理**：业务层可捕获 `ApiRequestError`（含 `code`、`response`、`status`）做精细处理。全局错误由 `request.ts` 兜底。

### 2. 实体 ID 策略（硬性约束）

**前端领域模型中的实体 ID 统一为 `string`**，包括 `id`、`eventId`、`ticketTypeId` 等。

- 后端已把 Long ID 序列化为 string。
- 禁止在任何业务代码中把 ID 转回 number：`Number(id)`、`parseInt(id)`、`+id` 均会导致 CI 失败。
- `scripts/audit-id-strategy.mjs` 在 `npm run ci` 时扫描 `src/views/` 和 `src/composables/` 中的违规用法（**注意：不扫描 `src/api/` 和 `src/components/`**）。

### 3. Query Key 管理 (`src/constants/queryKeys.ts`)

- **所有服务端状态的 query key 必须来自 `queryKeys` 对象**，禁止写硬编码字符串如 `['admin-orders']`。
- 动态 query key 使用 `computed`：
  ```ts
  const queryKey = computed(() => [
    ...queryKeys.admin.list('orders'),
    currentPage.value,
    pageSize.value,
  ])
  ```
- 缓存失效时针对基础 key：`queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('orders') })`。

### 4. Composable 命名与分层

- **Page 级**：`useXxxPage`（如 `useCheckoutPage`、`useEventSearchPage`）
- **Dialog 级**：`useXxxDialog`（如 `useTicketTypeDialog`）
- **Tab 级**：`useXxxTab`（如 `useEventBasicTab`）
- **通用级**：`useFollowToggle`、`useConfirmDialog`、`useCountdown`、`usePagination`

**页面保持轻量**：视图层只负责读取一个 page composable，组合 feature components，处理 loading/error/success 三态。业务逻辑、表单状态、缓存失效、弹窗状态放在 composable 中。

### 5. Dialog 弹窗规范（硬性约束）

- **禁止在 Dialog 组件上使用 `v-if`**：ESLint 自定义规则 `dialog-no-vif-with-open` 强制检查。`v-if` 会跳过退出动画和副作用清理（scroll lock、focus trap），导致页面卡死。
- **必须使用 `:open` prop 控制显示**，配合 `@update:open` 事件。
- **所有业务 Dialog 使用 `useDialog()` 管理状态**（`open`、`data`、`isLoading`、`withLoading`、`openDialog(payload?)`、`closeDialog()`）。
- `useDialog().withLoading`：包装异步函数的 loading 态管理 helper，接收 `() => Promise<void>`，自动设置/清除 `isLoading`。用于 Dialog 确认提交时包裹 mutation，确保 loading 状态在请求完成后正确复位。
- **禁止 Dialog 套 Dialog**：两个弹窗同时 open 会导致 `DismissableLayer` 冲突。
- 业务 Dialog 状态管理参考 `useDialog()` 的实现（`src/composables/common/useDialog.ts`）。

```vue
<!-- 正确 -->
<MyDialog :open="dialog.open.value" @update:open="dialog.closeDialog" @confirm="dialog.submit" />

<!-- 错误：v-if + :open 混用 -->
<MyDialog v-if="showDialog" :open="showDialog" />
```

### 6. 后台 CRUD 页面模板

新增后台列表页时，最小结构：

```text
src/views/admin/FooListView.vue
src/composables/admin/list-pages/useFooListPage.ts
src/components/admin/columns/fooColumns.ts   # 列定义
src/api/<domain>/foo.ts                      # API 函数与类型
```

视图负责接线：表格数据/分页/loading 来自 composable；搜索项通过 `v-model` 绑定；增删改调用 composable action。查询、mutation、确认弹窗状态、缓存失效都放在 page composable 中。

**推荐使用 `useAdminCrud`（`src/composables/admin/common/useAdminCrud.ts`）**作为后台列表页 composable 的基础模式。它封装了分页、搜索、CRUD mutation、确认弹窗等通用逻辑，接受 4 个类型参数：

- `TItem`：列表项类型（需含 `{ id: AdminCrudId }`）
- `TForm`：表单数据类型
- `TCreateRequest`：创建请求体类型（默认 `TForm`）
- `TUpdateRequest`：更新请求体类型（默认 `Partial<TForm>`）

配置项包括 `queryKeyBase`、`fetchPage`、`createItem`/`updateItem`/`deleteItem`、`initialForm`，返回 `list`、`totalRow`、`showDialog`、`form`、`handleSubmit`、`handleDelete` 等常用状态与方法。现有后台列表页应优先采用此模式，减少重复代码。

### 7. 路由 (`src/router/index.ts`)

- 单文件路由配置，无模块拆分。
- 两套布局：`MainLayout`（前台）、`AdminLayout`（后台）。登录页面不包裹布局组件，直接渲染。
- 路由守卫使用两个 meta 标志：
  - `requiresAuth`：需要用户登录
  - `requiresAdmin`：需要管理员登录
- 登录失效由 `request.ts` 全局处理（code `10002`），业务层不重复写跳转逻辑。
- 已登录用户访问登录页会被重定向到首页。
- `App.vue` 中通过 `useTitle` 根据 `meta.title` 自动设置 `document.title`（后缀 `- Damai`）。

### 8. 状态管理 (`src/stores/`)

- 仅两个 Pinia store：`user.ts` 和 `admin.ts`。
- 使用 `createAuthStore` 自定义 composable（位于 `src/composables/common/`，内部基于 `@vueuse/core` 的 `useStorage`）持久化到 `localStorage`。
- 统一模式：`ref` 存 token/info，computed `isLoggedIn`，`setXxxInfo(data, token?)`，`clearXxxInfo()`。

### 9. 自动导入配置

`vite.config.ts` 中配置了 `unplugin-auto-import` 和 `unplugin-vue-components`。

**无需手动 import 的 API**：

- Vue、Vue Router、Pinia、`@vueuse/core`
- TanStack Query：`useQuery`、`useMutation`、`useQueryClient`、`useQueries`
- Zod（`z`）、`clsx`、`twMerge`

**自动导入目录**：

- `src/utils/`、`src/composables/` 下的所有导出

**自动注册组件的目录**：

- `src/components/common/ui/`（shadcn-vue 基础组件）
- `src/components/admin/`、`src/components/features/`

**图标**：使用 `icon-lucide-xxx` 格式（如 `<icon-lucide-loader2 />`）。

**仍需手动 import**：`src/api/`、`src/stores/`、`src/router/`、`src/views/`、第三方库（`axios`、`vue3-toastify`、`dayjs` 等）、所有 TypeScript 类型。

**类型声明**：自动生成到 `src/types/auto-imports.d.ts` 和 `src/types/components.d.ts`。

### 10. TanStack Vue Query 配置

- 默认 stale time: 5 分钟
- 默认 GC time: 30 分钟
- 窗口聚焦时不重新获取（`refetchOnWindowFocus: false`）
- Query 与 Mutation 的注册发生在 `main.ts`

### 11. 样式与格式化

- **shadcn-vue 配置**：`components.json` — New York 风格、Zinc 基础色、CSS Variables、Lucide 图标库。
- **Prettier 配置**：`semi: false`、`singleQuote: true`、`printWidth: 100`。
- **无分号、单引号**。pre-commit hook 会自动格式化 staged 文件。
- Tailwind CSS v4 使用 `@tailwindcss/vite` 插件，无传统 `tailwind.config.ts`。
- 工具类合并：`cn()` 函数（`clsx` + `tailwind-merge`），自动导入可用。

### 12. 测试

- 测试框架：Vitest + `@vue/test-utils` + happy-dom。
- 优先为 composable 写单测（mock API 函数，不访问真实后端）。
- 组件测试保持黑盒：断言渲染文本、按钮事件、emit 事件，不依赖内部私有状态。
- 新增后台列表页建议补 `useXxxListPage.test.ts`，覆盖查询参数、分页复位和 mutation 成功后的 query key 失效。
- **`tsconfig.app.json` 排除了 `src/**/**tests**/\*`**，测试文件不参与 `vue-tsc` 类型检查构建。

### 13. OpenAPI 契约检查

- `scripts/openapi-contract-report.mjs` 在 CI 中检查：所有前端 `request.get/post/put/patch/del()` 调用必须在 `docs/openapi/` 下的 OpenAPI JSON 文档中有对应定义。
- 脚本通过硬编码的 `PREFIX_MAP` 将 `/api/account` 等前缀映射到对应的 OpenAPI 文件。新增 API 域名时需要同步更新该脚本，否则契约检查会跳过新域名的校验。
- 如果新增 API 调用但未同步 OpenAPI 文档，CI 会失败。

### 14. 环境变量

- `VITE_API_BASE_URL`：API 基础路径（用于 Vite 代理）。
- `VITE_API_TARGET_URL`：代理转发目标地址（开发时指向后端服务）。
- 本地开发覆写使用 `.env.local`（未入库）。

### 15. CI 与平台

- GitHub Actions 在 `windows-latest` 上运行，Node 版本 22。
- CI 仅触发于 `main` / `master` 分支的 push 以及所有 pull_request。

### 16. 运行时注意事项

- `main.ts` 中重写了 `console.warn` 以静默 `@tanstack/vue-table` 与 `shadcn-vue` 的已知无害警告（`"Slot \"default\" invoked outside of the render function"`）。不要移除该逻辑，否则控制台会被大量警告淹没。

## 代码风格速查

| 项目        | 约定                                                                         |
| ----------- | ---------------------------------------------------------------------------- |
| 引号        | 单引号                                                                       |
| 分号        | 无                                                                           |
| 行宽        | 100                                                                          |
| 组件名      | 多单词（eslint `vue/multi-word-component-names` 已关闭，但仍建议语义化命名） |
| 未使用变量  | 允许以 `_` 开头的参数                                                        |
| `any` 类型  | `src/components/common/ui/**` 允许；其他业务代码禁止                         |
| 实体 ID     | 始终为 `string`，禁止 `Number(id)` / `parseInt(id)`                          |
| Dialog 控制 | 禁止 `v-if`，必须使用 `:open` prop                                           |
| 导入路径    | 使用 `@/` 别名指向 `src/`                                                    |
| 页面三态    | 所有页面必须处理 loading / error / success                                   |

## 参考文档

- `README.md`：项目简介与基础命令。
- `docs/openapi/`：OpenAPI JSON 接口契约文档（用于 CI 契约检查）。
