> 归档说明：本文件是早期 V1 静态勘察记录，保留用于追溯问题来源。当前执行状态、验收标准与后续工作以 [TODO 清单 Version 2.md](<./TODO 清单 Version 2.md>) 为准。

可以，我重新做了一轮更深的静态勘察。先给结论：这个项目现在最大的问题不是功能缺，而是**边界不清、类型松、重复实现多、文档/代码不同步**。`type-check` 和 `eslint` 都通过了，但这是在 ESLint 关闭 `no-explicit-any`、且缺少测试的前提下通过的。

**勘察信号**

- `src` 共 389 个文件，`.vue` 259 个，`.ts` 126 个。
- 业务层最大文件集中在后台 CRUD：`ServiceListView.vue` 478 行、`CategoryListView.vue` 440 行、`BannerListView.vue` 369 行。
- `useQuery/useMutation` 在 `views` 里出现 91 次，在 `composables` 里 38 次，说明大量服务端状态还压在页面组件里。
- `src/api` 有 120 次 request 调用，但前端仓库 `docs/交易管理_OpenAPI.json` 只有 12 个 path；后端真实文档 `F:\workspace4graduationproject\damai\docs\api\交易管理_OpenAPI.json` 是 22 个 path，前端仓库文档已经落后。
- `npm run type-check` 通过；`npx eslint . --cache=false` 通过；`npx oxlint .` 失败，缺少 `@oxlint/binding-win32-x64-msvc`。
- 没有测试脚本、没有测试文件、没有 CI 配置。

**P0：先清地基**

1. 同步 OpenAPI 文档来源。当前前端仓库 `docs` 和后端 `damai/docs/api` 不一致，先确定唯一权威来源，再考虑用 OpenAPI 生成类型/API 客户端。
2. 重构 [src/api/request.ts](F:/workspace4graduationproject/damai-web/src/api/request.ts:12)。现在 `any`、`config as any`、手写响应拆包、全局日期转换都在这里，应该统一成 `ApiResponse<T>`、`RequestConfig`、明确错误类型。
3. 复用或迁移 [src/types/api.ts](F:/workspace4graduationproject/damai-web/src/types/api.ts:3)。这里已有 `ApiResponse`，但实际请求层完全没用上。
4. 明确 `int64` ID 策略。OpenAPI 里大量 ID 是 `integer/int64`，前端大多写成 `string`，这件事要统一成“前端全部 string”或“API 层转换 string”。
5. 修复质量门禁：新增 `lint:check`、`format:check`，保留 `lint:fix`；恢复 oxlint binding；pre-commit 至少跑非破坏性检查。
6. 加最小测试基线：`request.ts`、状态映射、核心 composable、登录/个人中心/后台列表 smoke。

**P1：API 与数据流** 7. AI 接口需要优先改：[useAIChat.ts](F:/workspace4graduationproject/damai-web/src/composables/useAIChat.ts:45) 会把用户 ID、用户名、手机号拼进 prompt，[src/api/ai/index.ts](F:/workspace4graduationproject/damai-web/src/api/ai/index.ts:11) 还是 GET query。建议改 POST body，并去掉手机号等非必要信息。8. 清理旧 API：`src/api/auth.ts`、`src/api/home.ts`、`src/types/auth.ts`、`src/types/home.ts` 看起来是早期遗留，和现在 `src/api/account/*`、`src/api/event/*` 两套并存。9. 建 Query Key 工厂，替代散落字符串。现在 `admin-events`、`admin-list`、`my-order-page` 等分散在页面和 composable 里。10. 统一搜索策略。比如 [WorkOrderListView.vue](F:/workspace4graduationproject/damai-web/src/views/admin/WorkOrderListView.vue:80) 和个人中心工单都是“后端分页后本地过滤当前页”，总数和分页会不准。

**P1：后台 CRUD** 11. 抽 `adminModules` 配置，统一路由、侧边栏、Dashboard 入口。现在 [AdminSidebar.vue](F:/workspace4graduationproject/damai-web/src/components/admin/AdminSidebar.vue:31) 和 [DashboardView.vue](F:/workspace4graduationproject/damai-web/src/views/admin/DashboardView.vue:24) 重复维护同一批模块。12. 强化 [useAdminCrud.ts](F:/workspace4graduationproject/damai-web/src/composables/admin/useAdminCrud.ts:7)。它本应减少 CRUD 重复，但自身 `any` 很多，导致后台页面继续各写一套。13. 重做 [DataTableCrud.vue](F:/workspace4graduationproject/damai-web/src/components/admin/DataTableCrud.vue:39) 的泛型和边界。它现在在前台 profile 也被引用，建议移到 `components/common`，或拆成 `CommonDataTable` + `AdminCrudTable`。14. 优先拆后台大页：`ServiceListView`、`CategoryListView`、`BannerListView`。每页拆成 columns、form schema、dialog、page composable。15. 统一后台弹窗高度。现在很多页面还直接用 `DialogContent class="max-w-md"`，后续会继续遇到内容超出屏幕的问题。

**P1：前台个人中心** 16. [useProfilePage.ts](F:/workspace4graduationproject/damai-web/src/composables/profile/useProfilePage.ts:17) 一次挂载所有 section 的 composable，导致进入个人中心会拉订单、票、工单、关注、购票人等全部数据。17. [ProfileView.vue](F:/workspace4graduationproject/damai-web/src/views/profile/ProfileView.vue:88) 的 loading 也是全局聚合，某个隐藏 section 加载会挡住当前页面。建议按 active section lazy enable。18. 前台不应依赖 `components/admin/DataTableCrud.vue`，这会让后台表格约束渗透到用户端体验里。

**P2：UI/规范** 19. 统一视觉 token。AI 页面硬编码了大量 `#F5F7FA`、`bg-white`、`text-gray-*`，见 [AIChatView.vue](F:/workspace4graduationproject/damai-web/src/views/ai/AIChatView.vue:87)。20. 统一图标库。项目主规范是 Lucide，但后台用了 `@tabler/icons-vue`，建议二选一。21. 用 shadcn-vue 控件替代手写控件。例如 [ServiceListView.vue](F:/workspace4graduationproject/damai-web/src/views/admin/ServiceListView.vue:480) 有手写 switch。22. 补访问性规则：大量原生 `<button>` 没有 `type`，不少 label/Input 没有关联 `for/id`，后续表单多了会出隐性问题。23. [ImageUpload.vue](F:/workspace4graduationproject/damai-web/src/components/common/ImageUpload.vue:26) 补文件大小、尺寸、上传错误类型；图标也可以换 Lucide。

**P2：文档与项目卫生** 24. README 已过期：提到了 Mock，但项目没有相关依赖；还引用了不存在的 `docs/开发规范.md`。25. 处理根目录重复的 `auto-imports.d.ts`、`components.d.ts`，现在和 `src/types` 下生成文件并存。26. 收窄 `vite.config.ts` 的 auto-import 范围。现在 `src/api`、`src/stores` 都自动导入，长期容易隐藏依赖和制造命名冲突。27. 给 `RouteMeta` 增加类型声明，并加 `router.afterEach` 同步 `document.title`。

建议执行顺序：**OpenAPI/请求层 → 质量门禁 → 后台 CRUD 抽象 → 个人中心懒加载 → UI 一致性 → 测试补齐**。这样清理是往地基走，不会只是把页面再“美化一遍”。
