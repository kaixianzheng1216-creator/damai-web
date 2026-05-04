# 消除手动造轮子 — 改进计划

## TL;DR

> 基于对 damai-web 项目的手动实现审计，识别出 **17 处**可用 shadcn-vue / VueUse / 第三方包替代的手动实现。
> 按优先级分 3 个 Wave 执行，预计影响 **15-20 个文件**，总代码减少约 **200-300 行**。

## 目标

消除项目中"手动造轮子"的代码，统一使用已安装的 shadcn-vue 组件、VueUse composables 和成熟 npm 包，降低维护成本，提升代码一致性。

## 范围

### IN（本次处理）

- shadcn-vue 已安装但未在业务代码中使用的组件（Badge、Avatar、Skeleton、Pagination）
- VueUse 已自动导入但实际代码中未使用的手动实现（debounce、dropZone、objectUrl、cookie、websocket）
- 可用 npm 包替代的通用逻辑（nanoid、dayjs 替代手动解析）
- 安装缺失的 shadcn-vue 组件（ScrollArea）并在关键位置应用

### OUT（本次不处理）

- 项目特定的业务逻辑封装（useDialog、useAppConfirmDialog、usePagination）
- 模板内简单的 `@keydown` 处理（Carousel.vue、AIChatInput.vue — 收益太低）
- 复杂的富文本编辑器、虚拟滚动、STOMP 协议等已有成熟库覆盖的领域

---

## Wave 1 — 快速改进（shadcn-vue 组件替换）

### T1: Badge 替换内联状态标签

**文件**: `src/components/common/OrderCard.vue`、`src/components/common/TicketCard.vue`
**改动**: 将手动 `<span class="rounded-full bg-primary/10 ...">` 替换为 `<Badge>`
**影响**: 2个文件，约4行改动
**验证**: lint + 视觉检查

### T2: Avatar 替换手动 img

**文件**: `src/components/common/header/HeaderUserMenu.vue`
**改动**: `<img class="rounded-full">` → `<Avatar><AvatarImage /><AvatarFallback /></Avatar>`
**影响**: 1个文件，增加 fallback 功能
**验证**: lint + 头像加载/失败场景

### T3: Skeleton 替换手写 loading 遮罩

**文件**: `src/components/admin/DataTableCrud.vue`、`src/components/admin/TableCardView.vue`
**改动**: `absolute inset-0 bg-background/60 + Loader2` → `<Skeleton>` 或保留原样（需评估）
**说明**: 当前实现是区域 loading spinner，Skeleton 是骨架屏。两者用途不同。如果列表数据加载时骨架屏更合适，则替换；否则保留。
**影响**: 2个文件
**验证**: lint + 视觉检查

### T4: 安装 ScrollArea 并应用

**文件**:

- 新增 `src/components/common/ui/scroll-area/`（shadcn add scroll-area）
- 修改 `src/components/common/WorkOrderDetailDialog.vue`
- 修改 `src/components/features/admin-order/OrderDetailDialog.vue`
- 修改 `src/components/admin/AdminFormDialog.vue`
  **改动**: 将 `overflow-y-auto` 的滚动区域替换为 `<ScrollArea>`
  **影响**: 3-4个文件
  **验证**: lint + 滚动行为正常

---

## Wave 2 — VueUse 替换手动实现

### T5: useDebounceFn 替换手动防抖

**文件**: `src/components/features/admin-ticket/ScanCheckinDialog.vue`
**改动**: 删除 `debounceTimer` 变量和 `setTimeout`/`clearTimeout` 逻辑，使用 `useDebounceFn(submit, 300)`
**影响**: 1个文件，减少约15行
**验证**: lint + 扫码功能正常

### T6: useDropZone + useObjectUrl 替换手动拖拽和URL管理

**文件**: `src/components/common/ImageUpload.vue`
**改动**:

- 删除 `handleDrop`/`handleDragOver`/`handleDragLeave`，改用 `useDropZone`
- 删除手动 `URL.createObjectURL`/`URL.revokeObjectURL`，改用 `useObjectUrl`
  **影响**: 1个文件，减少约25行，消除内存泄漏风险
  **验证**: lint + 拖拽上传功能正常

### T7: useCookie 替换手动 cookie 操作

**文件**: `src/components/common/ui/sidebar/SidebarProvider.vue`
**改动**: `document.cookie = '...'` → `useCookie(SIDEBAR_COOKIE_NAME, { maxAge: ... })`
**影响**: 1个文件，减少约5行
**验证**: lint + sidebar 状态持久化正常

### T8: useWebSocket 重构 WebSocket 状态管理

**文件**: `src/composables/common/useWorkOrderChat.ts`
**改动**: 使用 `useWebSocket` 管理底层连接状态（status、open、close、send），保留 STOMP 协议订阅逻辑
**影响**: 1个文件，减少约40行状态管理代码
**验证**: lint + WebSocket 连接/重连/消息收发正常

### T9: useUrlSearchParams 替换手动 query 解析

**文件**: `src/composables/event/useSearchFilters.ts`
**改动**: `parseQueryString`/`parseQueryNumber` 函数 → `useUrlSearchParams` 或直接配合 Vue Router
**影响**: 1个文件，减少约10行
**验证**: lint + 搜索筛选参数同步正常

---

## Wave 3 — 第三方包 + 工具函数改进

### T10: nanoid 替换 Math.random ID 生成

**文件**: `src/components/common/ImageUpload.vue`、`src/composables/ai/useAIChat.ts`
**改动**: `Math.random().toString(36).slice(2)` → `nanoid()`
**前置**: `npm install nanoid`
**影响**: 2个文件
**验证**: lint + ID 生成正常

### T11: dayjs 替代手动日期解析

**文件**: `src/components/common/DateTimePicker.vue`、`src/composables/event/useEventSearchDateDialog.ts`
**改动**:

- 删除 `pad()` 函数，使用 `dayjs(val).format('HH')` / `dayjs(val).format('mm')`
- 删除 `parse()` 手动 split，使用 `dayjs(val)` 解析
  **影响**: 2个文件
  **验证**: lint + 日期选择器功能正常

### T12: dayjs.duration 替代手动倒计时格式化

**文件**: `src/utils/checkoutState.ts`
**改动**: `Math.floor(remainSeconds / 60)` + `padStart` → `dayjs.duration(remainSeconds, 'seconds').format('mm:ss')`
**影响**: 1个文件
**验证**: lint + 倒计时显示正常

### T13: TablePagination 整合 shadcn Pagination

**文件**: `src/components/admin/TablePagination.vue`
**改动**: 将手写的页码按钮导航部分替换为 shadcn `Pagination` 组件，保留 pageSize Select
**影响**: 1个文件
**验证**: lint + 分页功能正常

### T14: EventFollowButton 使用 Toggle（可选）

**文件**: `src/components/features/event/EventFollowButton.vue`
**改动**: 安装 `npx shadcn-vue@latest add toggle`，将手动 variant 切换改为 `<Toggle>`
**影响**: 1个文件
**验证**: lint + 关注按钮交互正常

### T15: 安装其他缺失的 shadcn 组件（预防性）

**包**: `npx shadcn-vue@latest add collapsible command accordion resizable toggle-group`
**说明**: 当前项目中暂无使用场景，但安装后可供未来开发直接使用，避免再次造轮子
**验证**: `npm run type-check` 通过

---

## 前置依赖

| 包                             | 命令                                    | 说明                  |
| ------------------------------ | --------------------------------------- | --------------------- |
| `nanoid`                       | `npm install nanoid`                    | 唯一需要新增的 npm 包 |
| shadcn scroll-area             | `npx shadcn-vue@latest add scroll-area` | 缺失组件              |
| shadcn toggle（可选）          | `npx shadcn-vue@latest add toggle`      | 用于 T14              |
| shadcn collapsible/...（可选） | `npx shadcn-vue@latest add ...`         | 用于 T15              |

**注意**: VueUse 的所有 composables 已经通过 `unplugin-auto-import` 自动导入，无需安装。

---

## 验证策略

每个任务完成后：

1. `npm run type-check` → exit code 0
2. `npm run lint:check` → exit code 0
3. 相关功能 Playwright/Bash 冒烟测试

Wave 完成后：

1. `npm run build` → exit code 0
2. 统计代码行数变化（目标：减少 200-300 行）

---

## Commit 策略

- Wave 1: `chore(ui): replace manual implementations with shadcn-vue components`
- Wave 2: `refactor(composables): replace manual browser APIs with VueUse`
- Wave 3: `chore(utils): introduce nanoid and dayjs for generic utilities`

---

## 风险与注意事项

1. **Avatar fallback**: 替换为 Avatar 后需要测试图片加载失败时是否正确显示 fallback 文字
2. **useDropZone**: 需确保移动端拖拽行为与原实现一致
3. **useWebSocket**: STOMP 协议层必须保留，仅替换底层连接管理
4. **ScrollArea**: 在 Dialog 内使用时需测试焦点管理和滚动冲突
5. **useCookie**: 替换后需测试 SSR/服务端渲染场景（如果有）
