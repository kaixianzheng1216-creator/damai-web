# 完善订单详情页字段展示

## TL;DR

> 在订单确认支付页（`CheckoutOrderCard.vue`）展示订单全部后端字段，**排除购票人列表（`passengerIds`）**。新增时间信息和支付记录卡片。
>
> **Deliverables**:
>
> - `src/constants/trade.ts` — 补充 10+ 新文案键
> - `src/components/features/checkout/CheckoutOrderCard.vue` — 新增创建时间、过期时间、关闭时间、退款时间、支付记录区域
>
> **Estimated Effort**: Short
> **Parallel Execution**: NO — 2 个文件顺序修改
> **Critical Path**: T1（文案）→ T2（组件）

---

## Context

### Original Request

用户展示了订单详情页截图和订单 JSON，指出当前页面展示的信息不足，希望展示全部字段，但明确排除购票人（`passengerIds`）。

### 缺失字段

当前 `CheckoutOrderCard.vue` 已展示：活动封面/名称、场馆/地址、票档×数量、单价、订单号、场次、时间、支付/取消时间、总金额、退款记录。

需要新增：
| 字段 | 类型 | 展示方式 |
|---|---|---|
| `createAt` | string | 信息网格 — 创建时间 |
| `expireAt` | string | 信息网格 — 过期时间 |
| `closeTime` | string \| null | 条件展示 — 关闭时间 |
| `refundTime` | string \| null | 条件展示 — 退款时间 |
| `payments` | PaymentVO[] | 新增区域 — 支付记录卡片列表 |

`PaymentVO` 字段：paymentNo（支付单号）、channelLabel（渠道）、payMethodLabel（方式）、amount（金额）、statusLabel（状态）、outTradeNo（商户订单号）、channelTradeNo（渠道交易号）、createAt（创建时间）、qrCodeBase64（二维码）。

---

## Work Objectives

### Core Objective

补全订单详情页的信息展示，让用户能在单个页面看到订单的完整生命周期信息。

### Concrete Deliverables

- 文案常量扩展：10 个新键
- 订单卡片组件扩展：时间信息 + 支付记录卡片

### Definition of Done

- [ ] 订单详情页展示创建时间、过期时间
- [ ] 关闭/退款订单展示对应时间
- [ ] 每笔支付记录以独立卡片展示全部 PaymentVO 字段
- [ ] `npm run ci` 通过（type-check + lint + test + build）

### Must NOT Have (Guardrails)

- 不展示 `passengerIds`（用户明确排除）
- 不修改支付面板右侧逻辑
- 不改动现有退款记录展示

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES（Vitest）
- **Automated tests**: Tests-after
- **Framework**: Vitest + happy-dom

### QA Policy

每个任务包含 Agent-Executed QA Scenarios。

---

## Execution Strategy

### Wave 1（顺序执行 — 共 2 任务）

- [x] **T1. 补充订单详情文案常量**
      **What to do**:
  - 在 `src/constants/trade.ts` 的 `PAYMENT_COPY` 对象中追加以下键：
    - `createTime: '创建时间'`
    - `expireTime: '过期时间'`
    - `closeTime: '关闭时间'`
    - `refundTime: '退款时间'`
    - `paymentRecords: '支付记录'`
    - `paymentNo: '支付单号'`
    - `channel: '支付渠道'`
    - `payMethod: '支付方式'`
    - `outTradeNo: '商户订单号'`
    - `channelTradeNo: '渠道交易号'`
    - `qrCode: '支付二维码'`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - Reason: 纯常量追加，无业务逻辑

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: None
  - **Blocks**: T2

  **Acceptance Criteria**:
  - [ ] `PAYMENT_COPY.createTime` 等键存在且值为中文
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: 常量文件编译通过
    Tool: Bash
    Steps:
      1. npm run type-check
    Expected Result: 0 errors
  ```

  **Commit**: YES
  - Message: `feat(trade): add order detail copy constants`
  - Files: `src/constants/trade.ts`

- [x] **T2. 扩展订单详情卡片展示全部字段**
      **What to do**:
  1. 在 `src/components/features/checkout/CheckoutOrderCard.vue` 的信息网格（`grid grid-cols-2`）中追加：
     - 创建时间（`order.createAt`，始终展示）
     - 过期时间（`order.expireAt`，始终展示）
     - 关闭时间（`order.closeTime`，条件 `isClosed`）
     - 退款时间（`order.refundTime`，条件 `isRefunded`，需确认父组件是否传入此状态或新增）

  2. 在退款记录区域之后，新增「支付记录」区域：
     - 标题："支付记录"
     - 每张支付记录使用独立卡片（`Card`）
     - 卡片内展示：支付单号、支付渠道、支付方式、商户订单号、渠道交易号、支付金额、支付状态、支付时间
     - 二维码（`qrCodeBase64`）条件展示（可使用 `img` 标签）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vue-best-practices`]
  - Reason: Vue 组件布局修改，需遵循 Composition API 和模板规范

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T1（文案键必须先存在）
  - **Blocks**: None

  **Acceptance Criteria**:
  - [ ] 创建时间、过期时间在信息网格中展示
  - [ ] 关闭/退款订单展示对应时间
  - [ ] 每笔支付记录以卡片展示全部字段
  - [ ] `npm run ci` 通过

  **QA Scenarios**:

  ```
  Scenario: 已支付订单展示完整信息
    Tool: Bash (curl 或直接用浏览器)
    Steps:
      1. 访问已支付订单的 checkout 页面
    Expected Result: 页面展示创建时间、过期时间、支付记录卡片（含渠道、方式、单号、金额、二维码）

  Scenario: 已关闭订单展示关闭时间
    Tool: Bash
    Steps:
      1. 访问已关闭订单的 checkout 页面
    Expected Result: 信息网格中出现「关闭时间」字段
  ```

  **Commit**: YES
  - Message: `feat(checkout): show all order fields in detail card`
  - Files: `src/components/features/checkout/CheckoutOrderCard.vue`

---

## Final Verification Wave

- [x] F1. **运行完整 CI**
      `npm run ci` — 验证 type-check、lint、test、build 全部通过。

---

## Commit Strategy

- T1: `feat(trade): add order detail copy constants`
- T2: `feat(checkout): show all order fields in detail card`

---

## Success Criteria

### Verification Commands

```bash
npm run ci
```

### Final Checklist

- [x] 所有新文案键存在于 `PAYMENT_COPY`
- [x] 订单详情页展示：创建时间、过期时间、支付记录
- [x] 条件展示：关闭时间、退款时间
- [x] 不展示 `passengerIds`
- [x] `npm run ci` 通过
