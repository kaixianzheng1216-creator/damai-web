# 工单聊天 WebSocket 接入

## TL;DR

> 将工单回复从 HTTP POST 迁移到 WebSocket (STOMP)。后端已删除 `POST /{id}/replies` 接口，发送消息只能通过 WS。
>
> **Deliverables**:
>
> - 安装 `@stomp/stompjs` + `ws`
> - 新建 `useWorkOrderChat` 组合式函数（WS 连接、订阅、发送）
> - 移除/替换 2 个已废弃的 HTTP 回复 API
> - 改造前台 + 后台工单详情弹窗，支持实时收发
> - 断线重连 + 历史同步
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO — 顺序依赖强
> **Critical Path**: T1(依赖) → T2(依赖) → T3/T4 → T5

---

## Context

### 后端文档核心变更

后端文档 `docs/工单聊天-前端接入文档.md` 规定：

| 变更     | 之前                                             | 之后                                        |
| -------- | ------------------------------------------------ | ------------------------------------------- |
| 发送消息 | `POST /api/order/front/work-orders/{id}/replies` | `SEND /app/chat.send` (WebSocket STOMP)     |
| 发送消息 | `POST /api/order/admin/work-orders/{id}/replies` | `SEND /app/chat.send` (WebSocket STOMP)     |
| 接收消息 | 轮询详情接口                                     | `SUBSCRIBE /topic/work-order/{id}` 实时推送 |
| 历史消息 | `GET /{id}` 的 `replies` 字段                    | 不变，仍通过 HTTP 获取                      |

**WebSocket 规范**:

- 端点: `ws://localhost:18080/ws/order/chat`
- 协议: STOMP
- CONNECT header: `token` = 原始 token（不加 Bearer）
- 发送格式: `{ workOrderId: number, content: string }`
- 接收格式: `{ type: "CHAT"|"ERROR", workOrderId, content, senderType: "USER"|"ADMIN", senderId, timestamp }`
- 广播模型: 所有订阅了同一 topic 的客户端都收到消息
- 断连不同步: 断线期间消息不会补推，重连后需重新拉取详情

### 当前代码状态

- **无 WebSocket 库**: `package.json` 中没有 `@stomp/stompjs` 或 `ws`
- **HTTP 回复 API 仍在**: `submitMyWorkOrderReply` / `submitAdminWorkOrderReply` 在 `src/api/trade/workOrder.ts`
- **前台**: `useWorkOrderList.ts` → `ProfileWorkOrderDetailDialog.vue`
- **后台**: `useAdminWorkOrderListPage.ts` → `WorkOrderDetailDialog.vue`
- **消息模型差异**:
  - HTTP `senderType`: `0`(用户) / `1`(管理员)
  - WS `senderType`: `"USER"` / `"ADMIN"`
  - WS `timestamp`: Unix ms (非 ISO 8601)

---

## Work Objectives

### Core Objective

用 WebSocket STOMP 替换工单回复的 HTTP 方式，实现实时聊天。

### Concrete Deliverables

1. `npm install @stomp/stompjs`
2. `src/composables/common/useWorkOrderChat.ts` — WS 连接管理
3. 更新 `src/api/trade/workOrder.ts` — 移除已废弃的回复 API
4. 更新 `src/composables/profile/useWorkOrderList.ts` — 使用 WS 发送
5. 更新 `src/composables/admin/list-pages/useAdminWorkOrderListPage.ts` — 使用 WS 发送
6. 更新两个 DetailDialog — 实时渲染 WS 推送的消息

### Definition of Done

- [ ] 前台和后台都能通过 WebSocket 发送工单回复
- [ ] 打开同一工单的用户和管理员能实时看到对方消息
- [ ] 收到 `type: "ERROR"` 时弹出 toast 错误
- [ ] 断线重连后自动刷新详情补全历史
- [ ] `npm run ci` 通过

### Must NOT Have (Guardrails)

- 不引入通用聊天库（只用于工单场景）
- 不修改工单列表/创建/关闭的 HTTP 逻辑（只改回复）
- 不修改 `WorkOrderReplyVO` 类型定义（保持向后兼容）

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES（Vitest）
- **Automated tests**: Tests-after
- **Framework**: Vitest + happy-dom

---

## Execution Strategy

### Wave 1（Foundation）

- [x] **T1. 安装 STOMP 依赖**
      **What to do**:
  - `npm install @stomp/stompjs`
  - 确认 `package.json` 和 `package-lock.json` 更新

  **Acceptance Criteria**:
  - [ ] `@stomp/stompjs` 出现在 dependencies 中
  - [ ] `npm run type-check` 仍通过

  **Commit**: `chore(deps): add @stomp/stompjs for work order chat`

- [x] **T2. 创建 WebSocket 连接管理组合式函数**
      **What to do**:
  - 新建 `src/composables/common/useWorkOrderChat.ts`
  - 功能:
    - `connect(token: string)` — 建立 STOMP 连接，endpoint 从环境变量读取（默认 `ws://localhost:18080/ws/order/chat`）
    - `disconnect()` — 断开连接
    - `subscribe(workOrderId: string, callback: (msg) => void)` — 订阅 topic
    - `unsubscribe(workOrderId: string)` — 取消订阅
    - `sendMessage(workOrderId: string, content: string)` — 发送消息到 `/app/chat.send`
    - `isConnected` ref — 连接状态
    - 自动重连: 断线后 3s 重试，最多 5 次
    - 重连成功后执行 `onReconnect` 回调（供调用方刷新详情）
  - 内部维护 `stompClient` 单例，避免重复连接
  - 导出全局实例或工厂函数

  **设计细节**:

  ```ts
  // 发送格式
  {
    workOrderId: (Number(workOrderId), content)
  }

  // 接收格式映射
  interface WSMessage {
    type: 'CHAT' | 'ERROR'
    workOrderId: number
    content: string
    senderType: 'USER' | 'ADMIN'
    senderId: number
    timestamp: number
  }

  // 转换为 WorkOrderReplyVO
  const mapToReplyVO = (msg: WSMessage): WorkOrderReplyVO => ({
    id: String(msg.timestamp), // 无唯一 ID，用 timestamp 兜底
    senderType: msg.senderType === 'USER' ? 0 : 1,
    content: msg.content,
    createAt: new Date(msg.timestamp).toISOString(),
  })
  ```

  **Acceptance Criteria**:
  - [ ] 能成功 connect 到 STOMP endpoint
  - [ ] 能 subscribe / unsubscribe
  - [ ] 能 send 消息
  - [ ] 断线后自动重连
  - [ ] 类型检查通过

  **Commit**: `feat(chat): add useWorkOrderChat composable`

### Wave 2（API 清理 + 前台改造）

- [x] **T3. 移除废弃 API 并改造前台**
      **What to do**:
  1. `src/api/trade/workOrder.ts` — 删除 `submitMyWorkOrderReply`，保留 `submitAdminWorkOrderReply`（后台也需要在 T4 中移除）
  2. `src/api/trade/workOrder.ts` — 可选: 将 `submitAdminWorkOrderReply` 标记为废弃注释或直接删除（如果 T4 一起处理）
  3. `src/composables/profile/useWorkOrderList.ts`:
     - 移除 `replyMutation`（基于 HTTP 的 mutation）
     - 注入 `useWorkOrderChat` 实例
     - `submitWorkOrderReply` 改为调用 `chat.sendMessage(id, content)`
     - 在 `openWorkOrderDetail` 中订阅该工单的 topic，收到消息后追加到 `replies` 数组
     - 收到 `type: "ERROR"` 时设置 `replyError`
     - 在 `closeWorkOrderDetail` 中取消订阅
     - 暴露 `chat.isConnected` 供 UI 显示连接状态
  4. `src/components/features/profile/ProfileWorkOrderDetailDialog.vue`:
     - 新增 `isConnected` prop 或从 composable 读取
     - 未连接时禁用输入框并显示"连接中..."

  **Acceptance Criteria**:
  - [ ] 前台工单详情打开时自动建立 WS 连接并订阅
  - [ ] 发送回复通过 WebSocket
  - [ ] 收到对方消息后实时出现在聊天区
  - [ ] 收到 ERROR 时显示错误提示
  - [ ] 关闭弹窗时取消订阅（不关闭 WS 连接，供其他工单复用）

  **Commit**: `feat(profile): migrate work order reply to websocket`

### Wave 3（后台改造）

- [x] **T4. 改造后台工单管理**
      **What to do**:
  1. `src/api/trade/workOrder.ts` — 删除 `submitAdminWorkOrderReply`
  2. `src/composables/admin/list-pages/useAdminWorkOrderListPage.ts`:
     - 与 T3 相同的模式：移除 `replyMutation`，注入 `useWorkOrderChat`
     - `submitReply` 改为 `chat.sendMessage`
     - `openDetail` 中订阅 topic
     - `closeDetail` 中取消订阅
     - 收到消息追加到 `replies`
  3. `src/components/features/admin-work-order/WorkOrderDetailDialog.vue`:
     - 与前台相同的连接状态处理

  **Acceptance Criteria**:
  - [ ] 后台工单详情打开时自动建立 WS 连接并订阅
  - [ ] 管理员发送回复通过 WebSocket
  - [ ] 收到用户消息后实时出现在聊天区

  **Commit**: `feat(admin): migrate work order reply to websocket`

### Wave 4（验证 + 断线补全）

- [x] **T5. 断线重连 + 历史同步**
      **What to do**:
  1. `useWorkOrderChat` — 在重连成功后触发 `onReconnect` 回调
  2. `useWorkOrderList.ts` 和 `useAdminWorkOrderListPage.ts` — 在 `onReconnect` 中调用 `queryClient.invalidateQueries(queryKeys.profile.workOrderDetail(...))` 刷新详情
  3. 验证: 模拟断线后重连，确认缺失的消息被补全

  **Acceptance Criteria**:
  - [ ] 断线期间发送的消息在重连后被补全
  - [ ] `npm run ci` 通过

  **Commit**: `feat(chat): auto-sync history on websocket reconnect`

### Wave FINAL

- [x] **F1. 完整 CI 验证**
      `npm run ci` — 全部通过。

---

## Commit Strategy

- T1: `chore(deps): add @stomp/stompjs for work order chat`
- T2: `feat(chat): add useWorkOrderChat composable`
- T3: `feat(profile): migrate work order reply to websocket`
- T4: `feat(admin): migrate work order reply to websocket`
- T5: `feat(chat): auto-sync history on websocket reconnect`

---

## Success Criteria

### Verification Commands

```bash
npm run ci
```

### Final Checklist

- [ ] `@stomp/stompjs` 已安装
- [ ] `useWorkOrderChat` 组合式函数可用
- [ ] 前台工单回复走 WebSocket
- [ ] 后台工单回复走 WebSocket
- [ ] 实时消息推送正常
- [ ] 错误消息正确显示
- [ ] 断线重连 + 历史同步
- [ ] 废弃 HTTP 回复 API 已删除
- [ ] `npm run ci` 通过
