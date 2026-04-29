# TODO 清单 Version 3

> 目标：在 Version 2 大重构完成后，把项目从“主要风险已收敛”推进到“长期迭代可持续”。V3 不重复 V2 已完成项，重点处理剩余历史页面、质量自动化、关键业务链路和可观测的性能回归防线。

## 当前基线

- Version 2 的 P0 / P1 / P2 / P3 已完成，`npm run ci` 当前通过。
- 全量静态检查已确认：
  - 业务源码无 `queryKey: ['xxx']` 数组字面量残留。
  - 未发现页面级 `Number(id)`、`parseInt(id)`、`+id` 等 ID 转 number 逻辑。
  - `views` / `composables` 未直接使用原始 `request`、`axios`、`fetch`。
  - 原生 `<button>` 均显式声明 `type` 或 `:type`。
  - `<img>` 均有 `alt` 或 `:alt`。
- 已知合理例外：
  - `src/components/common/ui/native-select/NativeSelect.vue` 是 shadcn-vue 风格的基础控件封装，允许内部使用原生 `<select>`。
  - `IconAlipay`、`IconWechatPay` 是支付品牌图标，允许不替换为 Lucide。
  - `EventDetailView.vue` 的 `v-html` 使用 `DOMPurify.sanitize` 后的 `sanitizedDescription`。
- 当前最大剩余问题：
  - 少数历史 `views` 仍直接编排 `useQuery` / `useMutation` / API 函数，页面层边界还没有完全统一。
  - 原生 `<textarea>` 仍散落在少量业务弹窗中，后续可收敛为统一 textarea 控件或表单字段模式。
  - 性能已经消除 500KB chunk warning，但缺少可重复的 bundle 体积预算和回归报告。
  - OpenAPI 目前通过契约测试兜底，尚未形成“文档变更 -> 类型更新 -> 差异检查”的半自动流程。

## 执行原则

- 每轮只处理一个路由或一个业务域，避免把清单执行变成无边界大改。
- 从 `views` 迁移逻辑时，优先抽页面级 composable；只有确有复用或能减少复杂度时才抽公共抽象。
- 新增 composable 必须补最小单测，至少覆盖参数归一化、提交分支、缓存失效或路由同步中的关键路径。
- 性能优化要看构建产物，不只看源码体感；涉及懒加载、路由、依赖时必须跑 `npm run build`。
- 每完成一项就更新本清单，保留验收结果，避免 TODO 再次变成漂浮愿望。

## P0：收敛剩余页面层业务逻辑

- [ ] 抽离 `src/views/admin/AdminListView.vue`。
  - 建议：新增 `useAdminListPage`，收敛管理员分页、创建、更新、启停、缓存失效。
  - 验收：视图只保留列定义绑定、表格渲染和弹窗组件编排；补 composable 单测。
- [ ] 抽离 `src/views/admin/UserListView.vue`。
  - 建议：新增 `useAdminUserListPage`，统一用户分页、搜索、启停状态。
  - 验收：用户状态变更成功后只失效用户列表 query key；页面无直接 `useQuery` / `useMutation`。
- [ ] 抽离 `src/views/admin/EventListView.vue`。
  - 建议：新增 `useAdminEventListPage`，把城市/分类选项、活动分页、发布、下线、删除集中管理。
  - 验收：筛选变化正确回到第一页；发布/下线/删除后缓存失效精确。
- [ ] 抽离 `src/views/admin/WorkOrderListView.vue`。
  - 建议：新增 `useAdminWorkOrderListPage`，保留详情弹窗按需加载，收敛回复、关闭、详情 query enabled 策略。
  - 验收：详情只在选中工单时请求；回复/关闭后列表和详情缓存一致。
- [ ] 抽离 `src/views/ticket/TicketDetailView.vue`。
  - 建议：新增 `useTicketDetailPage`，处理路由 ID、详情查询、加载/错误/空态。
  - 验收：页面无直接 API import；缺失或非法 ID 有明确空态或返回路径。
- [ ] 收敛 `src/views/trade/CheckoutView.vue` 中剩余退款 mutation。
  - 建议：迁移到 `useCheckoutPage` 或独立 `useRefundDialog`。
  - 验收：退款成功后的订单/支付相关 query key 失效有测试覆盖。
- [ ] 评估登录页是否需要页面级 composable。
  - 范围：`src/views/auth/LoginView.vue`、`src/views/admin/LoginView.vue`。
  - 决策：如果仍保持在 view 内，需记录“登录页逻辑足够轻量”的原因；如果抽离，统一验证码、登录中状态、错误提示与跳转。

## P0：缓存、类型与契约防线

- [ ] 审计所有 mutation 成功后的 query invalidation。
  - 范围：后台列表、活动编辑、个人中心、结算/退款、工单回复。
  - 验收：每个 mutation 有明确失效目标；没有用过大的全局失效掩盖缓存问题。
- [ ] 扩展 `apiOpenApiContract.test.ts` 覆盖长尾接口。
  - 优先：后台工单、退款、检票、服务保障、关注、通知。
  - 验收：新增接口或 OpenAPI 变更时，测试能指出路径、方法、请求体或响应结构差异。
- [ ] 明确 OpenAPI 类型生成路线。
  - 方案 A：引入生成类型，只让 API 函数引用生成类型。
  - 方案 B：继续手写类型，但新增差异报告脚本。
  - 验收：形成一条可重复命令，并写入 `docs/openapi-workflow.md`。
- [ ] 增加 ID 策略回归扫描脚本。
  - 建议：把当前 `Number(id)` / `parseInt(id)` / `+id` 搜索固化为 `npm` 脚本或文档命令。
  - 验收：CI 或本地检查能快速发现新增 ID 转 number。

## P1：表单、控件与可访问性收口

- [ ] 增加统一 `Textarea` 基础组件或业务字段封装。
  - 范围：`WorkOrderDetailDialog.vue`、`RefundDialog.vue`、`ProfileWorkOrderDetailDialog.vue`。
  - 验收：长文本输入统一 class、disabled、aria、错误提示和小屏高度策略。
- [ ] 复查剩余表单字段的 label / description / error 文案。
  - 范围：后台列表弹窗、活动编辑、个人中心、结算退款、工单回复。
  - 验收：键盘和读屏路径清晰；错误文案不只依赖 toast。
- [ ] 统一空态和错误态组件。
  - 建议：沉淀 `EmptyState` / `ErrorState` 或按 feature 层封装。
  - 验收：后台列表空数据、前台详情加载失败、搜索无结果不再各写各的。
- [ ] 审计 Dialog 焦点和关闭策略。
  - 重点：异步提交中禁止重复提交、危险操作确认、移动端滚动、关闭后状态复位。
  - 验收：主要弹窗 smoke test 覆盖打开、提交、关闭、emit。

## P1：测试覆盖继续补强

- [ ] 为 P0 新增页面级 composable 补单测。
  - 优先顺序：`useAdminEventListPage`、`useAdminWorkOrderListPage`、`useTicketDetailPage`、`useRefundDialog`。
  - 验收：测试覆盖 query key、enabled、参数变化、mutation 成功分支。
- [ ] 扩展组件 smoke test。
  - 优先：后台事件列表操作、工单详情弹窗、退款弹窗、票务详情页面。
  - 验收：能 mount、关键文案存在、主要按钮 emit 或触发 mutation 回调。
- [ ] 增加关键业务链路测试。
  - 链路：搜索活动 -> 详情选票 -> 创建订单 -> 支付/取消；后台活动创建 -> 发布 -> 票种库存 -> 检票。
  - 验收：至少先用 composable / component 级测试覆盖主路径，后续再考虑 E2E。
- [ ] 复查测试数据工厂。
  - 目标：减少每个测试文件手写大对象。
  - 验收：核心 VO / request mock 有工厂函数，测试只覆盖与场景相关字段。

## P2：性能预算与构建观测

- [ ] 增加 bundle 分析命令。
  - 建议：使用 Vite/Rollup 可视化报告或自定义构建产物统计脚本。
  - 验收：能输出主要 chunk 名称、gzip 体积和对比基线。
- [ ] 建立 chunk 体积预算。
  - 当前重点：`RichTextEditor`、`ScanCheckinDialog`、`ProfileView`、`EventDetailView`、主入口 `index`。
  - 验收：大 chunk 是明确 lazy chunk；主入口和首页路由有预算上限。
- [ ] 复查重依赖是否只在需要时加载。
  - 范围：TipTap、ZXing、图表、AI 助手、日期/日历、富文本相关扩展。
  - 验收：非当前路由不加载无关重依赖；构建产物能看到独立 chunk。
- [ ] 优化 CSS 体积和重复样式。
  - 目标：避免 feature 组件继续堆重复 utility 组合或一次性全局样式。
  - 验收：保留 Tailwind/shadcn 语义类，复杂重复样式沉淀为局部组件或小工具。

## P2：业务体验硬化

- [ ] 订单与支付状态轮询策略复查。
  - 验收：页面离开、弹窗关闭、支付完成或失败时正确停止轮询；不会重复创建支付单。
- [ ] 工单回复体验复查。
  - 验收：回复为空、回复中、回复失败、关闭工单后再次回复等状态都有明确反馈。
- [ ] 活动详情购票边界复查。
  - 验收：缺场次、缺票档、库存不足、未登录、购票人不足都有可理解的禁用态或引导。
- [ ] 后台列表批量操作可行性评估。
  - 目标：只评估，不急于实现。
  - 验收：明确哪些实体适合批量上/下线、删除或状态变更，并记录交互风险。

## P3：文档与开发体验

- [x] 将 Version 2 归档为历史清单。
  - 验收：README 指向 Version 3；Version 2 顶部说明已完成并被 V3 接续。
  - 进展：README 已指向 Version 3，Version 2 顶部已添加归档提示。
- [ ] 把“重构检查清单”的人工扫描沉淀为脚本。
  - 建议命令：`npm run audit:refactor`。
  - 验收：至少覆盖 query key 字面量、ID 转 number、button type、img alt、原始请求调用。
- [ ] 增加 PR 模板。
  - 内容：变更范围、验证命令、是否涉及 API 契约、是否涉及懒加载/构建、是否已跑重构检查清单。
  - 验收：`.github/pull_request_template.md` 能直接引导审查。
- [ ] 更新架构文档中的后台页面示例。
  - 目标：用 V3 抽离后的 `useAdminXxxListPage` 作为推荐范式。
  - 验收：新开发者照着文档能新增一个列表页，并自然补测试。
- [ ] 维护“合理例外”记录。
  - 范围：品牌支付图标、基础 `NativeSelect`、经过 DOMPurify 的 `v-html`、确认为轻量的登录页逻辑。
  - 验收：例外有原因、有边界，不成为绕过规范的口子。

## 推荐执行顺序

1. P3 归档与 README 指向：先让文档入口准确。
2. P0 页面层抽离：从后台列表开始，因为边界最清楚、收益最大。
3. P0 契约和缓存防线：避免后续迁移继续靠人工记忆。
4. P1 表单和可访问性：统一 textarea、空态、错误态和弹窗行为。
5. P1 / P2 测试与性能观测：把回归风险变成可见信号。
6. P2 业务体验硬化：在结构稳定后补关键链路体验。

## 每轮完成定义

- `npm.cmd run type-check`
- `npm.cmd run lint:check`
- `npm.cmd run lint:oxlint`
- `npm.cmd run test`
- `npm.cmd run format:check`
- 涉及路由、懒加载、构建配置、自动导入或依赖变更时追加：`npm.cmd run build`
- 大范围重构或准备合并前直接运行：`npm.cmd run ci`
