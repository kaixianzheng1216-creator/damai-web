# damai-web 架构说明

本文档说明当前前端工程的主要边界与新增功能时应遵守的落点。

## 1. 分层边界

```text
views/                 路由视图，只做页面编排和三态展示
components/features/   具体业务 UI，按功能域分组
components/admin/      后台 shell、表格、通用管理组件
components/common/     通用业务组件
components/common/ui/  shadcn-vue 基础组件
composables/           页面状态、副作用、查询、提交流程
api/                   接口函数、请求类型、响应类型
constants/             枚举、queryKeys、页面常量
utils/                 纯函数、格式化、映射逻辑
```

路由页默认保持轻量：读取一个页面级 composable，组合 feature components，处理 loading/error/success。复杂业务逻辑、表单状态、缓存失效、弹窗状态不直接堆在 `views` 中。

## 2. API 层

API 函数按领域组织在 `src/api/*`：

- `account/`：认证、用户、管理员、购票人。
- `event/`：活动、城市、分类、场馆、系列、Banner、参与方、须知、服务保障。
- `trade/`：订单、支付、退款、工单。
- `ticket/`：电子票与检票。
- `ai/`：AI 助手。
- `file/`：文件上传。

所有请求统一经过 `src/api/request.ts`。请求层负责：

- 注入认证头。
- 统一解包后端 `ApiResponse<T>`。
- 处理登录失效并跳转登录页。
- 统一错误 toast。
- 调用 `requestTransforms.ts` 做字段归一化。

新增接口时优先在对应领域文件中添加函数和类型，不在页面里直接写 URL。

## 3. ID 与响应归一化

前端领域模型中的实体 ID 统一为 `string`，包括 `id`、`eventId`、`userId`、`ticketTypeId` 等。

后端当前实际会把 Long ID 序列化为 string。前端仍保留防御层：

- `src/api/types.ts`：`EntityId`、`RawEntityId`、`normalizeEntityId`。
- `src/api/requestTransforms.ts`：递归归一化响应字段，ID 转 string，分页字段转 number。

禁止在页面或业务 composable 中把实体 ID 转回 number，例如 `Number(route.params.id)`、`parseInt(id)`。

## 4. Query Key

服务端状态使用 TanStack Vue Query。业务 query key 必须来自 `src/constants/queryKeys.ts`。

推荐模式：

```ts
const queryKey = computed(() => [
  ...queryKeys.admin.list('orders'),
  currentPage.value,
  pageSize.value,
  searchStatus.value,
])
```

缓存失效时使用同一组 key：

```ts
queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('orders') })
```

不要写散落的 `queryKey: ['admin-orders']`。这样后续测试和批量失效都能稳定命中。

## 5. 认证与路由

认证头由请求拦截器按接口路径注入：

- `/front/*` 使用 `Authorization-User`。
- `/admin/*` 使用 `Authorization-Admin`。

路由守卫位于 `src/router/index.ts`：

- `requiresAuth`：前台用户登录。
- `requiresAdmin`：后台管理员登录。

登录失效错误码由请求层处理，业务层不重复写全局跳转逻辑。

## 6. 页面、组件、Composable 边界

页面级 composable 使用 `useXxxPage` 命名，例如 `useCheckoutPage`、`useEventSearchPage`、`useOrderListPage`。

弹窗级 composable 使用 `useXxxDialog` 命名，例如 `useTicketTypeDialog`。

Tab 级 composable 使用 `useXxxTab` 命名，例如 `useEventBasicTab`、`useEventServicesTab`。

组件通信默认遵守 props down / events up。子组件不直接修改父级状态，双向绑定只用于明确的 `v-model` 合同。

## 7. 后台 CRUD 页面模式

新增后台列表页时优先复用：

- `DataTableCrud.vue`：表格、分页、工具栏插槽。
- `AdminFormDialog` 或 `LazyAdminFormDialog`：后台表单弹窗骨架。
- `src/components/admin/listPageColumns.ts`：列定义。
- `useAdminCrud` 或 `composables/admin/list-pages/useXxxListPage.ts`：页面状态和提交流程。

最小结构：

```text
src/views/admin/FooListView.vue
src/composables/admin/list-pages/useFooListPage.ts
src/components/admin/listPageColumns.ts
src/api/<domain>/foo.ts
```

视图只负责接线：

- 表格数据、分页、loading 来自 composable。
- 搜索项通过 `v-model` 绑定 composable 状态。
- 新建/编辑/删除调用 composable action。
- 查询、mutation、确认弹窗状态、缓存失效目标放在页面级 composable 中。
- 新增列表页优先补 `useXxxListPage.test.ts`，覆盖查询参数、分页复位和 mutation 成功后的 query key 失效。
- 详情或表单弹窗尽量按打开状态懒加载。

## 8. 错误、加载与空态

前台页面必须处理：

- loading：骨架屏或居中加载。
- error：明确失败提示。
- success：正常内容。

后台列表至少要有表格 loading 和空列表表现；长表单弹窗需要小屏滚动策略。

Mutation 的用户反馈放在 composable 中统一处理；全局请求错误仍由 `request.ts` 兜底。

## 9. 测试与质量门禁

核心行为优先补 composable 单测，组件测试保持黑盒：

- 断言渲染文本、按钮事件、emit 事件。
- 不依赖组件内部私有状态。
- 对请求逻辑 mock API 函数，不访问真实后端。

提交前运行：

```bash
npm run ci
```

该命令覆盖 `type-check`、`lint:check`、`lint:oxlint`、`test`、`format:check` 和 `build`。
