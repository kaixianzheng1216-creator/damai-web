# Fix WebSocket subscribe race condition

## TL;DR

> `chat.subscribe()` crashes with "There is no underlying STOMP connection" because it's called before `connect()` finishes. Add a subscription queue that flushes when STOMP connects.
>
> **Estimated Effort**: Trivial
> **Parallel Execution**: NO

---

## Context

### Error Stack

```
Uncaught TypeError: There is no underlying STOMP connection
    at Client.subscribe (client.ts:1166)
    at Object.subscribe (useWorkOrderChat.ts:118)
    at openWorkOrderDetail (useWorkOrderList.ts:126)
    at onClick (ProfileWorkOrdersSection.vue:66)
```

### Root Cause

1. `useWorkOrderList.ts` calls `chat.connect(token)` via `watch(token, { immediate: true })`
2. `stompClient.activate()` is **asynchronous** — connection isn't ready immediately
3. User clicks a work order card → `openWorkOrderDetail()` → `chat.subscribe()` — but connection not ready yet
4. `@stomp/stompjs` throws because `subscribe()` requires an active connection

### Solution

Add a subscription queue to `useWorkOrderChat`:

- When `subscribe()` is called but not connected → push to queue
- When `onConnect` fires → flush all queued subscriptions
- When already connected → subscribe immediately (current behavior)

---

## Execution Strategy

- [ ] **T1. Add subscription queue to useWorkOrderChat**
      **What to do**:
  1. `src/composables/common/useWorkOrderChat.ts`
  2. Add a `pendingSubscriptions` queue (array of `{ workOrderId, onMessage, onError }`)
  3. In `subscribe()`: if not connected, push to queue instead of throwing
  4. In `onConnect`: after setting `isConnected = true`, flush all queued subscriptions
  5. In `doDisconnect()`: clear the pending queue

  **Acceptance Criteria**:
  - [x] `subscribe()` doesn't throw when called before connection
  - [x] Subscriptions queued before connect are automatically flushed on connect
  - [x] `npm run ci` passes
