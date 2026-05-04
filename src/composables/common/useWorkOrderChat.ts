import { ref } from 'vue'
import dayjs from 'dayjs'
import type { Client, StompSubscription } from '@stomp/stompjs'
import { toast } from 'vue3-toastify'
import type { WorkOrderReplyVO } from '@/api/trade'

// ─── Dynamic Stomp Import (deduplicated) ──────────────────────

let _ClientClass: typeof Client | null = null
let _importPromise: Promise<void> | null = null

async function _loadStompClient(): Promise<void> {
  if (_ClientClass) return
  _importPromise ??= import('@stomp/stompjs').then((m) => {
    _ClientClass = m.Client
  })
  await _importPromise
}

// ─── Internal WS Message Types ────────────────────────────────

interface WSChatMessage {
  type: 'CHAT' | 'ERROR'
  workOrderId: string
  content: string
  senderType?: string
  senderId?: string
  timestamp: number | string
}

// ─── Message Mapping ──────────────────────────────────────────

function mapWSMessageToReplyVO(msg: WSChatMessage): WorkOrderReplyVO {
  const rawTs = msg.timestamp
  const parsed = typeof rawTs === 'string' ? Number(rawTs) : typeof rawTs === 'number' ? rawTs : NaN
  const ts = Number.isFinite(parsed) && parsed > 0 ? parsed : dayjs().valueOf()

  return {
    id: `ws-${ts}`,
    senderType: msg.senderType === 'USER' ? 0 : 1,
    content: msg.content,
    createAt: dayjs(ts).toISOString(),
  }
}

// ─── Factory ──────────────────────────────────────────────────

const MAX_RECONNECT_ATTEMPTS = 5

function createWorkOrderChat() {
  const isConnected = ref(false)
  const subscriptions = new Map<string, StompSubscription>()
  let stompClient: Client | null = null
  const reconnectCallbacks: (() => void)[] = []
  const errorCallbacks: ((msg: string) => void)[] = []
  let currentToken: string | null = null
  let reconnectCount = 0

  interface PendingSubscription {
    workOrderId: string
    onMessage: (reply: WorkOrderReplyVO) => void
    onError?: (error: string) => void
  }
  let pendingSubscriptions: PendingSubscription[] = []

  function getBrokerURL(): string {
    return (
      (import.meta as ImportMeta & { env?: { VITE_WS_URL?: string } }).env?.VITE_WS_URL ||
      'ws://localhost:18080/ws/order/chat'
    )
  }

  async function connect(token: string): Promise<void> {
    await _loadStompClient()
    const Client = _ClientClass!

    if (!token) {
      console.warn('[useWorkOrderChat] Cannot connect: no token provided')
      return
    }

    // Already connected with same token → skip
    if (stompClient?.connected && currentToken === token) return

    // Token changed → disconnect first
    if (stompClient && currentToken !== token) {
      doDisconnect()
    }

    currentToken = token
    reconnectCount = 0

    stompClient = new Client({
      brokerURL: getBrokerURL(),
      connectHeaders: { token },
      heartbeatOutgoing: 10000,
      heartbeatIncoming: 10000,
      reconnectDelay: 3000,

      onConnect: () => {
        reconnectCount++
        if (reconnectCount > MAX_RECONNECT_ATTEMPTS + 1) {
          console.warn(
            `[useWorkOrderChat] Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) exceeded, disconnecting`,
          )
          disconnect()
          return
        }
        isConnected.value = true
        // Fire reconnect callbacks (also fires on initial connect, which is intentional —
        // callers register their callback before connecting and it runs on first connect too)
        reconnectCallbacks.forEach((cb) => cb())

        // Flush any subscriptions that were queued before connection
        if (pendingSubscriptions.length > 0) {
          pendingSubscriptions.forEach(({ workOrderId, onMessage, onError }) => {
            doSubscribe(workOrderId, onMessage, onError)
          })
          pendingSubscriptions = []
        }
      },

      onDisconnect: () => {
        isConnected.value = false
        subscriptions.clear()
      },

      onStompError: (frame) => {
        const errorMsg = frame.headers['message'] || frame.body || '连接异常'
        toast.error(`消息发送失败: ${errorMsg}`)
        console.error('[useWorkOrderChat] STOMP error:', errorMsg)
      },

      onWebSocketError: (event) => {
        console.error('[useWorkOrderChat] WebSocket error:', event)
      },
    })

    stompClient.activate()
  }

  function doSubscribe(
    workOrderId: string,
    onMessage: (reply: WorkOrderReplyVO) => void,
    onError?: (error: string) => void,
  ): void {
    if (!stompClient) return

    const destination = `/topic/work-order/${workOrderId}`
    const subscription = stompClient.subscribe(destination, (message) => {
      try {
        const msg: WSChatMessage = JSON.parse(message.body)

        if (msg.type === 'ERROR') {
          const errorText = msg.content || 'Unknown error'
          onError?.(errorText)
          errorCallbacks.forEach((cb) => cb(errorText))
          return
        }

        if (msg.type === 'CHAT') {
          const replyVO = mapWSMessageToReplyVO(msg)
          onMessage(replyVO)
        }
      } catch (err) {
        console.error('[useWorkOrderChat] Failed to parse message:', err)
      }
    })

    subscriptions.set(workOrderId, subscription)
  }

  function subscribe(
    workOrderId: string,
    onMessage: (reply: WorkOrderReplyVO) => void,
    onError?: (error: string) => void,
  ): void {
    // Already subscribed to this work order → skip
    if (subscriptions.has(workOrderId)) return

    if (!stompClient?.connected) {
      pendingSubscriptions.push({ workOrderId, onMessage, onError })
      return
    }

    doSubscribe(workOrderId, onMessage, onError)
  }

  function unsubscribe(workOrderId: string): void {
    const subscription = subscriptions.get(workOrderId)
    if (subscription) {
      subscription.unsubscribe()
      subscriptions.delete(workOrderId)
    }
  }

  function sendMessage(workOrderId: string, content: string): void {
    if (!stompClient?.connected) {
      console.warn('[useWorkOrderChat] Cannot send message: not connected')
      return
    }

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        workOrderId,
        content,
      }),
    })
  }

  function offReconnect(callback: () => void): void {
    const idx = reconnectCallbacks.indexOf(callback)
    if (idx !== -1) reconnectCallbacks.splice(idx, 1)
  }

  function offError(callback: (msg: string) => void): void {
    const idx = errorCallbacks.indexOf(callback)
    if (idx !== -1) errorCallbacks.splice(idx, 1)
  }

  function onReconnect(callback: () => void): () => void {
    reconnectCallbacks.push(callback)
    return () => offReconnect(callback)
  }

  function onError(callback: (msg: string) => void): () => void {
    errorCallbacks.push(callback)
    return () => offError(callback)
  }

  function doDisconnect(): void {
    subscriptions.forEach((sub) => sub.unsubscribe())
    subscriptions.clear()
    pendingSubscriptions = []

    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
    }

    isConnected.value = false
    currentToken = null
    reconnectCount = 0
  }

  function disconnect(): void {
    doDisconnect()
    instance = null
  }

  return {
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
    onReconnect,
    offReconnect,
    onError,
    offError,
  }
}

// ─── Singleton ────────────────────────────────────────────────

let instance: ReturnType<typeof createWorkOrderChat> | null = null

export function useWorkOrderChat() {
  if (!instance) instance = createWorkOrderChat()
  return instance
}
