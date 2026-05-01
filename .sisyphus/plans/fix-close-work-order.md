# 修复：关闭工单后弹窗未关闭及 queryKey 失效问题

## TL;DR

> 修复关闭工单功能的两个 bug：
>
> 1. 关闭工单后详情弹窗未自动关闭
> 2. `invalidateQueries` queryKey 匹配不完整导致详情数据不刷新
>
> **涉及文件**: 2 个（`useWorkOrderList.ts`、`queryKeys.ts`）
> **预计耗时**: 短（Quick）

---

## Context

用户反馈点击"关闭工单"后页面卡死。经代码审查发现：

### Bug 1：关闭工单后详情弹窗未关闭

`closeWorkOrderMutation.onSuccess` 只关闭了确认弹窗并刷新了列表，**没有调用 `closeWorkOrderDetail()` 关闭详情弹窗**。用户关闭工单后，确认弹窗消失，但工单详情弹窗仍然打开显示已关闭的工单，造成"页面卡住"的感知。

### Bug 2：`invalidateQueries` queryKey 匹配不完整

`invalidateWorkOrders()` 中使用 `queryKeys.profile.workOrderDetail()` 返回 `['my-work-order-detail', undefined]`，而实际的 `workOrderDetailQuery` queryKey 是 `['my-work-order-detail', Ref<string>]`. Vue Query 的前缀匹配因第二个元素不同（`undefined` ≠ ref 的值）而**无法正确匹配**，导致详情查询不会被失效刷新。

### 后台管理端同样问题

`queryKeys.admin.workOrderDetail()` 存在相同的 queryKey 构造问题。

---

## Work Objectives

### Core Objective

修复关闭工单后弹窗未自动关闭的问题，并确保 `invalidateQueries` 能正确使工单详情查询失效。

### Concrete Deliverables

- `src/composables/profile/useWorkOrderList.ts` — 修复 `onSuccess` 回调 + `invalidateQueries`
- `src/constants/queryKeys.ts` — 修复 `workOrderDetail` 不传参时的 queryKey 构造

### Must Have

- 关闭工单后详情弹窗自动关闭
- `invalidateQueries` 正确匹配 `workOrderDetailQuery`
- 后台管理端 `admin.workOrderDetail` 一并修复
- `type-check` 和 `build` 通过

### Must NOT Have

- 不改其他业务逻辑
- 不改其他 queryKey 定义（除非存在相同问题）

---

## Verification Strategy

- 无新增测试：纯逻辑修复
- QA 方式：代码审查 + 构建验证

---

## Execution Strategy

2 个文件串行修改（有依赖关系：先改 queryKeys，再改 useWorkOrderList）：

```
Wave 1:
├── Task 1: queryKeys.ts 修复 workOrderDetail queryKey 构造
└── Task 2: useWorkOrderList.ts 修复 onSuccess + invalidateQueries
```

---

## TODOs

- [x] 1. queryKeys.ts — 修复 workOrderDetail / admin.workOrderDetail queryKey 构造

  **What to do**:
  - 修改 `src/constants/queryKeys.ts`
  - 将 `workOrderDetail: (id?: QueryKeyPart) => key('my-work-order-detail', id)` 改为：
    ```ts
    workOrderDetail: (id?: QueryKeyPart) =>
      id !== undefined ? key('my-work-order-detail', id) : key('my-work-order-detail')
    ```
  - 将 `admin.workOrderDetail` 做同样修改：
    ```ts
    workOrderDetail: (id?: QueryKeyPart) =>
      id !== undefined ? key('admin-work-order-detail', id) : key('admin-work-order-detail')
    ```

  **Must NOT do**:
  - 不改其他 queryKey 定义（除非审查发现相同问题）
  - 不改 key 函数本身

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: NO（Task 2 依赖此修改）
  - **Blocked By**: None
  - **Blocks**: Task 2

  **Acceptance Criteria**:
  - [ ] `queryKeys.profile.workOrderDetail()` 返回 `['my-work-order-detail']`（单元素数组）
  - [ ] `queryKeys.profile.workOrderDetail('123')` 返回 `['my-work-order-detail', '123']`
  - [ ] `queryKeys.admin.workOrderDetail()` 返回 `['admin-work-order-detail']`
  - [ ] `npm run type-check` 通过

- [ ] 2. useWorkOrderList.ts — 修复 closeWorkOrderMutation onSuccess

  **What to do**:
  - 修改 `src/composables/profile/useWorkOrderList.ts`
  - 在 `closeWorkOrderMutation.onSuccess` 中，**在 `invalidateWorkOrders()` 之前**调用 `closeWorkOrderDetail()`：
    ```ts
    const closeWorkOrderMutation = useMutation({
      mutationFn: closeWorkOrder,
      onSuccess: async () => {
        showCloseWorkOrderModal.value = false
        closeWorkOrderDetail() // 新增：关闭详情弹窗
        await invalidateWorkOrders()
      },
    })
    ```
  - 在 `replyMutation.onSuccess` 中也添加 `closeWorkOrderDetail()` 调用（回复后也应该关闭弹窗？不，回复后应该继续显示。只修改 closeWorkOrderMutation）

  **Must NOT do**:
  - 不改 `replyMutation.onSuccess`（回复后保持弹窗打开是正确行为）
  - 不改其他 mutation 逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: NO（依赖 Task 1）
  - **Blocked By**: Task 1
  - **Blocks**: None

  **Acceptance Criteria**:
  - [ ] 关闭工单 mutation success 时先关闭详情弹窗再刷新列表
  - [ ] `npm run type-check` 通过
  - [ ] `npm run build` 通过

---

## Final Verification Wave

- [ ] F1. **构建检查** — `unspecified-high`
      运行 `npm run type-check` → PASS，运行 `npm run build` → PASS

- [ ] F2. **代码审查** — `unspecified-high`
      确认 `closeWorkOrderMutation.onSuccess` 调用了 `closeWorkOrderDetail()`
      确认 `queryKeys.profile.workOrderDetail()` 返回单元素数组

## Commit Strategy

- 单条 commit：`fix(work-order): auto-close detail dialog after closing work order`
- 文件：`src/composables/profile/useWorkOrderList.ts`, `src/constants/queryKeys.ts`
- Pre-commit: `npm run type-check`

## Success Criteria

- [ ] `npm run type-check` 通过
- [ ] `npm run build` 通过
- [ ] 关闭工单后详情弹窗自动关闭
- [ ] `invalidateQueries` 正确使工单详情查询失效
