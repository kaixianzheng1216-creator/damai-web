# 移除支付记录中的二维码展示

## TL;DR

> 从订单详情页支付记录卡片中移除二维码图片，并清理不再使用的文案常量。
>
> **Estimated Effort**: Trivial
> **Parallel Execution**: NO — 顺序修改 2 个文件

---

## Context

用户不希望订单详情页的支付记录区域展示二维码。当前代码在 `CheckoutOrderCard.vue` 中用 `<img>` 标签渲染了 `payment.qrCodeBase64`。

### 修改内容

1. `src/components/features/checkout/CheckoutOrderCard.vue` — 删除 `<img v-if="payment.qrCodeBase64">` 段
2. `src/constants/trade.ts` — 从 `PAYMENT_COPY` 中移除 `qrCode: '支付二维码'`（不再使用）

---

## Execution Strategy

### Wave 1（顺序执行）

- [ ] **T1. 删除支付记录卡片中的二维码**
      **What to do**:
  - 删除 `CheckoutOrderCard.vue` 中 `CardContent` 内的 `<img>` 标签（约第 182–187 行）
  - 保留所有其他支付记录字段不变

  **Acceptance Criteria**:
  - [x] 支付记录卡片不再包含 `<img>` 标签
  - [x] `npm run type-check` 通过

- [ ] **T2. 清理未使用的文案常量**
      **What to do**:
  - 从 `src/constants/trade.ts` 的 `PAYMENT_COPY` 中删除 `qrCode: '支付二维码'` 行

  **Acceptance Criteria**:
  - [x] `qrCode` 键从 `PAYMENT_COPY` 中移除
  - [x] `npm run ci` 通过

---

## Success Criteria

- `npm run ci` 通过
