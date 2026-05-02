# 移除订单卡片中的数量展示

## TL;DR

> 从 `OrderCard.vue` 的 `#middle` 插槽中移除 `× N张` 的数量展示，只保留金额。
>
> **Estimated Effort**: Trivial

---

## Context

用户截图红框圈出了订单卡片中间区域的 `× 2张`，希望删除这部分。

### 修改内容

`src/components/common/OrderCard.vue` — `#middle` 插槽中：

- 将 `{{ formatPrice(totalAmount) }} × {{ quantity ?? 0 }}张` 改为 `{{ formatPrice(totalAmount) }}`

---

## Execution Strategy

- [ ] **T1. 移除数量展示**
      **What to do**:
  - 修改 `OrderCard.vue` 第 55 行，删除 `× {{ quantity ?? 0 }}张`

  **Acceptance Criteria**:
  - [x] 订单卡片中间只展示金额，不展示数量
  - [x] `npm run ci` 通过
