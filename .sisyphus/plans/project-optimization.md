# 项目优化 TODO 清单

> 本清单汇总了 damai-web 项目在架构、代码质量、工程规范等方面的所有待优化项。
> 基于三阶段 Dialog 重构后的全面代码扫描生成。

## 项目概况

- Vue 组件：281 个
- TypeScript 文件：201 个
- Composables：70 个
- 总行数：~31,000 行
- Dialog 组件：36 个
- 测试覆盖：30%（composable）/ 0%（views & components）

---

## 执行策略

按优先级分波次执行，每波次内任务可并行：

- **🔴 Wave 1（立即）**：影响稳定性、有生产风险
- **🟡 Wave 2（本周）**：影响可维护性、开发体验
- **🟢 Wave 3（本月）**：锦上添花、技术债务

---

## 验收标准（通用）

每个任务完成后必须满足：

- [ ] `npm run type-check` 通过
- [ ] `npm run lint:oxlint` 通过
- [ ] `npm run lint:check` 通过
- [ ] 不破坏现有功能（关键路径手动验证）

---

## TODOs

---

## Wave 1：高优先级（立即执行）

### T1. 统一错误处理策略

**问题**：三种错误反馈模式并存，同一类错误在不同页面表现不一致

- `request.ts` 全局 toast（网络/权限错误）
- composable mutation `onError` 再 toast（重复提示）
- 表单 field error（校验错误）

**修复方案**：

1. `request.ts` 只处理网络/权限/登录失效错误
2. composable 中移除 mutation `onError` 里的 toast（避免重复）
3. 表单校验错误用 field error 展示
4. 业务操作结果（成功/失败）统一在调用处 toast

**涉及文件**：

- `src/api/request.ts`
- `src/composables/admin/event-edit/*.ts`（大量 toast）
- `src/composables/trade/useRefundDialog.ts`
- `src/composables/trade/useCheckoutPage.ts`

**验收标准**：

- [ ] 同一个请求失败时只出现一次 toast
- [ ] 表单提交失败时错误显示在对应字段
- [ ] `npm run type-check` 通过

---

### T2. 集中管理硬编码文案

**问题**：toast 文案、错误提示、UI 文本分散在 15+ 个文件，重复且不一致

**修复方案**：

1. 新建 `src/constants/copy.ts`
2. 按模块分组：

   ```ts
   export const TOAST_COPY = {
     refundSubmitted: '退款申请已提交',
     refundFailed: '退款申请失败，请稍后重试',
     inventoryAdjusted: '库存调整成功',
     inventoryAdjustFailed: '调整失败，请重试',
     // ...
   }

   export const FORM_COPY = {
     nameRequired: '请输入名称',
     priceInvalid: '请输入有效价格',
     // ...
   }

   export const COMMON_COPY = {
     save: '保存',
     cancel: '取消',
     confirm: '确认',
     delete: '删除',
     saving: '保存中...',
     loading: '加载中...',
     loadFailed: '加载失败，请稍后重试',
     noData: '暂无数据',
   }
   ```

3. 逐步迁移现有硬编码文案（优先 toast）

**涉及文件**：

- `src/composables/admin/event-edit/useSessionList.ts`（8 处 toast）
- `src/composables/admin/event-edit/useTicketTypeDialog.ts`（6 处）
- `src/composables/admin/event-edit/useEventServicesTab.ts`（5 处）
- `src/composables/admin/event-edit/useEventBasicTab.ts`（5 处）
- `src/composables/admin/event-edit/useEventParticipantsTab.ts`（4 处）
- `src/composables/trade/useRefundDialog.ts`（2 处）
- `src/composables/trade/useCheckoutPage.ts`（2 处）

**验收标准**：

- [ ] 新建 `src/constants/copy.ts`
- [ ] 所有 toast 文案引用常量
- [ ] `npm run lint:oxlint` 通过
- [ ] 不破坏现有文案显示

---

### T3. 拆分巨型 Composable

**问题**：7 个 composable 超过 200 行，职责过重

**拆分清单**：

| 文件                        | 当前行数 | 拆分方案                                                                        |
| --------------------------- | -------- | ------------------------------------------------------------------------------- |
| `useServiceListPage.ts`     | 289      | 拆分为 `useServiceList.ts` + `useServiceOptions.ts` + `useServiceDialog.ts`     |
| `useEventSearchPage.ts`     | 256      | 拆分为 `useSearchFilters.ts` + `useSearchHistory.ts` + `useSearchResults.ts`    |
| `useCategoryListPage.ts`    | 253      | 拆分为 `useCategoryTree.ts` + `useCategoryDialog.ts` + `useCategoryDragSort.ts` |
| `useBannerListPage.ts`      | 208      | 拆分为 `useBannerList.ts` + `useBannerDialog.ts`                                |
| `useAdminCrud.ts`           | 207      | 保持，但优化泛型复杂度                                                          |
| `useEventBasicTab.ts`       | 196      | 拆分为表单逻辑 + 提交逻辑                                                       |
| `usePassengerManagement.ts` | 181      | 已完成 useDialog 迁移，可再拆列表/表单/删除                                     |

**验收标准**：

- [ ] 每个拆分后的 composable ≤150 行
- [ ] 对外 API 保持不变（向后兼容）
- [ ] `npm run type-check` 通过
- [ ] 所有相关视图正常运作

---

## Wave 2：中优先级（本周）

### T4. 拆分巨型 API 类型文件

**问题**：`src/api/event/types.ts` 556 行，包含 Event/Session/TicketType/Category/Series/City/Venue 等所有类型

**修复方案**：

1. 按领域拆分为独立文件：
   ```
   src/api/event/
     types/
       event.ts      # EventVO, EventPageRequest
       session.ts    # SessionVO, SessionItem
       ticketType.ts # TicketTypeVO, TicketTypeForm
       category.ts   # CategoryVO
       series.ts     # SeriesVO
       city.ts       # CityVO
       venue.ts      # VenueVO
   ```
2. 原 `types.ts` 改为 barrel export
3. 删除重复的 `AdminPageResponseXxxVO`，统一使用 `PaginatedResponse<T>`

**涉及文件**：

- `src/api/event/types.ts` → 拆分为 7 个文件
- `src/api/trade/types.ts` → 检查是否需要拆分
- `src/api/account/types.ts` → 检查是否需要拆分

**验收标准**：

- [ ] 每个类型文件 ≤150 行
- [ ] 原导入路径保持兼容（barrel export）
- [ ] `npm run type-check` 通过

---

### T5. 统一 API 函数命名

**问题**：动词不统一（fetch/get/create/reply/close/adjust/copy），开发者难以记忆

**修复方案**：

1. 建立命名约定文档 `docs/api-naming.md`
2. 按规则重命名：
   - `fetchXxxPage` → 分页查询
   - `fetchXxxById` → 详情
   - `fetchXxxList` → 不分页列表
   - `createXxx` → 创建
   - `updateXxx` → 更新
   - `deleteXxx` → 删除
   - `submitXxx` → 提交（工单回复/退款等）
   - `closeXxx` → 关闭（工单/订单）
3. 保留旧名称作为 alias（向后兼容），标记 `@deprecated`

**涉及文件**：

- `src/api/trade/workOrder.ts`：`replyWorkOrder` → `submitWorkOrderReply`
- `src/api/trade/order.ts`：检查命名
- `src/api/event/event.ts`：检查命名

**验收标准**：

- [ ] 新建 `docs/api-naming.md`
- [ ] 所有 API 函数符合命名约定
- [ ] 旧名称标记 deprecated，IDE 会提示
- [ ] `npm run type-check` 通过

---

### T6. 补充核心流程测试

**问题**：Views 和 Dialog 组件测试覆盖 0%，仅 composables 有 30%

**修复方案**：

1. 优先为以下核心流程写测试：
   - 打开 Dialog → 填写表单 → 提交 → 关闭 → 列表刷新
   - 分页切换
   - 筛选条件变更
2. 使用 Vitest + Vue Test Utils
3. Mock API 函数，不访问真实后端

**涉及文件**：

- `src/composables/trade/useRefundDialog.ts` → `useRefundDialog.test.ts`
- `src/composables/profile/useWorkOrderList.ts` → `useWorkOrderList.test.ts`
- `src/components/features/profile/ProfileWorkOrderDetailDialog.vue` → 组件测试

**验收标准**：

- [ ] 新增测试文件 ≥5 个
- [ ] 测试覆盖率从 30% 提升到 50%
- [ ] `npm run test` 全部通过

---

### T7. 优化常量/枚举管理

**问题**：

- `ORDER_STATUS` 和 `WORK_ORDER_STATUS` 数字重复但语义不同
- `PASSENGER_CERT_TYPES = ['身份证']` 不易扩展
- 缺少状态到文案的映射

**修复方案**：

1. 添加命名空间前缀避免冲突：
   ```ts
   export const ORDER_STATUS = { PENDING: 0, PAID: 1, ... } as const
   export const WORK_ORDER_STATUS = { PENDING: 0, PROCESSING: 1, ... } as const
   ```
2. 建立状态到文案的映射：
   ```ts
   export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
     [ORDER_STATUS.PENDING]: '待付款',
     [ORDER_STATUS.PAID]: '已支付',
     // ...
   }
   ```
3. `PASSENGER_CERT_TYPES` 改为对象格式：
   ```ts
   export const PASSENGER_CERT_TYPES = {
     ID_CARD: { value: 1, label: '身份证' },
   } as const
   ```

**涉及文件**：

- `src/constants/trade.ts`
- `src/constants/profile.ts`
- `src/utils/statusMappers.ts`

**验收标准**：

- [ ] 所有状态枚举使用 `as const`
- [ ] 有对应的 `{STATUS}_LABEL` 映射
- [ ] `npm run type-check` 通过

---

## Wave 3：低优先级（本月）

### T8. 优化 Pinia Store

**问题**：

- `user.ts` 和 `admin.ts` 结构相似但未抽象
- `isLoggedIn` 每次访问都重新计算
- store 数据和 query 数据重复（`userInfo`）

**修复方案**：

1. 使用 `computed` 优化：
   ```ts
   export const useUserStore = defineStore('user', () => {
     const token = useStorage('user-token', '')
     const userInfo = useStorage('user-info', {} as UserVO)
     const isLoggedIn = computed(() => Boolean(token.value))
     return { token, userInfo, isLoggedIn }
   })
   ```
2. 提取公共 store 模式：
   ```ts
   // composables/common/useAuthStore.ts
   export function createAuthStore<T>(key: string) {
     const token = useStorage(`${key}-token`, '')
     const info = useStorage(`${key}-info`, {} as T)
     const isLoggedIn = computed(() => Boolean(token.value))
     return { token, info, isLoggedIn }
   }
   ```

**涉及文件**：

- `src/stores/user.ts`
- `src/stores/admin.ts`

**验收标准**：

- [ ] `isLoggedIn` 使用 `computed`
- [ ] 不破坏现有登录/登出流程
- [ ] `npm run type-check` 通过

---

### T9. 统一 defineProps 风格

**问题**：三种模式并存

- 模式 A：`interface Props` + `defineProps<Props>()`
- 模式 B：inline `defineProps<{ open: boolean }>()`
- 模式 C：`withDefaults(defineProps<Props>(), { ... })`

**修复方案**：

1. 统一规范：
   - 简单组件（props ≤3）：使用模式 B
   - 复杂组件（props >3 或有默认值）：使用模式 C
   - 不使用单独 interface 定义（减少文件行数）
2. ESLint 规则（可选）

**涉及文件**：

- `src/components/features/**/*.vue`（约 50 个文件）

**验收标准**：

- [ ] 所有组件使用统一风格
- [ ] `npm run lint:check` 通过

---

### T10. 清理 console.log 和 TODO/FIXME

**数据**：

- console.log：未发现（项目已清理）
- TODO/FIXME：仅 1 处（`ChartTooltipContent.vue`）

**修复方案**：

1. 处理 `ChartTooltipContent.vue` 中的 TODO
2. 添加 ESLint 规则禁止 `console.log`

**涉及文件**：

- `src/components/common/ui/chart/ChartTooltipContent.vue`
- `eslint.config.ts`

**验收标准**：

- [ ] 项目中无 TODO/FIXME 注释
- [ ] ESLint 规则禁止 `console.log`
- [ ] `npm run lint:check` 通过

---

### T11. 清理 any 类型

**问题**：

- `src/components/common/ui/**` 允许 `any`
- `ChartTooltipContent.vue` 中有 `Record<string, any>`

**修复方案**：

1. 将 `Record<string, any>` 改为 `Record<string, unknown>`
2. 添加类型守卫使用

**涉及文件**：

- `src/components/common/ui/chart/ChartTooltipContent.vue`
- 其他业务代码中的 `any`（eslint 已禁止，应极少）

**验收标准**：

- [ ] 业务代码中 `any` 数量为 0
- [ ] `npm run type-check` 通过

---

### T12. 拆分巨型组件

**问题**：6 个组件超过 200 行

| 文件                                | 行数 | 拆分方案                                                            |
| ----------------------------------- | ---- | ------------------------------------------------------------------- |
| `SessionList.vue`                   | 308  | 提取 `useSessionDragSort.ts`，表单弹窗独立                          |
| `DataTableCrud.vue`                 | 303  | 拆分为 `DataTable.vue` + `TablePagination.vue` + `TableToolbar.vue` |
| `CommonDataTableCrud.vue`           | 303  | 同上                                                                |
| `EventDetailHero.vue`               | 246  | 提取 `useEventFollow.ts`，关注逻辑下沉                              |
| `WorkOrderDetailDialog.vue` (admin) | 218  | 已提取基组件，可进一步精简                                          |
| `ScanCheckinDialog.vue`             | 217  | 提取扫码/手动输入为独立子组件                                       |

**验收标准**：

- [ ] 每个组件 ≤180 行
- [ ] `npm run type-check` 通过
- [ ] UI 表现不变

---

### T13. 建立自动导入文档

**问题**：`unplugin-auto-import` 自动导入了大量 API，新开发者不知道来源

**修复方案**：

1. 新建 `docs/auto-imports.md`
2. 列出所有自动导入的模块：
   - Vue API：`ref`, `computed`, `watch`, `onMounted`...
   - Vue Router：`useRoute`, `useRouter`, `useLink`...
   - Pinia：`defineStore`, `storeToRefs`...
   - TanStack Query：`useQuery`, `useMutation`, `useQueryClient`...
   - VueUse：`useStorage`, `useEventListener`...
   - 工具函数：`cn`, `clsx`, `twMerge`...

**验收标准**：

- [ ] 新建 `docs/auto-imports.md`
- [ ] 覆盖所有自动导入的 API
- [ ] 说明哪些需要手动 import（业务组件）

---

### T14. 建立 API 层文档

**问题**：API 函数分布在 35+ 个文件，新开发者不知道接口在哪

**修复方案**：

1. 新建 `docs/api-directory.md`
2. 按领域列出所有 API 文件和功能：
   ```
   ## 订单 (src/api/trade/)
   - `order.ts`: 订单创建、查询、取消
   - `payment.ts`: 支付创建、查询
   - `refund.ts`: 退款申请
   - `workOrder.ts`: 工单查询、回复、关闭
   ```

**验收标准**：

- [ ] 覆盖所有 API 文件
- [ ] 每个文件列出核心函数

---

---

## 已完成（归档参考）

### 阶段 1：Dialog 紧急修复

- [x] 新建 `useDialog.ts` 通用封装
- [x] 迁移 `useRefundDialog.ts` 到 `useDialog`
- [x] 迁移 `useEventSearchDateDialog.ts` 到 `useDialog`
- [x] 迁移 `usePassengerManagement.ts` 到 `useDialog`
- [x] 批量修复 `v-if` + Dialog 混用（12 个文件）

### 阶段 2：架构治理

- [x] 拆分 `useProfilePage.ts` God Object（提取 `useProfileUserInfo.ts`）
- [x] 统一前后台 WorkOrder 弹窗 API 命名（`submit-reply` → `reply`）

### 阶段 3：规范建立

- [x] 新建 `DialogTemplate.vue` 组件模板
- [x] 新建 `FormDialogTemplate.vue` 组件模板
- [x] 新建 `docs/ui-guidelines.md` Dialog 使用规范
- [x] ESLint 规则：禁止 Dialog 使用 `v-if`

---

## 数据统计（基线）

| 指标                         | 当前值 | 目标值                  |
| ---------------------------- | ------ | ----------------------- |
| Dialog 使用 `useDialog` 比例 | 4/20   | 20/20                   |
| `v-if` + Dialog 违规         | 0      | 0                       |
| Composable 测试覆盖          | 30%    | 60%                     |
| 硬编码 toast 文案文件        | 15+    | 0（全部迁移到 copy.ts） |
| 超过 200 行的 composable     | 7      | ≤3                      |
| 超过 200 行的组件            | 6      | ≤3                      |

---

## 依赖关系图

```
Wave 1:
  T1 (错误处理统一) → T2 (文案集中管理)
  T3 (拆分巨型 composable) 独立

Wave 2:
  T4 (API 类型拆分) 依赖：无
  T5 (API 命名统一) 依赖：无
  T6 (测试补充) 依赖：T3 完成
  T7 (常量管理) 依赖：无

Wave 3:
  T8+ 全部独立
```

---

_清单生成时间：2026-05-02_
_最后更新：见 git log_
