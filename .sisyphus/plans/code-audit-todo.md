# damai-web 规范化 TODO 清单

> 基于全代码库 6 维度审计（502 个源文件）生成，按优先级分类。
> 策略：不使用 `@deprecated`，所有冗余代码直接删除（先迁移调用方）。

## 审计概览

| 审计维度       | 方法                                     | 发现问题数                                   |
| -------------- | ---------------------------------------- | -------------------------------------------- |
| API 层         | 40+ 文件 + `docs/api-naming.md` 交叉对照 | 26 个命名违规、17 个冗余函数                 |
| Composable 层  | 80+ 文件全量分析                         | 2 空桩、3 God Object、1 硬编码 query key     |
| TypeScript     | 293 文件全量扫描                         | 23 缺失返回类型、类型风格不一致              |
| Import/Styling | 全量 import + Tailwind 扫描              | 74 import 排序问题、1 unscoped style         |
| 视图层         | 27 个 view 分析                          | 1 Dialog v-if 违规                           |
| 测试           | 13 个 `__tests__/` 目录统计              | **0 测试**                                   |
| 结构           | 文件大小/分布统计                        | 1 个 20KB 列定义文件、根 composable redirect |

---

## 🔴 P0 — 紧急（会导致 Bug 或违反 CI 强制规则）

### 1. API 命名：19 个 admin endpoint 函数缺少 `Admin` 前缀

**文件**：`src/api/event/event.ts`

以下函数调用 `/api/event/admin/...` 路径，但函数名无 `Admin` 前缀，违反 `docs/api-naming.md` 规范：

| 行号 | 当前命名                    | 应改为                                   |
| ---- | --------------------------- | ---------------------------------------- |
| 38   | `fetchEventById`            | `fetchAdminEventById`                    |
| 56   | `saveEventInfo`             | `updateEventInfo`（另见 #3）             |
| 61   | `batchAddSessions`          | `adminBatchAddSessions`                  |
| 64   | `updateSession`             | `adminUpdateSession`                     |
| 71   | `deleteSession`             | `adminDeleteSession`                     |
| 76   | `createTicketType`          | `adminCreateTicketType`                  |
| 88   | `updateTicketType`          | `adminUpdateTicketType`                  |
| 95   | `deleteTicketType`          | `adminDeleteTicketType`                  |
| 98   | `adjustTicketTypeInventory` | `adminAdjustTicketTypeInventory`         |
| 110  | `batchAddServices`          | `adminBatchAddServices`                  |
| 115  | `removeService`             | `adminDeleteEventService`（另见 #3）     |
| 120  | `removeParticipant`         | `adminDeleteEventParticipant`（另见 #3） |
| 123  | `batchAddParticipants`      | `adminBatchAddParticipants`              |
| 129  | `sortParticipants`          | `adminSortParticipants`                  |
| 134  | `copyTicketTypes`           | `adminCopyTicketTypes`                   |
| 137  | `publishAllEvents`          | `adminPublishAllEvents`                  |

另外：

- `src/api/account/user.ts:17` — `fetchUserById`（admin endpoint）→ `fetchAdminUserById`
- `src/api/ticket/ticket.ts:16` — `checkinTicket`（admin endpoint）→ `adminCheckinTicket`

**预计工时**：2h（含调用方迁移）

---

### 2. API 命名：7 个用户视角 endpoint 缺少 `My` 前缀

| 文件                         | 行号 | 当前命名                  | 应改为                   |
| ---------------------------- | ---- | ------------------------- | ------------------------ |
| `src/api/ticket/ticket.ts`   | 8    | `fetchTicketById`         | `fetchMyTicketById`      |
| `src/api/trade/order.ts`     | 25   | `fetchOrderById`          | `fetchMyOrderById`       |
| `src/api/trade/order.ts`     | 29   | `fetchOrderStatus`        | `fetchMyOrderStatus`     |
| `src/api/trade/order.ts`     | 15   | `fetchUserPurchaseCounts` | `fetchMyPurchaseCounts`  |
| `src/api/trade/workOrder.ts` | 15   | `fetchWorkOrderById`      | `fetchMyWorkOrderById`   |
| `src/api/trade/workOrder.ts` | 19   | `submitWorkOrderReply`    | `submitMyWorkOrderReply` |
| `src/api/trade/workOrder.ts` | 29   | `closeWorkOrder`          | `closeMyWorkOrder`       |

**预计工时**：1h（含调用方迁移）

---

### 3. API 命名：3 个非标准动词

| 文件                     | 行号 | 当前                | 应改为                        | 原因              |
| ------------------------ | ---- | ------------------- | ----------------------------- | ----------------- |
| `src/api/event/event.ts` | 56   | `saveEventInfo`     | `updateEventInfo`             | "save" 为禁止动词 |
| `src/api/event/event.ts` | 115  | `removeService`     | `adminDeleteEventService`     | "remove"→"delete" |
| `src/api/event/event.ts` | 120  | `removeParticipant` | `adminDeleteEventParticipant` | "remove"→"delete" |

---

### 4. API：`ai/index.ts:8` request.post 缺少泛型参数

```typescript
// 当前
export const chatWithAI = (data: AiChatRequest): Promise<AiChatResponse> => {
  return request.post('/api/ai/front/ai/chat', data, { timeout: AI_CHAT_TIMEOUT_MS })
}

// 应改为
export const chatWithAI = (data: AiChatRequest): Promise<AiChatResponse> => {
  return request.post<AiChatResponse>('/api/ai/front/ai/chat', data, {
    timeout: AI_CHAT_TIMEOUT_MS,
  })
}
```

---

### 5. API：`trade/order.ts:18-22` 手动 URLSearchParams 构造

应传 `{ params }` 给 Axios 让其自动序列化，而非手动构造查询字符串。

```typescript
// 当前（第 18-22 行）
const params = new URLSearchParams()
ticketTypeIds.forEach((id) => params.append('ticketTypeIds', String(id)))
return request.get<Record<string, number>>(
  `/api/order/front/ticket-orders/purchase-counts?${params.toString()}`,
)

// 应改为
return request.get<Record<string, number>>('/api/order/front/ticket-orders/purchase-counts', {
  params: { ticketTypeIds: ticketTypeIds.map(String) },
})
```

---

### 6. API：`ai/index.ts` 包含业务代码而非 barrel export

与其他 API 模块模式不一致。其他模块（`account/index.ts`、`event/index.ts` 等）的 `index.ts` 是纯 barrel re-export。`ai/index.ts` 应：

- 将 `chatWithAI` 函数移到 `ai/chat.ts`
- `index.ts` 改为 `export * from './chat'` + `export * from './types'`

---

### 7. Query Key：硬编码 `['admin-notices']`

**文件**：`src/composables/admin/list-pages/useNoticeListPage.ts:13`

```typescript
// 当前
const adminNoticesQueryKey = ['admin-notices']

// 应改为
const adminNoticesQueryKey = queryKeys.admin.list('notices')
```

违反 AGENTS.md 强制规则：所有 query key 必须来自 `queryKeys` 对象。

---

### 8. Composable：移除空桩

| 文件                                                      | 内容        | 操作                           |
| --------------------------------------------------------- | ----------- | ------------------------------ |
| `src/composables/event/useSearchHistory.ts`               | `return {}` | 直接删除（或实现搜索历史功能） |
| `src/composables/admin/list-pages/useCategoryDragSort.ts` | `return {}` | 直接删除（或实现拖拽排序功能） |

---

### 9. Dialog 违规：`v-if` 在 Dialog 组件上

**文件**：`src/views/admin/OrderListView.vue:77`

```vue
<!-- 当前 — 会导致退出动画跳过、scroll lock 残留、页面卡死 -->
<OrderDetailDialog v-if="showDetailDialog" ... />

<!-- 应改为 -->
<OrderDetailDialog :open="showDetailDialog" @update:open="showDetailDialog = $event" />
```

违反 ESLint `dialog-no-vif-with-open` 强制规则（`eslint.config.ts:42-53`）。

---

## 🟠 P1 — 高优（架构一致性，影响可维护性）

### 10. API：17 个冗余函数——直接删除（不用 `@deprecated`）

**策略**：先迁移所有调用方到规范名称，然后直接删除冗余函数。

| 文件                   | 删除（冗余函数）         | 保留（规范名称）            |
| ---------------------- | ------------------------ | --------------------------- |
| `event/banner.ts`      | `fetchBanners`           | `fetchBannerList`           |
| `event/banner.ts`      | `fetchAdminBanners`      | `fetchAdminBannerList`      |
| `event/category.ts`    | `fetchCategories`        | `fetchCategoryList`         |
| `event/category.ts`    | `fetchAdminCategories`   | `fetchAdminCategoryList`    |
| `event/city.ts`        | `fetchGroupedCities`     | `fetchGroupedCityList`      |
| `event/city.ts`        | `fetchCitiesList`        | `fetchCityList`             |
| `event/city.ts`        | `fetchAdminCities`       | `fetchAdminCityList`        |
| `event/notice.ts`      | `fetchAdminNotices`      | `fetchAdminNoticeList`      |
| `event/participant.ts` | `fetchAdminParticipants` | `fetchAdminParticipantList` |
| `event/participant.ts` | `fetchParticipantDetail` | `fetchParticipantById`      |
| `event/series.ts`      | `fetchAdminSeries`       | `fetchAdminSeriesList`      |
| `event/service.ts`     | `fetchAdminServices`     | `fetchAdminServiceList`     |
| `event/venue.ts`       | `fetchAdminVenues`       | `fetchAdminVenueList`       |
| `event/venue.ts`       | `fetchVenueDetail`       | `fetchVenueById`            |
| `trade/workOrder.ts`   | `replyWorkOrder`         | `submitWorkOrderReply`      |
| `trade/workOrder.ts`   | `replyAdminWorkOrder`    | `submitAdminWorkOrderReply` |

**执行步骤**：

1. 搜索所有调用方，将引用替换为规范名称
2. 直接删除冗余函数定义（不留 `@deprecated`）

---

### 11. 目录规范：移动非 Composable 文件

| 当前路径                                    | 应移至                          | 原因                                                                                    |
| ------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| `src/composables/event/eventDetailState.ts` | `src/utils/eventDetailState.ts` | 纯工具函数（`isTicketTypeOnSale`、`calculateMaxTicketQuantity` 等），无 composable 模式 |
| `src/composables/trade/checkoutState.ts`    | `src/utils/checkoutState.ts`    | 纯工具函数（`getCheckoutStatusFlags`、`getRemainSeconds` 等）                           |

---

### 12. 参数命名：8 个文件分页参数名统一

以下 8 个文件使用 `query` 作为分页参数名，其他文件使用 `params`。统一为 `params`：

| 文件                           | 行号 |
| ------------------------------ | ---- |
| `src/api/event/banner.ts`      | 21   |
| `src/api/event/category.ts`    | 27   |
| `src/api/event/city.ts`        | 34   |
| `src/api/event/notice.ts`      | 19   |
| `src/api/event/participant.ts` | 21   |
| `src/api/event/series.ts`      | 19   |
| `src/api/event/service.ts`     | 21   |
| `src/api/event/venue.ts`       | 19   |

---

### 13. 死代码：直接删除 10+ 个无调用的 API 函数（不用 `@deprecated`）

以下函数在整个代码库中调用次数为 0，直接删除：

- `fetchBanners`（被 `fetchBannerList` 替代）
- `fetchCategories`（被 `fetchCategoryList` 替代）
- `fetchAdminBanners` → 保留 `fetchAdminBannerList`
- `fetchAdminCategories` → 保留 `fetchAdminCategoryList`
- `fetchAdminNotices` → 保留 `fetchAdminNoticeList`
- `fetchAdminParticipants` → 保留 `fetchAdminParticipantList`
- `fetchAdminServices` → 保留 `fetchAdminServiceList`
- `fetchAdminSeries` → 保留 `fetchAdminSeriesList`
- `fetchAdminVenues` → 保留 `fetchAdminVenueList`
- `fetchParticipantDetail`（被 `fetchParticipantById` 替代）
- `fetchVenueDetail`（被 `fetchVenueById` 替代）

**执行步骤**：

1. 先用 `lsp_find_references` 逐个验证确实无调用方
2. 直接删除函数定义

---

### 14. TypeScript：23 个 composable 缺少显式返回类型

以下文件的 `useXxx()` 函数缺少显式返回类型注解：

- `useAdminListPage`、`useAdminUserListPage`、`useAdminWorkOrderListPage`
- `useBannerList`、`useBannerListPage`
- `useCategoryListPage`、`useCategoryDragSort`、`useCategoryTree`
- `useCityListPage`、`useNoticeListPage`、`useOrderListPage`
- `useParticipantListPage`、`useSeriesListPage`
- `useServiceList`、`useServiceListPage`
- `useTicketListPage`、`useVenueListPage`
- `useConfirmDialog`
- `useParticipantDetailPage`、`useTicketDetailPage`
- `useProfilePageContext`

---

### 15. Import：12 个文件存在同源拆分的重复 import

| 文件                    | 来源                    | 问题                |
| ----------------------- | ----------------------- | ------------------- |
| `AdminFormDialog.vue`   | `'vue'`                 | type + value 分两行 |
| `DataTableCrud.vue`     | `'@tanstack/vue-table'` | type + value 分两行 |
| `TableCardView.vue`     | `'@tanstack/vue-table'` | 同上                |
| `AlertDialog.vue`       | `'reka-ui'`             | 同上                |
| `AlertDialogAction.vue` | `'reka-ui'`             | 同上                |
| `AvatarFallback.vue`    | `'reka-ui'`             | 同上                |
| `Badge.vue`             | `'reka-ui'`             | 同上                |
| `Button.vue`            | `'reka-ui'`             | 同上                |
| `event/types/event.ts`  | `'./venue'`             | 5 次拆分 import     |

合并为：`import { Foo, type Bar } from '...'`

---

### 16. Barrel：composables 目录缺少 10 个文件导出

| Barrel 文件                        | 缺失导出                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/composables/event/index.ts`   | `useSearchFilters`、`useSearchHistory`、`useSearchResults`                                          |
| `src/composables/profile/index.ts` | `useFollowList`、`usePassengerDelete`、`usePassengerForm`、`usePassengerList`、`useProfileUserInfo` |
| `src/composables/trade/index.ts`   | `useRefundDialog`                                                                                   |

---

## 🟡 P2 — 中优（代码质量，降低理解成本）

### 17. JSDoc：60+ 个 API 函数缺少文档

所有 `src/api/` 下的导出函数均缺少 JSDoc。建议模板：

```typescript
/** 获取 {Entity} 分页列表（后台） */
export const fetchAdminEventPage = (params: EventPageRequest) => ...
```

---

### 18. 语法一致性：block arrow vs concise arrow

| 模块                 | 当前语法             |
| -------------------- | -------------------- |
| `ticket/ticket.ts`   | `=> { return ...; }` |
| `trade/order.ts`     | `=> { return ...; }` |
| `trade/payment.ts`   | `=> { return ...; }` |
| `trade/workOrder.ts` | `=> { return ...; }` |
| 其他所有 API 文件    | `=> ...`（concise）  |

统一为 concise arrow 风格。

---

### 19. CRUD 统一：改用 `useAdminCrud`

| 文件                                                    | 问题                                  |
| ------------------------------------------------------- | ------------------------------------- |
| `composables/admin/list-pages/useAdminEventListPage.ts` | 手动实现分页+表单+mutations（135 行） |
| `composables/admin/list-pages/useAdminUserListPage.ts`  | 手动实现（70 行）                     |
| `composables/admin/list-pages/useNoticeListPage.ts`     | 手动实现（154 行）                    |

参考 `useCityListPage.ts`（84 行，使用 `useAdminCrud`）作为模板重构。

---

### 20. 重构：拆分 `useEventDetailPage` God Object

**文件**：`src/composables/event/useEventDetailPage.ts`（168 行）

当前处理 8 个关注点：event detail、passenger list、ticket selection、follow toggle、purchase count、order creation、buy-now flow、route navigation。

建议拆分为：

- `useEventDetail` — 活动详情查询
- `useEventPassengerFlow` — 购票人相关
- `useEventPurchaseLogic` — 下单/立即购买
- `useEventTicketSelection` — 已存在，直接复用

---

### 21. 重构：消除 `useProfilePage` 透传壳

**文件**：`src/composables/profile/useProfilePage.ts`（139 行）

当前仅聚合 7 个子 composable 并透传所有属性（80+ 行 return block），无自身逻辑。建议在 `ProfileView.vue` 中直接调用子 composable。

---

### 22. 错误提示：5 个表单校验静默失败

| 文件                   | 行号    | 问题                                         |
| ---------------------- | ------- | -------------------------------------------- |
| `useAdminListPage.ts`  | 112     | `if (!form.mobile) return` 无 toast          |
| `useBannerDialog.ts`   | 100     | `if (!form.cityId \|\| ...) return` 无 toast |
| `useNoticeListPage.ts` | 116     | `if (!form.name) return` 无 toast            |
| `useCategoryDialog.ts` | 106,119 | `if (!form.name) return` 无 toast            |
| `useServiceDialog.ts`  | 77      | `if (!serviceForm.name) return` 无 toast     |

应添加 toast 提示用户哪个字段缺失。

---

### 23. 去重：`refreshPassengerList` 逻辑

| 文件                                        | 行号  |
| ------------------------------------------- | ----- |
| `composables/profile/usePassengerDelete.ts` | 22-23 |
| `composables/profile/usePassengerForm.ts`   | 51-52 |

两处定义了完全相同的 `refreshPassengerList` 函数。提取到共享位置。

---

### 24. Import 排序：~24 个业务文件顺序违规

约定：Vue → Router/Pinia → 第三方 → `@/` 内部

违规示例：

- `NavUser.vue:5` — lucide-vue-next 在 `@/stores` 之后
- `useSearchFilters.ts:7` — dayjs 在 `@/constants` 之后
- `useSearchResults.ts:8` — vue 在第三方之后
- `CarouselNext.vue:4` — lucide-vue-next 在 `@/` 内部之后

建议配置 `eslint-plugin-import` 自动排序。

---

## 🟢 P3 — 低优（锦上添花，长期工程）

### 25. TypeScript：4 个文件 `Array<T>` → `T[]`

- `src/components/admin/listPageColumns.ts:48`
- `src/components/common/header/HeaderUserMenu.vue:15`
- `src/constants/event.ts:3`
- `src/constants/profile.ts:27`

---

### 26. 类型：减少 `| null | undefined` 三重可空

以下 7 个函数使用三重可空签名：

- `src/utils/format.ts:17-48` — 7 个 format 函数
- `src/composables/trade/useRefundDialog.ts:9`
- `src/composables/trade/checkoutState.ts:38`

建议统一为 `| undefined` 或 `| null`，二者择一。

---

### 27. 测试：13 个空 `__tests__` 目录

所有测试目录均为空，整个项目零测试覆盖：

```
src/api/__tests__/
src/components/__tests__/
src/composables/admin/common/__tests__/
src/composables/admin/event-edit/__tests__/
src/composables/admin/list-pages/__tests__/
src/composables/ai/__tests__/
src/composables/auth/__tests__/
src/composables/common/__tests__/
src/composables/event/__tests__/
src/composables/profile/__tests__/
src/composables/ticket/__tests__/
src/composables/trade/__tests__/
src/utils/__tests__/
```

**建议优先级**：先为核心 composable 补单测：

1. `useDialog` / `usePagination` / `useConfirmDialog`
2. `useAdminCrud`（被多个页面复用）
3. `useCheckoutPage` / `useEventDetailPage`（核心业务流程）
4. 后台 list pages composable

---

### 28. Barrel 清理

| 文件                             | 问题                                                              | 操作                          |
| -------------------------------- | ----------------------------------------------------------------- | ----------------------------- |
| `composables/useAuthStore.ts`    | 文件名暗示是 composable，实际导出 `createAuthStore` 工厂函数      | 重命名为 `createAuthStore.ts` |
| `composables/useAIChat.ts`       | 1 行 redirect `export * from './ai/useAIChat'`                    | 直接删除，引用 `ai/useAIChat` |
| `composables/useViewMode.ts`     | 1 行 redirect `export * from './common/useViewMode'`              | 直接删除                      |
| `src/components/common/index.ts` | 直接导出 shadcn 组件（Button、Input），这些组件已被 auto-register | 删除重复导出                  |

---

### 29. Bug：`useProfileSection.ts:40` router.replace → router.push

```typescript
// 当前
router.replace({ query: { ...route.query, section: key } })

// 应改为
router.push({ query: { ...route.query, section: key } })
```

`replace` 会破坏浏览器后退按钮历史。

---

### 30. Bug：`useOrderList.ts`

- **第 63 行**：`orderList` 是 computed，内部再 `.value` 访问另一个 computed，然后 `paginatedOrders`（第 68 行）又包了一层 computed。双重包裹可简化为直接导出 `orderList`。

---

### 31. 模式：`useHomePage.ts:66-100` 手动 fetch

当前用 `ref<Map>` 管理手动 fetch 状态，绕过 TanStack Query 缓存。应改为：

```typescript
// 为每个 category 使用 useQuery({ enabled: true })
```

---

### 32. 样式：`EventDetailView.vue:164` 缺少 scoped

```vue
<!-- 当前 -->
<style>
.rich-text-content { ... }
</style>

<!-- 应改为 -->
<style scoped>
.rich-text-content { ... }
</style>
```

---

### 33. Tailwind class 顺序

~20 个文件使用 `flex items-center gap-N`，推荐顺序为 `flex gap-N items-center`。

影响文件包括：`NavUser.vue`、`TableCardView.vue`、`TablePagination.vue`、`HeaderCitySelector.vue`、`DateTimePicker.vue`、`ImageUpload.vue`、`RichTextEditor.vue` 等。

建议添加 `eslint-plugin-tailwindcss` 自动排序。

---

## 统计

| 优先级   | 项目数 | 预计工时   |
| -------- | ------ | ---------- |
| 🔴 P0    | 9      | 4-6h       |
| 🟠 P1    | 7      | 6-8h       |
| 🟡 P2    | 8      | 8-12h      |
| 🟢 P3    | 9      | 12-20h     |
| **合计** | **33** | **30-46h** |

## 正向发现

- 无 `as any` 使用、无 `any` 类型标注
- 无直接 axios 调用、无 `console.log`
- 27 个视图全部正确委托给 composable（无内联业务逻辑）
- 268/289 .vue 文件使用 `<script setup>`
- API 全部走 `request` 封装，拦截器/归一化/错误处理集中管理

---

_审计日期：2026-05-02 · 方法：6 个并行 explore agent + 直接结构分析_
_策略：不使用 `@deprecated`，冗余代码直接删除（先迁移调用方）_
