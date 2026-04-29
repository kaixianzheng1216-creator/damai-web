# AI 对话接口 —— 前端对接说明

## 接口

`POST /api/ai/front/ai/chat`

请求头带 `Authorization-User: Bearer {token}`，body 传 `flowName`（`assistant` 或 `support`）、`message`、`sessionId`。

响应结构：

```json
{
  "message": "AI 说的话",
  "items": [{ ... }],
  "suggestions": ["快捷按钮1", "快捷按钮2"]
}
```

- `message`：纯文本，直接展示。
- `items`：结构化数据列表，**字段不固定**，由 `type` 区分场景。前端根据 `type` 决定渲染什么卡片。
- `suggestions`：快捷建议按钮，用户点击后直接把文本发给 AI。

---

## 场景一：首页助手（flowName = "assistant"）

AI 角色：小麦，活泼热情的票务助手。

### items 类型：活动（type = "event"）

用户搜索活动、查看推荐、查关注列表时，AI 返回活动卡片。

**字段**：

- `id`：活动 ID
- `name`：活动名称
- `cover_url`：封面图
- `participant_name`：艺人名（取第一个艺人）
- `city_name_snapshot`：城市
- `venue_name_snapshot`：场馆
- `first_session_start_at`：首场开始时间
- `last_session_end_at`：最晚场次结束时间
- `min_price` / `max_price`：最低/最高票价（分）

**卡片示意**：

```
┌────────────────────────────┐
│ [封面图]  测试演唱会 1        │
│          测试艺人             │
│          北京 | 测试场馆       │
│          2026.5.1 19:30 — 22:00 │
│                            │
│          ¥128.00 — ¥280.00  │
└────────────────────────────┘
```

---

## 场景二：客服工单（flowName = "support"）

AI 角色：小达，冷静专业的在线客服。

### items 类型：订单（type = "order"）

用户报订单相关问题（如支付失败、退款）时，AI 先查订单列表。用户选中某个订单后，可能继续查该订单下的电子票。

**字段**：

- `id`：订单 ID
- `event_name_snapshot`：活动名称
- `event_cover_url_snapshot`：活动封面图
- `venue_name_snapshot`：场馆名
- `session_start_at_snapshot`：场次开始时间
- `total_amount`：订单总金额（分）
- `quantity`：购票数量
- `status`：订单状态码
- `status_label`：订单状态中文（待支付/已支付/已取消/已关闭/已退款）
- `order_no`：订单号

**卡片示意**：

```
┌────────────────────────────┐
│ [封面图]  测试演唱会 1        │
│          测试场馆             │
│          2026.5.1 19:30      │
│                            │
│  ¥256.00 × 2张              │
│  ─────────────────────     │
│  ORDER2026XXXX    [已支付]  │
└────────────────────────────┘
```

### items 类型：电子票（type = "ticket"）

用户明确提到"票"/"电子票"/"二维码"问题时，AI 查指定订单下的所有电子票。

**字段**：

- `id`：电子票 ID
- `event_name_snapshot`：活动名称
- `event_cover_url_snapshot`：活动封面图
- `venue_name_snapshot`：场馆名
- `session_start_at_snapshot`：场次开始时间
- `passenger_name_snapshot`：购票人姓名
- `status`：电子票状态码
- `status_label`：电子票状态中文（未使用/已使用/已作废/已退票）
- `ticket_no`：票号

**卡片示意**：

```
┌────────────────────────────┐
│ [封面图]  测试演唱会 1        │
│          测试场馆             │
│          2026.5.1 19:30      │
│                            │
│  购票人：张三                 │
│  ─────────────────────     │
│  TKT2026XXXX      [未使用]  │
└────────────────────────────┘
```

---

## 通用说明

1. **价格单位**：所有金额字段（`min_price`、`max_price`、`total_amount`）单位都是**分**，前端展示前需 ÷100。
2. **时间格式**：`first_session_start_at`、`session_start_at_snapshot` 等是 ISO 8601 字符串，前端按需格式化。
3. **状态标签**：`status_label` 已经是中文，可直接展示；`status` 是数字码，如需自定义颜色可据此判断。
4. **空数据**：`items` 可能为空数组，此时只展示 `message` 和 `suggestions` 即可。
