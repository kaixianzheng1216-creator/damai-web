# 接口清洁 TODO 清单

> 基于 `docs/` 下 OpenAPI 文档与 `src/api/` 类型定义的逐域对比结果
>
> **状态：已完成 ✅**（2026-04-28）

---

## 一、高优先级：类型定义不匹配 / 缺失

### `src/api/event/types.ts`

| #   | 问题                                   | OpenAPI 定义                                                           | 当前 TS 定义            | 状态                                                                      |
| --- | -------------------------------------- | ---------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------- |
| 1   | `EventVO` 字段缺失                     | 有 `parentCategoryNameSnapshot` (string)、`followCount` (int64)        | 缺少这两个字段          | ✅ **已完成** — 已补全到 `EventVO`                                        |
| 2   | `TicketTypeVO` 字段缺失                | 有 `eventId` (int64)                                                   | 缺少 `eventId`          | ✅ **已完成** — 已补全到 `TicketTypeVO`                                   |
| 3   | `ServiceItem` 类型不匹配               | `serviceGuaranteeId` / `serviceGuaranteeOptionId` 为 **integer int32** | 定义为 **string**       | ✅ **无需修改** — 后端实际序列化为 `string`，保持 `string` 可避免精度丢失 |
| 4   | `EventServiceGuaranteeVO` 字段缺失     | 有 `serviceGuaranteeId` (int32)、`serviceGuaranteeOptionId` (int32)    | 缺少这两个字段          | ✅ **已完成** — 已补全到 `EventServiceGuaranteeVO`（值为 `string`）       |
| 5   | `ServiceGuaranteeOptionVO` 类型不匹配  | `serviceGuaranteeId` 为 **integer int32**                              | 定义为 **string**       | ✅ **无需修改** — 后端实际序列化为 `string`，保持 `string` 可避免精度丢失 |
| 6   | 缺失类型 `EventParticipantSortRequest` | `{ eventParticipantIds: number[] }` (required)                         | 不存在                  | ✅ **已完成** — 已新增，数组元素保持 `string[]` 符合 ID 规范              |
| 7   | 缺失类型 `FeaturedUpdateRequest`       | `{ isFeatured: number }` (required)                                    | 不存在                  | ✅ **已完成** — 已新增该接口类型                                          |
| 8   | `BannerCreateRequest` `sortOrder` 字段 | OpenAPI 无 `sortOrder`（后端遗漏）                                     | 有 `sortOrder?: number` | ✅ **已确认保留** — 等待后端 OpenAPI 文档同步更新                         |
| 9   | `BannerUpdateRequest` `sortOrder` 字段 | OpenAPI 无 `sortOrder`（后端遗漏）                                     | 有 `sortOrder?: number` | ✅ **已确认保留** — 等待后端 OpenAPI 文档同步更新                         |

### `src/api/ai/types.ts`

| #   | 问题                    | OpenAPI 定义                                                                    | 当前 TS 定义                                                         | 状态                                                   |
| --- | ----------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| 10  | `AiChatItem` 完全对不上 | 字段：`type`, `id`, `title`, `subtitle`, `coverUrl`, `status`, `amount`, `time` | 字段：`id`, `name`, `coverUrl`, `venueName`, `startTime`, `minPrice` | ✅ **已完成** — 已完全重写 `AiChatItem` 以匹配 OpenAPI |

### `src/api/trade/types.ts`

| #   | 问题                        | OpenAPI 定义 | 当前 TS 定义         | 状态                          |
| --- | --------------------------- | ------------ | -------------------- | ----------------------------- |
| 11  | `WorkOrderVO` `userId` 字段 | —            | 有 `userId?: string` | ✅ **已确认保留**（业务需要） |

---

## 二、中优先级：API 函数缺失（有类型但无对应请求函数）

### `src/api/trade/`（需补充到 `order.ts` / `payment.ts`）

| #   | 缺失函数              | 对应 OpenAPI 端点                       | 状态                                  |
| --- | --------------------- | --------------------------------------- | ------------------------------------- |
| 16  | `createRefund`        | `POST /front/ticket-orders/{id}/refund` | ✅ **已完成** — 已补充到 `payment.ts` |
| 17  | `fetchAdminOrderPage` | `GET /admin/ticket-orders`              | ✅ **已完成** — 已补充到 `order.ts`   |
| 18  | `fetchAdminOrderById` | `GET /admin/ticket-orders/{id}`         | ✅ **已完成** — 已补充到 `order.ts`   |

---

## 三、低优先级 / 待确认项

### `src/api/account/passenger.ts`

| #   | 问题                       | 状态                                                                                                                                                                                           |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 19  | `updatePassenger` 端点存疑 | ✅ **已完成** — 已确认后端**不支持** `PUT /api/account/front/passenger/{id}`。已从前端移除 `updatePassenger` API 函数、`PassengerUpdateRequest` 类型及 `usePassengerManagement` 中的编辑逻辑。 |

### `src/api/file/file.ts`

| #   | 问题             | 状态                                                                                                                  |
| --- | ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| 20  | 文件删除函数缺失 | ✅ **已确认不处理** — OpenAPI 虽定义了删除端点，但前端 `ImageUpload` 组件无删除需求，保持当前仅 `uploadFile` 的实现。 |

### `src/api/event/types.ts` — 字段存在性疑问

| #   | 问题                            | 状态                                                                                             |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| 21  | `TicketTypeVO.salePrice` 多余？ | ✅ **已完成** — 确认后端实际字段为 `salePrice`，已删除 `price` 字段，保留 `salePrice?: number`。 |

---

## 四、已确认对应正确（无需修改）✅

以下模块的类型和 API 函数与 OpenAPI 完全对应，无需调整：

- **认证管理** (`src/api/account/auth.ts`, `types.ts`)：`LoginResponse`、`LoginParams`、`SendCodeParams`
- **用户管理** (`src/api/account/user.ts`)：`UserVO`、`UserUpdateRequest`、`UserPageRequest`
- **管理员管理** (`src/api/account/admin.ts`)：`AdminVO`、`AdminCreateRequest`、`AdminUpdateRequest`、`AdminPageRequest`
- **Banner 管理** (`src/api/event/banner.ts`)：CURD 完整，仅类型字段需微调（见上表 #8、#9）
- **城市/分类/场馆/系列/须知** 管理：类型与 CRUD 接口基本完整
- **订单创建/支付/取消/状态查询** (`src/api/trade/payment.ts`, `order.ts`)
- **工单管理** (`src/api/trade/workOrder.ts`)：前后台接口完整
- **电子票管理** (`src/api/ticket/ticket.ts`)：前台/后台/检票接口完整
- **AI 对话请求类型** (`AiChatRequest`、`AiChatResponse` 结构正确，仅 `AiChatItem` 需重写)

---

## 五、ID / BigInt 处理规范（必须遵守）

### 5.1 已确认的处理方案

**后端实际已将所有 ID 字段序列化为 `string`**（如 `"id": "7"`、`"parentId": "0"`），因此前端无需担心 JS `number` 精度丢失问题。

当前前端采用 **"全链路 String 化 + 防御层兜底"** 的双保险策略：

```
后端返回 JSON:  { "id": "7", "eventId": "9007199254740992" }
       ↓
Axios JSON.parse → { id: "7", eventId: "9007199254740992" }  ← 已是 string
       ↓
normalizeResponseFields → normalizeId("7")
       ↓
已存在 string → 原样返回 "7"
       ↓
业务代码拿到的 VO.id = string
```

### 5.2 防御层机制（`src/api/requestTransforms.ts`）

```ts
// 规则：所有以 "id" / "Id" / "ID" 结尾的字段，以及 "ids" / "IDs" 列表字段
function isEntityIdField(key: string): boolean {
  return key === 'id' || key.endsWith('Id') || key.endsWith('ID')
}

export function normalizeId(value: unknown): unknown {
  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value) // ← 兜底：万一后端某接口漏了转 string
  }
  return value // ← 正常情况：后端已是 string，直接透传
}
```

**每次 API 响应都会经过 `normalizeResponseFields` 递归处理**，因此：

- 即使后端偶尔返回 `number` 类型的 ID，也会被自动转为 `string`
- 即使后端返回超大数字（超出 JS safe int），也不会丢失精度

### 5.3 创建接口的返回值处理

后端创建接口返回 `ApiResponseLong`（即 Java `Long` 原始值），前端通过 `normalizeEntityId` 统一转为 `string`：

```ts
// src/api/types.ts
export type EntityId = string
export type RawEntityId = string | number | bigint

export function normalizeEntityId(value: RawEntityId): EntityId {
  return String(value)
}

// 使用示例
export const createEvent = (data: EventCreateRequest): Promise<string> =>
  request.post<RawEntityId>('/api/event/admin/events', data).then(normalizeEntityId)
```

### 5.4 新增接口 / 新增类型的强制规范

| 规则                                                | 说明                                                          | 违反后果                                                              |
| --------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| **所有 VO 中的 ID 字段必须声明为 `string`**         | 包括 `id`、`eventId`、`userId`、`ticketTypeId`、`parentId` 等 | 如果声明为 `number`，超大 ID 会出现精度丢失                           |
| **所有路由参数必须 `as string`**                    | `route.params.id as string`                                   | `route.params.id` 默认是 `string \| string[]`，不断言会导致类型错误   |
| **请求体中的 ID 保持 string 传递**                  | 不要手动 `Number(id)` 后再传给 API                            | 后端 Spring Boot 的 `Long` 参数可以直接从 string 解析                 |
| **分页元数据保持 `number`**                         | `pageNumber`、`pageSize`、`totalRow`、`totalPage` 是 `number` | `normalizeResponseFields` 会自动把 string 形式的分页字段转为 `number` |
| **创建接口的返回值必须 `.then(normalizeEntityId)`** | 返回 `Promise<string>`                                        | 避免业务代码直接拿到 `number` 类型的原始 ID                           |

### 5.5 OpenAPI 文档与实际的差异（待后端同步）

**当前 OpenAPI 文档中的 ID 字段定义与实际响应不一致：**

- 文档定义：`"id": { "type": "integer", "format": "int64" }`
- 实际响应：`"id": "7"`（string）

此外，部分非 ID 字段在 OpenAPI 中标记为 `integer int32`（如 `ServiceItem.serviceGuaranteeId`、`ServiceGuaranteeOptionVO.serviceGuaranteeId`），但后端实际同样以 `string` 序列化，前端保持 `string` 定义以统一处理。

> **注意**：前端代码已按实际响应（string）处理，无需修改。建议后端同步更新 OpenAPI 文档：
>
> - 将所有实际返回 `string` 的 ID 字段 `type` 从 `integer` 改为 `string`
> - 统一 `serviceGuaranteeId` / `serviceGuaranteeOptionId` 等字段的文档类型与实际序列化行为一致

### 5.6 禁止事项

以下代码在项目中 **绝对禁止** 出现：

```ts
// ❌ 禁止：把 ID 从 string 转回 number
const eventId = Number(route.params.id)
const eventId = parseInt(route.params.id as string)
const eventId = +route.params.id

// ❌ 禁止：VO 中把 ID 声明为 number
interface EventVO {
  id: number // 错误！
  eventId: number // 错误！
}

// ❌ 禁止：创建接口返回 number
export const createEvent = (data: EventCreateRequest): Promise<number> =>
  request.post<number>('/api/event/admin/events', data)
```

### 5.7 相关文件位置

| 文件                                          | 作用                                                        |
| --------------------------------------------- | ----------------------------------------------------------- |
| `src/api/types.ts`                            | `EntityId`、`RawEntityId`、`normalizeEntityId`              |
| `src/api/requestTransforms.ts`                | `normalizeId`、`normalizeIdList`、`normalizeResponseFields` |
| `src/api/request.ts`                          | 在 `unwrapApiResponse` 中调用 `normalizeResponseFields`     |
| `src/api/__tests__/requestTransforms.test.ts` | 单元测试覆盖超大数字和 bigint 的转换                        |

---

## 六、全量复核记录（2026-04-28）

> 用户要求全面复核前端接口定义与 OpenAPI 文档的一致性。以下记录已完成的复核结果及未完成的工作。

### 6.1 已完成复核的模块

#### ✅ account + auth（账号管理 + 认证管理）

**发现的问题：**

| 类别     | 问题                                            | 说明                                                                                               | 建议                                                  |
| -------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 类型差异 | `UserPageRequest` 缺少 `sortField`、`sortOrder` | OpenAPI `/admin/user/page` 查询参数包含这两个字段，前端缺少                                        | **补充到 `UserPageRequest`**                          |
| 类型差异 | `PassengerUpdateRequest` 在 OpenAPI 中不存在    | 前端有 `updatePassenger`，但 OpenAPI 账号管理文档无此 endpoint                                     | **已确认不处理**（前端实际使用，后端文档遗漏）        |
| 类型差异 | `UserVO` 字段不一致                             | 认证管理 OpenAPI 只定义 `id/username/mobile/avatarUrl`，账号管理 OpenAPI 包含 `status/statusLabel` | **前端以账号管理为准**（`status`/`statusLabel` 保留） |
| API 差异 | `fetchAdminById` 缺失                           | `GET /admin/admin/{id}` 在前端 `admin.ts` 中无对应函数                                             | ✅ **已完成**                                         |
| API 差异 | `fetchUserById` 缺失                            | `GET /admin/user/{id}` 在前端 `user.ts` 中无对应函数                                               | ✅ **已完成**                                         |

### 6.2 待复核的模块（回家后续做）

以下模块的复核任务已启动但尚未返回完整结果，需继续完成：

- [ ] **活动管理 (event)** — `docs/活动管理_OpenAPI.json` vs `src/api/event/*`
  - 最大的模块，需重点检查 `EventVO`、`TicketTypeVO`、`SessionVO`、各类 Request/Response 和 CRUD 函数
- [ ] **交易管理 (trade)** — `docs/交易管理_OpenAPI.json` vs `src/api/trade/*`
  - 重点检查 `TicketOrderVO`、`PaymentVO`、`RefundVO`、`WorkOrderVO` 及前台/后台/内部接口
- [ ] **电子票管理 (ticket)** — `docs/电子票管理_OpenAPI.json` vs `src/api/ticket/*`
  - 重点检查 `TicketVO` 所有字段、检票接口、生成/退票内部接口
- [ ] **AI 助手 (ai)** — `docs/AI 助手_OpenAPI.json` vs `src/api/ai/*`
  - `AiChatRequest`、`AiChatItem`、`AiChatResponse`（`AiChatItem` 已重写，需确认是否完全对齐）
- [ ] **文件管理 (file)** — `docs/文件管理_OpenAPI.json` vs `src/api/file/*`
  - 上传/删除接口的 URL 和参数

### 6.3 回家后续待办清单

1. **完成剩余 5 个模块的全量复核**，逐 schema 对比字段名、类型、必填性、API 函数。
2. **修复 account 模块发现的问题**：
   - 在 `src/api/account/types.ts` 的 `UserPageRequest` 中补充 `sortField?: string` 和 `sortOrder?: string`
   - 在 `src/api/account/admin.ts` 中补充 `fetchAdminById(id: string)`
   - 在 `src/api/account/user.ts` 中补充 `fetchUserById(id: string)`
3. **修复 event 模块可能存在的问题**：
   - 等待复核结果后统一修复
4. **修复 trade/ticket/ai/file 模块可能存在的问题**：
   - 等待复核结果后统一修复
5. **运行 `npm run type-check` 和 `npm run test`** 验证所有修改

### 6.4 当前项目状态快照（离开时）

- `type-check`: ✅ 通过
- `test`: ✅ 44 个测试全部通过
- `TicketTypeVO.price`: ✅ 已删除，相关引用已迁移到 `salePrice`
- `ServiceItem`/`ServiceGuaranteeOptionVO`/`EventServiceGuaranteeVO` 的 `serviceGuaranteeId`/`serviceGuaranteeOptionId`: ✅ 已统一为 `string`
- 已补充的 API 函数：`createRefund`、`fetchAdminOrderPage`、`fetchAdminOrderById`、`sortParticipants`、`publishAllEvents`、`fetchFollowedParticipantEventsPage`、`fetchVenueDetail`
