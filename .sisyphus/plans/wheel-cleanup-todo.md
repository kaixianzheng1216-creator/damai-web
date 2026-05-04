# 造轮子清理 TODO 清单

> 基于 `src/` 全部 458 个文件的深度审计。所有修改后需通过 `npm run type-check` 和 `npm run build`。

---

## Wave 5 — HIGH 优先级

### T1: `TablePagination.vue` → shadcn `<Pagination>`

- [ ] **文件**: `src/components/admin/TablePagination.vue`（126 行）
- [ ] **问题**: 完全手写的分页组件（prev/next/first/last 按钮、页码显示、page-size Select）
- [ ] **影响**: ~20 个消费者（全部 14 个 admin 列表页 + 6 个 profile 页面）
- [ ] **方案**: 重写为 shadcn `<Pagination>`（已安装，`SearchResultsPanel.vue` 有参考实现）
- [ ] **验证**: 所有 admin 列表页和 profile 订单/工单页分页功能正常

### T2: `useSearchFilters.ts` → Zod Schema

- [ ] **文件**: `src/composables/event/useSearchFilters.ts`
- [ ] **问题**: 30+ 行手写 `typeof` 检查 + `Number()` 强制转换 + 逐字段 fallback
- [ ] **方案**: 定义 Zod schema，用 `.parse()` 或 `.safeParse()` 替换全部手动解析
- [ ] **验证**: 搜索页筛选条件正常解析，URL query 同步无误

### T3: `DateTimePicker.vue` → dayjs 统一

- [ ] **文件**: `src/components/common/DateTimePicker.vue`
- [ ] **问题**: 手写 `padStart` + `split` + `parseInt` 解析 ISO 字符串；手写模板字符串拼装日期
- [ ] **方案**:
  - 解析: `dayjs(val).year()` / `.month()` / `.date()` / `.hour()` / `.minute()`
  - 格式化: `dayjs().format('YYYY-MM-DDTHH:mm')`
  - 删除自定义 `pad` 函数
- [ ] **验证**: 日期选择、时间输入、表单提交值格式正确

### T4: `useEventSearchDateDialog.ts` → dayjs 统一

- [ ] **文件**: `src/composables/event/useEventSearchDateDialog.ts`
- [ ] **问题**: 与 `DateTimePicker.vue` 重复的 `padDatePart` + `formatCalendarDate` / `parseCalendarDate`
- [ ] **方案**: 删除本文件中的日期工具函数，统一调用 `src/utils/format.ts` 中的 dayjs 工具
- [ ] **验证**: 日期搜索弹窗正常打开/关闭，日期值传递正确

### T5: `format.ts` → `Intl.NumberFormat`

- [ ] **文件**: `src/utils/format.ts:8`
- [ ] **问题**: `(price / 100).toFixed(2)` 用于货币格式化，存在四舍五入精度风险
- [ ] **方案**: `new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(price / 100)`
- [ ] **验证**: 价格显示正确（含边界值如 0.005 元）

### T6: `ScanCheckinDialog.vue` → `useTimeoutFn` / `nextTick`

- [ ] **文件**: `src/components/features/admin-ticket/ScanCheckinDialog.vue`
- [ ] **问题**: 4 处 `setTimeout`（2s token 重置、100ms DOM 等待 x2、10s import timeout）
- [ ] **方案**:
  - 2s 延迟 → `useTimeoutFn`
  - 100ms DOM 等待 → `await nextTick()`
  - 10s import timeout → VueUse `useTimeoutFn` 或保持原样
- [ ] **验证**: 扫码流程正常，组件卸载时无 pending timeout

---

## Wave 6 — UI 组件类 MEDIUM

### T7: `ImageUpload.vue` div 冒充 button → `<Button>`

- [ ] **文件**: `src/components/common/ImageUpload.vue:202-209`
- [ ] **问题**: `div` + `role="button"` + `tabindex="0"` + `@keydown.enter/space`
- [ ] **方案**: 替换为 shadcn `<Button variant="ghost">`
- [ ] **验证**: 上传区域可点击、可键盘操作

### T8: `RichTextEditor.vue` 分隔线 x4 → `<Separator>`

- [ ] **文件**: `src/components/common/RichTextEditor.vue:123,155,170,196`
- [ ] **问题**: `<div class="w-px h-[18px] bg-border mx-1 shrink-0" />`
- [ ] **方案**: `<Separator orientation="vertical" class="mx-1 h-5" />`
- [ ] **验证**: 编辑器工具栏分隔线样式不变

### T9: `RichTextEditor.vue` title 提示 x6 → `<Tooltip>`

- [ ] **文件**: `src/components/common/RichTextEditor.vue:106,117,164,179,190,199`
- [ ] **问题**: 原生 `title="撤销"` / `title="重做"` 等浏览器工具提示
- [ ] **方案**: 每个 `<Button>` 外层包 `<Tooltip>` + `<TooltipContent>`
- [ ] **验证**: 鼠标悬停显示 shadcn 风格提示

### T10: `RichTextEditor.vue` 自定义下拉 → `<DropdownMenu>`

- [ ] **文件**: `src/components/common/RichTextEditor.vue:138-152`
- [ ] **问题**: 手写 `v-if` + absolute 定位 + `@blur` 下拉菜单
- [ ] **方案**: `<DropdownMenu>` + `<DropdownMenuTrigger>` + `<DropdownMenuContent>` + `<DropdownMenuItem>`
- [ ] **验证**: 标题级别下拉正常展开/收起

### T11: `AuthPageShell.vue` 分隔线 → `<Separator>`

- [ ] **文件**: `src/components/features/auth/AuthPageShell.vue:32`
- [ ] **问题**: `<span class="w-full border-t border-border" />`
- [ ] **方案**: `<Separator />`
- [ ] **验证**: 登录页 "或" 分隔线样式不变

### T12: `ScanCheckinDialog.vue` 自定义 alert → `<Alert>`

- [ ] **文件**: `src/components/features/admin-ticket/ScanCheckinDialog.vue:243-254`
- [ ] **问题**: 手写 `bg-green-50 text-green-700 border-green-200` 结果横幅
- [ ] **方案**: `<Alert>` / `<Alert variant="destructive">`
- [ ] **验证**: 扫码成功/失败提示样式正常

### T13: `ProfileSettingsSection.vue` 原始 button → `<Button>`

- [ ] **文件**: `src/components/features/profile/ProfileSettingsSection.vue:31`
- [ ] **问题**: `<button type="button" class="text-sky-600 hover:underline">`
- [ ] **方案**: `<Button variant="link" class="text-sky-600">`
- [ ] **验证**: 设置项操作按钮样式正常

### T14: 手动 badge → `<Badge>`

- [ ] **文件**:
  - `src/components/features/profile/ProfileWorkOrdersSection.vue:86`
  - `src/views/admin/EventEditView.vue:91`
- [ ] **问题**: `rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium` 手动 badge
- [ ] **方案**: `<Badge variant="secondary">`
- [ ] **验证**: 状态标签样式不变

### T15: 原始 button 药丸 → `<Button>` / `<Tabs>`

- [ ] **文件**:
  - `src/components/features/search/SearchFilterGroup.vue:43-58,60-71`
  - `src/components/features/profile/ProfileOrdersSection.vue:45-60`
  - `src/components/features/profile/ProfileWorkOrdersSection.vue:40-56`
  - `src/components/features/profile/ProfileMobileBottomNav.vue:16-29`
  - `src/components/features/ai/AIChatEmptyState.vue:34-42`
  - `src/components/features/ai/AIChatMessageList.vue:114-122`
- [ ] **问题**: `<button type="button">` 带 `rounded-full px-3 py-1` 等自定义样式
- [ ] **方案**:
  - Filter chips: `<Button variant="ghost" size="sm">` 或 `<Badge>`
  - Tab 切换: `<Tabs>` + `<TabsList>` + `<TabsTrigger>`
  - 建议按钮: `<Button variant="outline" class="rounded-full">`
- [ ] **验证**: 各页面筛选/切换/建议按钮样式和交互正常

### T16: `SessionList.vue` 原始 CTA → `<Button>`

- [ ] **文件**: `src/components/features/admin-event-edit/SessionList.vue:134`
- [ ] **问题**: `border-dashed rounded-md cursor-pointer` 的 "添加票种" 按钮
- [ ] **方案**: `<Button variant="outline" class="w-full border-dashed">`
- [ ] **验证**: 添加票种按钮样式正常

### T17: `DateTimePicker.vue` 数字输入 → `<NumberField>`

- [ ] **文件**: `src/components/common/DateTimePicker.vue:121-141`
- [ ] **问题**: `<input type="number">` + 手动 CSS 隐藏 spin 按钮
- [ ] **方案**: shadcn `<NumberField>`（已安装）
- [ ] **验证**: 小时/分钟输入正常，含增减按钮

### T18: admin list 页面原始 `<label>` → `<Label>`

- [ ] **文件**: 12 个 admin list 页面的 Dialog 表单
- [ ] **问题**: 表单 label 未使用 shadcn `<Label>`
- [ ] **方案**: 将所有 `<label>` 替换为 `<Label>`
- [ ] **验证**: 表单标签样式和可访问性正常

---

## Wave 7 — 工具/架构类 MEDIUM

### T19: `ImageUpload.vue` ObjectURL → `useObjectUrl`

- [ ] **文件**: `src/components/common/ImageUpload.vue:77-88`
- [ ] **问题**: 手动 `URL.createObjectURL` / `URL.revokeObjectURL`
- [ ] **方案**: `const objectUrl = useObjectUrl(fileRef)`（VueUse 已自动导入）
- [ ] **验证**: 图片上传预览正常，无内存泄漏

### T20: `SidebarProvider.vue` cookie → `useCookie`

- [ ] **文件**: `src/components/common/ui/sidebar/SidebarProvider.vue:44`
- [ ] **问题**: 直接 `document.cookie = ...`
- [ ] **方案**: `useCookie(SIDEBAR_COOKIE_NAME, { maxAge: SIDEBAR_COOKIE_MAX_AGE, path: '/' })`
- [ ] **验证**: 侧边栏展开状态持久化正常

### T21: 聊天滚动 → 声明式 `useScroll`

- [ ] **文件**:
  - `src/components/common/WorkOrderDetailDialog.vue:92-97`
  - `src/components/features/ai/AIChatMessageList.vue:24-28`
- [ ] **问题**: 手动设 `y.value = scrollHeight` 绕过 `useScroll` 声明式 API
- [ ] **方案**: 使用 `scrollIntoView({ behavior: 'smooth' })` 在最新消息元素上
- [ ] **验证**: 聊天消息自动滚动到底部正常

### T22: `useEventTicketSelection.ts` 硬编码 ¥0.00 → `formatPrice(0)`

- [ ] **文件**: `src/composables/event/useEventTicketSelection.ts:50`
- [ ] **问题**: `'¥0.00'` 硬编码字符串
- [ ] **方案**: `formatPrice(0)`
- [ ] **验证**: 价格显示统一

### T23: `EventCard.vue` 价格文本正则 → 收拢到 `formatPrice`

- [ ] **文件**: `src/components/features/home/EventCard.vue:8`
- [ ] **问题**: `formatPriceText` 手动正则替换 `元` 前空格
- [ ] **方案**: 将非断空格逻辑收拢到 `src/utils/format.ts` 的 `formatPrice`
- [ ] **验证**: 活动卡片价格显示正常

---

## Wave 8 — 数据处理/架构类 MEDIUM

### T24: 提取 `computeVisiblePages()` 共享工具

- [ ] **文件**: `src/composables/event/useSearchResults.ts:27-36`
- [ ] **问题**: 分页窗口计算逻辑可能重复于 admin list composables
- [ ] **方案**: 提取到 `src/utils/pagination.ts`
- [ ] **验证**: 搜索页和 admin 列表页分页显示正常

### T25: `requestTransforms.ts` 递归遍历 → 通用 `deepMapObject()`

- [ ] **文件**: `src/api/requestTransforms.ts:32-75`
- [ ] **问题**: `transformDateTimeFields` 和 `normalizeResponseFields` 递归模式重复
- [ ] **方案**: 提取 `deepMapObject(obj, transform)` 到 `src/utils/object.ts`
- [ ] **验证**: API 请求/响应转换正常

### T26: `useWorkOrderChat.ts` 冗余 ESM 缓存

- [ ] **文件**: `src/composables/common/useWorkOrderChat.ts:9-18`
- [ ] **问题**: 手动 `_ClientClass` / `_importPromise` 缓存，ESM 已自带缓存
- [ ] **方案**: 直接 `await import('@stomp/stompjs')`，删除缓存层
- [ ] **验证**: 工单聊天连接正常，动态导入无重复加载

### T27: `useWorkOrderChat.ts` 单例 → `createSharedComposable`

- [ ] **文件**: `src/composables/common/useWorkOrderChat.ts:266-272`
- [ ] **问题**: 模块级 `let instance` 单例模式
- [ ] **方案**: `export const useWorkOrderChat = createSharedComposable(createWorkOrderChat)`
- [ ] **验证**: 多组件共享同一聊天实例，HMR 正常

### T28: `useAdminCrud.ts` 手动 pick → 保持现状 (SKIP)

- [ ] **文件**: `src/composables/admin/common/useAdminCrud.ts:105-108`
- [ ] **决策**: **SKIP** — 当前代码清晰，引入 lodash 仅为 pick 不划算

### T29: `SidebarMenuSkeleton.vue` Math.random → 保持 (SKIP)

- [ ] **文件**: `src/components/common/ui/sidebar/SidebarMenuSkeleton.vue:13`
- [ ] **决策**: **SKIP** — 纯 UI 装饰，无需替换

---

## 附录: 已验证 CLEAN 的类别

以下 22+ 个类别已全面搜索，确认无造轮子情况：

| 类别                            | 状态 | 实际使用                        |
| ------------------------------- | ---- | ------------------------------- |
| Dialog / AlertDialog            | ✅   | shadcn `<Dialog>`               |
| Select / Popover / DropdownMenu | ✅   | shadcn 组件                     |
| Tabs / Card / Avatar            | ✅   | shadcn 组件                     |
| Checkbox / RadioGroup / Switch  | ✅   | shadcn 组件                     |
| Table / Carousel / Skeleton     | ✅   | shadcn 组件                     |
| localStorage                    | ✅   | `useStorage`                    |
| debounce / throttle             | ✅   | `useDebounceFn`                 |
| scroll 跟踪                     | ✅   | `useScroll` / `useWindowScroll` |
| resize 观察                     | ✅   | `useResizeObserver`             |
| dark mode                       | ✅   | Tailwind `dark:`                |
| 倒计时                          | ✅   | `useIntervalFn`                 |
| ID 生成                         | ✅   | `nanoid` / `useId()`            |
| 日期计算                        | ✅   | `dayjs`                         |
| 无限滚动 / 视差 / 灯箱          | ✅   | 无相关实现                      |
| 文件拖拽                        | ✅   | `useDropZone`                   |
| 图片懒加载                      | ✅   | `loading="lazy"`                |
| QR 扫描                         | ✅   | `@zxing/browser`                |
| WebSocket (STOMP)               | ✅   | `@stomp/stompjs`                |
| 手动 IntersectionObserver       | ✅   | 无                              |
| 手动 MutationObserver           | ✅   | 无                              |
| 手动 RAF 循环                   | ✅   | 无                              |
| 手动 setInterval                | ✅   | 无                              |
| 手动 geolocation                | ✅   | 无                              |
| 手动 clipboard                  | ✅   | 无                              |
| 手动 fullscreen                 | ✅   | 无                              |

---

_生成时间: 2026-05-04_
_审计范围: src/ 下全部 458 个文件_
