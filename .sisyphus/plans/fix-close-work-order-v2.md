# 修复：点击关闭工单按钮无反应

## TL;DR

> 修复点击"关闭工单"按钮后确认弹窗不打开、无 API 请求的问题。
> 根本原因是 `openCloseWorkOrderModal` 中的 `selectedWorkOrderClosed` 前置检查可能因状态计算时机错误拦截点击。
>
> **涉及文件**: 1 个（`useWorkOrderList.ts`）
> **预计耗时**: 短（Quick）

---

## Context

用户反馈点击"关闭工单"按钮后：

1. 确认弹窗没有打开
2. 没有发起关闭工单的 API 请求
3. 页面没有任何变化

经代码审查，`openCloseWorkOrderModal` 函数中有前置条件检查：

```ts
const openCloseWorkOrderModal = () => {
  if (!selectedWorkOrderId.value || selectedWorkOrderClosed.value) {
    return
  }
  showCloseWorkOrderModal.value = true
}
```

其中 `selectedWorkOrderClosed` 检查是**冗余的**——因为 UI 层面 `ProfileWorkOrderDetailDialog.vue` 中已经通过 `v-if="!isClosed"` 隐藏了已关闭工单的按钮。但此检查可能因 `workOrderDetailQuery` 数据刷新时机等原因错误返回 true，导致点击被静默拦截。

---

## Work Objectives

### Core Objective

移除 `openCloseWorkOrderModal` 中冗余且可能导致误拦截的前置检查，确保点击"关闭工单"按钮后确认弹窗正确打开。

### Concrete Deliverables

- `src/composables/profile/useWorkOrderList.ts` — 修改 `openCloseWorkOrderModal`

### Must Have

- 点击"关闭工单"按钮后确认弹窗正确打开
- `type-check` 和 `build` 通过

### Must NOT Have

- 不改其他业务逻辑
- 不改 mutation 逻辑（之前已修复 `closeWorkOrderDetail()`）

---

## Verification Strategy

- 无新增测试：纯逻辑修复
- QA 方式：代码审查 + 构建验证

---

## Execution Strategy

单个文件修改：

```
Wave 1:
└── Task 1: useWorkOrderList.ts 移除 openCloseWorkOrderModal 冗余检查
```

---

## TODOs

- [ ] 1. useWorkOrderList.ts — 移除 openCloseWorkOrderModal 冗余前置检查

  **What to do**:
  - 修改 `src/composables/profile/useWorkOrderList.ts`
  - 找到 `openCloseWorkOrderModal` 函数（约第 138-143 行）：
    ```ts
    const openCloseWorkOrderModal = () => {
      if (!selectedWorkOrderId.value || selectedWorkOrderClosed.value) {
        return
      }
      showCloseWorkOrderModal.value = true
    }
    ```
  - 移除 `selectedWorkOrderClosed.value` 检查，改为：
    ```ts
    const openCloseWorkOrderModal = () => {
      if (!selectedWorkOrderId.value) {
        return
      }
      showCloseWorkOrderModal.value = true
    }
    ```

  **Why this fix**:
  - `selectedWorkOrderClosed` 检查是冗余的：UI 层面 `v-if="!isClosed"` 已确保已关闭工单不显示按钮
  - 该检查可能因 `workOrderDetailQuery` 数据刷新时机等原因错误返回 true，导致点击被静默拦截
  - `selectedWorkOrderId` 检查保留：如果工单 ID 不存在，确实不应该打开确认弹窗

  **Must NOT do**:
  - 不改其他函数逻辑
  - 不改 `closeWorkOrderMutation.onSuccess`（之前已添加 `closeWorkOrderDetail()`）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue-best-practices`]

  **Parallelization**:
  - **Can Run In Parallel**: NO（单文件修改）
  - **Blocked By**: None

  **Acceptance Criteria**:
  - [ ] `openCloseWorkOrderModal` 中不再检查 `selectedWorkOrderClosed`
  - [ ] 仅保留 `selectedWorkOrderId` 存在性检查
  - [ ] `npm run type-check` 通过
  - [ ] `npm run build` 通过

---

## Final Verification Wave

- [ ] F1. **构建检查** — `unspecified-high`
      运行 `npm run type-check` → PASS，运行 `npm run build` → PASS

- [ ] F2. **代码审查** — `unspecified-high`
      确认 `openCloseWorkOrderModal` 中已移除 `selectedWorkOrderClosed` 检查

## Commit Strategy

- 单条 commit：`fix(work-order): remove redundant guard in openCloseWorkOrderModal`
- 文件：`src/composables/profile/useWorkOrderList.ts`
- Pre-commit: `npm run type-check`

## Success Criteria

- [ ] `npm run type-check` 通过
- [ ] `npm run build` 通过
- [ ] 点击"关闭工单"按钮后确认弹窗正确打开
