# 改造工单卡片布局：编号放底部 + 横线分隔

## TL;DR

> 将 `ProfileWorkOrdersSection.vue` 中的工单卡片布局调整为与订单/电子票卡片一致：工单编号从 `#details` 移至底部 `#bottomLeft`，并在上方添加 `<hr>` 分隔线。
>
> **Estimated Effort**: Trivial

---

## Context

当前工单卡片：

```
[封面]  工单标题
        # 工单编号
        标签: 类型
                     [状态]
        最后回复时间
```

目标风格（与 OrderCard/TicketCard 一致）：

```
[封面]  工单标题
        标签: 类型
        最后回复时间
        ─────────────────
        工单编号      [状态]
```

---

## Execution Strategy

- [ ] **T1. 调整工单卡片插槽布局**
      **What to do**:
  1. `src/components/features/profile/ProfileWorkOrdersSection.vue`
  2. `#details` 插槽：移除工单编号行，只保留类型标签；将最后回复时间从 `#bottomLeft` 移入 `#details`
  3. 新增 `#middle` 插槽：只放 `<hr class="border-border" />`
  4. `#bottomLeft` 插槽：改为放工单编号（小号灰色文字，无图标）
  5. `#bottomRight` 不变：状态标签

  **Acceptance Criteria**:
  - [x] 工单编号在卡片最底部左侧
  - [x] 编号上方有 `<hr>` 分隔线
  - [x] 类型标签和最后回复时间在中间区域
  - [x] `npm run ci` 通过
