# TODO 清单 Version 2

> 目标：把纯 Vibe Coding 累积下来的“能跑但边界松”的代码，整理成更可维护、更可验证、更符合 Vue 3 / TypeScript / TanStack Query 最佳实践的前端工程。

## 当前基线

- 已完成请求层、Query Key、部分后台 CRUD、活动编辑页的大规模 composable 抽离。
- 当前最大剩余问题不再是“页面里全是 API 调用”，而是：
  - 抽出来的 composable 还需要二次收敛，避免从“胖页面”变成“胖 composable”。
  - 部分旧组件仍可能与新实现重复存在，例如 `TicketTypesTab.vue`、`SessionsTab.vue`。
  - 前台复杂页面已完成 `CheckoutView.vue`、`AIChatView.vue`、`ProfileView.vue`、`EventSearchView.vue` 的首轮拆分；下一步重点转向 `EventDetailView` / `useEventDetailPage`。
  - 构建已无 500KB 大 chunk 提示，`EventEditView`、`TicketListView` 仍是后续深度拆包候选。
  - 测试已覆盖 OpenAPI 契约、request transforms、Admin CRUD、Checkout、Profile section、AI prompt、Event Search、Event Detail 与活动编辑核心流程。
  - P1 后台列表页列定义已集中到 `listPageColumns.ts`，所有后台 `*ListView.vue` 控制在 200 行以内；主要后台/活动编辑/结算/个人中心表单已补齐 label/aria、图片 alt 与小屏 Dialog 滚动策略。

## 执行原则

- 每一项重构必须有明确验收标准：`type-check`、`lint`、`test`、必要时 `build`。
- 优先清掉重复实现、错误边界和类型松动，再做视觉或微优化。
- 页面组件只做编排和展示；请求、副作用、表单状态、缓存失效进入 composable。
- composable 不盲目泛化。只有 2 个以上调用方或明显重复时才抽公共抽象。
- 每轮改动控制一个主题，避免一次性横跨 API、UI、路由、样式。

## P0：工作区收敛与重复实现清理

- [x] 确认当前大批重构文件是否作为一个独立提交落地。
  - 验收：`git status --short` 中只有本轮目标文件变化；没有误暂存。
- [x] 审计 `EventEdit` 下的旧 tab 是否仍被引用。
  - 重点：`TicketTypesTab.vue`、`SessionsTab.vue`、`SessionsAndTicketsTab.vue`、`SessionList.vue`。
  - 验收：未使用文件删除；仍使用文件有清晰职责；路由/父组件引用唯一。
- [x] 清掉根目录遗留生成文件。
  - 重点：`auto-imports.d.ts`、`components.d.ts` 与 `src/types/*` 的关系。
  - 验收：只保留一个生成声明位置；`npm run type-check` 通过。
- [x] 复查已删除旧 API/类型文件是否还有隐式引用。
  - 重点：`src/api/auth.ts`、`src/api/home.ts`、`src/types/auth.ts`、`src/types/home.ts`。
  - 验收：全局搜索无引用；构建通过。

## P0：类型与 API 契约硬化

- [x] 统一 ID 策略。
  - 决策：前端领域模型 ID 全部用 `string`，API 边界做 `number/string` 归一化。
  - 验收：新增 `normalizeId` / `normalizeIdList` 测试；禁止页面里散落 `Number(id)` / `parseInt(id)`。
  - 审计：当前 `Number` / `parseInt` 残留集中在分页、状态枚举、日期时间、select 数字值；未发现页面级 ID 转数字。
- [x] 把 API 层类型从“手写可用”推进到“契约可验证”。
  - 方案 A：从 OpenAPI 生成类型，手写 API 函数引用生成类型。
  - 方案 B：保留手写类型，但补一层 request/transform 单测。
  - 验收：至少覆盖活动、订单、票务、账户四个核心域的请求参数与返回类型。
  - 进展：采用方案 B，新增 `apiOpenApiContract.test.ts` 直接读取 `docs/` 最新 OpenAPI，覆盖活动、订单、票务、账户/认证核心端点的路径、方法、请求体 schema、查询参数和响应 schema；修正 `ApiResponseLong` 原始 ID 统一转 string、管理员状态请求体、热门城市 `PATCH`、服务选项更新路径等契约漂移。
- [x] 收紧 `useAdminCrud` 泛型。
  - 重点：减少 `Record<string, unknown>` 逃逸，明确 `create/update/page` 类型。
  - 验收：现有后台列表页不增加类型断言；`no-explicit-any` 可逐步开启到非 shadcn 目录。
  - 进展：已补 `useAdminCrud` 单测，覆盖分页请求、搜索重置、创建/更新/删除缓存失效与删除确认。
  - 进展：`TForm` 从 `Record<string, unknown>` 收紧为 `object`，显式导出 `AdminCrudId` / `AdminPageParams`，提交映射函数读取 `Readonly<UnwrapNestedRefs<TForm>>`；默认编辑回填只写入表单声明过的字段，避免把整条 row 混进表单状态。
- [x] 统一 query key 使用。
  - 重点：替换残留 `queryKey: ['xxx']`。
  - 验收：业务代码 query key 均来自 `src/constants/queryKeys.ts`，测试可按 key 精确失效缓存。

## P1：后台模块二次整理

- [x] 将后台列表页列定义拆出视图。
  - 范围：`Banner`、`Category`、`Service`、`Notice`、`City`、`Venue`、`Participant`、`Series`、`Ticket`。
  - 建议：`src/components/admin/<module>/<Module>Columns.ts` 或 `src/composables/admin/<module>/columns.ts`。
  - 验收：每个 `*ListView.vue` 控制在 200 行以内。
  - 进展：统一收敛到 `src/components/admin/listPageColumns.ts`；补齐 `Event`、`Admin`、`User`、`WorkOrder` 列定义，所有后台列表页当前均小于 200 行。
- [x] 整理后台 composable 目录结构。
  - 当前 `src/composables/admin` 文件数量已明显增多。
  - 建议按领域分组：`admin/event-edit/*`、`admin/list-pages/*`、`admin/common/*`。
  - 验收：`index.ts` 不再是一长串平铺导出；命名能看出业务边界。
- [x] 抽统一的后台弹窗表单骨架。
  - 范围：标题、描述、footer、保存中状态、取消行为。
  - 验收：不再每个页面重复 `DialogContent + DialogHeader + DialogFooter` 的样板。
  - 进展：后台表单统一使用 `AdminFormDialog` 承载标题、描述、footer、保存中状态与小屏内部滚动；非表单型管理弹窗继续保留表格型 Dialog。
- [x] 审计删除确认逻辑。
  - 目标：统一 `useConfirmDialog` 的确认按钮文案、危险态、异步处理中状态。
  - 验收：删除/移除类操作视觉和交互一致。
  - 进展：删除、移除、关闭、下线类操作均使用 `useConfirmDialog` / `ConfirmDialog`；确认弹窗默认推导危险态与按钮文案，并在异步处理中禁用关闭和重复提交。

## P1：活动编辑模块深度收敛

- [x] 合并或删除重复票种管理实现。
  - 重点：`TicketTypesTab.vue` 仍是最大文件之一，可能和新的 `SessionsAndTicketsTab` 功能重叠。
  - 验收：票种新增、编辑、调库存、复制只保留一套入口。
- [x] 将 `EventEdit` 的子组件移动到 feature 目录。
  - 建议：`src/components/features/admin-event-edit/*`。
  - 验收：`views/admin/EventEditView.vue` 只作为路由视图和 tab 组合器。
- [x] 为活动编辑核心流程补组件/组合函数测试。
  - 测试点：基础信息保存、票种新增校验、库存调整、参与方添加、服务保障保存。
  - 验收：重构这些组件时有测试兜底。
  - 进展：已补 `eventEditFlows.test.ts`，覆盖基础信息创建、票种新增校验与创建、库存调整、参与方增量添加、服务保障保存前移除旧关联。
- [x] 消除活动编辑中的强制非空断言。
  - 搜索：`!`、`as`、`as unknown`。
  - 验收：关键数据缺失时 UI 有空态或禁用态，不靠运行时崩溃暴露问题。
  - 进展：活动基础信息提交显式构造 `EventCreateRequest` 并校验封面；路由活动 ID、须知模板内容等路径改为可空分支和默认值，不再依赖关键数据的强制非空断言。

## P1：前台复杂页面清理

- [x] 拆 `CheckoutView.vue`。
  - 目标：订单提交、实名购票人、票档/场次展示、价格汇总分离。
  - 验收：路由页只编排 composable 与 feature components；提交流程有测试。
  - 进展：已拆为 `CheckoutOrderCard`、`CheckoutPaymentPanel`、`CheckoutQrDialog`，并补支付状态/创建支付/取消订单测试。
- [x] 拆 `ProfileView.vue`。
  - 目标：每个 section 独立 lazy query；移动端弹窗和桌面布局解耦。
  - 验收：切换 section 不触发无关接口；当前 section loading 不挡住其他内容。
  - 进展：已拆为 `ProfilePageShell`、`ProfileSectionContent`、`ProfileDialogs`，保留 active section lazy query，并补 URL section 同步测试。
- [x] 二次清理 `AIChatView.vue`。
  - 目标：消息列表、输入区、快捷建议、空状态拆分；隐私 prompt 保持最小数据。
  - 验收：无硬编码灰阶/背景色；UI token 走 Tailwind/shadcn 语义类。
  - 进展：已拆为 `AIChatHeader`、`AIChatEmptyState`、`AIChatMessageList`、`AIChatInput`、`AIEventRecommendationCard`，首条 prompt 仅保留城市和用户问题，并补隐私上下文测试。
- [x] 拆 `EventSearchView.vue` 与 `useEventSearchPage.ts`。
  - 目标：筛选、排序、分页、城市/分类选项独立。
  - 验收：模板不再做过滤/排序逻辑；URL query 同步策略清晰。
  - 进展：已拆为 `SearchFilterPanel`、`SearchResultsPanel`、`SearchDateDialog`，日期状态移入 `useEventSearchDateDialog`；修复二级分类 URL 回显父分类，并补 URL 同步/分页/排序/日历测试。
- [x] 审计 `useEventDetailPage.ts`。
  - 目标：关注、购票、详情展示、场次票档派生分层。
  - 验收：单个 composable 不再承担整页所有状态。
  - 进展：已抽出 `eventDetailState` 纯状态助手与 `useEventTicketSelection`，`useEventDetailPage` 收敛为查询、登录拦截、下单与跳转编排；补票档/购票人派生、登录跳转、创建订单测试。

## P1：UI 与可访问性规范

- [x] 全量修复原生 `<button>` 缺少 `type`。
  - 验收：业务源码中无 `<button>` 默认 submit 风险。
  - 审计：全量扫描 `src/**/*.vue` 原生 `<button>` 开始标签，未发现缺少 `type` 的业务源码按钮。
- [x] 表单控件补齐 `label for/id` 或 `aria-label`。
  - 范围：后台表单、活动编辑、结算页、个人中心弹窗。
  - 验收：主要表单可被键盘和读屏合理访问。
  - 进展：后台列表工具栏、活动编辑子表单、检票、结算购票人选择、个人中心资料/实名/手机/购票人弹窗等主要输入和选择控件已补齐 label/aria；`Input`、`SelectTrigger` 扫描无主要业务遗漏。
- [x] 统一图片 `alt`。
  - 范围：头像、活动封面、Banner、票务图片。
  - 验收：装饰图为空 alt；业务图有明确 alt。
  - 进展：`ImageUpload` 支持业务 `previewAlt` / `uploadLabel`；头像、Banner、活动封面、二维码、活动卡片等业务图均保留明确 alt，未发现无 alt 的业务 `<img>`。
- [x] 统一 Dialog 尺寸与滚动策略。
  - 验收：小屏下没有内容溢出视口；长表单内部滚动。
  - 进展：基础 `DialogContent` / `AlertDialogContent` 增加 `max-height` 与滚动；后台表单骨架和活动编辑/结算/个人中心弹窗统一 `w-[calc(100vw-2rem)]` + max-width 策略。
- [x] 收敛手写控件。
  - 重点：checkbox/radio/switch、分页、下拉。
  - 验收：优先使用 shadcn-vue/Reka UI 封装，避免行为不一致。
  - 进展：活动编辑票种复制、参与方、服务保障等复选/单选入口均使用 shadcn-vue/Reka UI 控件；业务源码未发现原生 checkbox/radio 残留。

## P2：性能与构建体积

- [x] 拆大 chunk。
  - 当前信号：`HomeView`、`TicketListView`、`EventEditView` 构建后偏大。
  - 方向：扫码检票、富文本编辑器、图表、AI 助手、复杂弹窗改 lazy import。
  - 验收：`vite build` 无 500KB chunk warning，或有明确 `manualChunks/chunkSizeWarningLimit` 策略。
  - 进展：`CategoryNav` 改为 lucide 白名单导入，避免整包图标进入首页；`HomeView` chunk 从约 915KB 降至约 41KB，`vite build` 已无 500KB chunk warning。
- [ ] 懒加载重组件。
  - 重点：`ScanCheckinDialog`、`RichTextEditor`、AI assistant 图片/模块、后台编辑弹窗。
  - 验收：首屏路由不加载非当前路径的重依赖。
  - 进展：已将首页 AI 悬浮入口改为异步组件，AI 助手图改为压缩 WebP；其余重组件仍待继续。
- [x] 优化首页资源。
  - 重点：`assistant-*.png` 体积约 1.3MB。
  - 验收：图片压缩或按需加载；首页首屏包明显下降。
  - 进展：`assistant.png` 已替换为 360px 宽 `assistant.webp`，源资源体积约从 1.3MB 降到 12KB。
- [ ] 检查 TanStack Query enabled 策略。
  - 验收：弹窗数据只在打开时拉取；隐藏 tab 不预取不必要数据。

## P2：测试与质量门禁

- [ ] 补 composable 单测。
  - 优先：`requestTransforms`、`useAdminCrud`、`useEventBasicTab`、`useTicketTypeDialog`、`useCheckoutPage`。
  - 验收：核心提交/校验/缓存失效逻辑可测试。
  - 进展：已补 `requestTransforms`、`useAdminCrud`、`useCheckoutPage`、`checkoutState`、`useProfileSection`、`aiChatPrompt`、`useEventSearchPage`、`useEventSearchDateDialog`、`eventDetailState`、`useEventTicketSelection`、`useEventDetailPage`、活动编辑核心流程测试；后续可继续补组件 smoke test。
- [ ] 补关键组件 smoke test。
  - 优先：活动编辑、结算、个人中心、后台列表。
  - 验收：主要页面能 mount，核心按钮能触发预期事件。
- [ ] 增加 CI 脚本。
  - 建议命令：`type-check`、`lint:check`、`lint:oxlint`、`test`、`format:check`、`build`。
  - 验收：本地和 CI 使用同一套质量门禁。
- [ ] 分阶段开启更严格 lint。
  - 顺序：业务源码禁 `any` -> 禁未处理 promise -> 更严格 Vue 模板规则。
  - 验收：只对自有业务目录开启，shadcn 生成组件可单独豁免。

## P2：目录与命名治理

- [ ] 重新划分 `components`。
  - 建议：
    - `components/common/ui`: shadcn 基础组件。
    - `components/common`: 通用业务组件。
    - `components/features`: 前台 feature。
    - `components/admin`: 后台 shell/table/sidebar。
    - `components/features/admin-*`: 后台具体业务 feature。
  - 验收：业务组件不再都堆在 `views` 或 `admin` 根目录。
- [ ] 重新划分 `composables`。
  - 建议按领域建桶：`admin/list-pages`、`admin/event-edit`、`profile`、`trade`、`event`。
  - 验收：单目录文件数下降；导入路径能表达业务域。
- [ ] 命名统一。
  - 规则：页面级 `useXxxPage`，弹窗级 `useXxxDialog`，tab 级 `useXxxTab`，纯工具不用 `use`。
  - 验收：新代码按规则；旧代码逐步迁移。

## P3：文档与开发体验

- [ ] 更新 `TODO 清单.md` 或归档为 V1。
  - 验收：README 指向 Version 2，不再让后来者误以为 V1 是当前状态。
- [ ] 增补架构说明。
  - 内容：API 层、Query Key、页面/composable/组件边界、错误处理、认证头。
  - 验收：新开发者能按文档新增一个后台 CRUD 页面。
- [ ] 增补重构检查清单。
  - 内容：是否有 loading/error/success、是否有 label/id、是否使用 queryKeys、是否有测试。
  - 验收：每次 PR 可直接照单检查。
- [ ] 整理 OpenAPI 使用说明。
  - 内容：文档来源、同步流程、生成/校验策略。
  - 验收：API 变更后前端类型不会靠手改猜测。

## 推荐执行顺序

1. P0 工作区收敛：先让当前大改可 review、可提交。
2. P0 类型/API 硬化：避免后续继续在松类型上叠抽象。
3. P1 活动编辑重复实现清理：优先处理最大、最可能重复的旧 tab。
4. P1 前台复杂页面：结算、个人中心、AI、搜索。
5. P2 测试与体积：用测试兜住重构收益，用拆包改善真实体验。
6. P3 文档：把“如何保持整洁”固化下来。

## 每轮重构完成定义

- `npm.cmd run type-check`
- `npm.cmd run lint:check`
- `npm.cmd run lint:oxlint`
- `npm.cmd run test`
- `npm.cmd run format:check`
- 涉及路由/构建/懒加载时追加：`npm.cmd run build`
