# API 函数命名规范

本规范适用于 `src/api/` 目录下所有面向后端的 API 请求函数。

## 核心模式

| 模式           | 语义                     | 示例                                    |
| -------------- | ------------------------ | --------------------------------------- |
| `fetchXxxPage` | 分页查询                 | `fetchEventPage`, `fetchAdminOrderPage` |
| `fetchXxxById` | 按 ID 查询详情           | `fetchEventById`, `fetchTicketById`     |
| `fetchXxxList` | 非分页列表查询           | `fetchCategoryList`, `fetchCityList`    |
| `createXxx`    | 创建资源                 | `createEvent`, `createOrder`            |
| `updateXxx`    | 更新资源                 | `updateEvent`, `updateTicketType`       |
| `deleteXxx`    | 删除资源                 | `deleteEvent`, `deleteSession`          |
| `submitXxx`    | 提交动作（回复、退款等） | `submitWorkOrderReply`, `submitRefund`  |
| `closeXxx`     | 关闭动作                 | `closeWorkOrder`, `closeTicketOrder`    |
| `publishXxx`   | 上线/发布状态变更        | `publishEvent`                          |
| `offlineXxx`   | 下线/下架状态变更        | `offlineEvent`                          |

## 前缀约定

- **前台接口**：不加前缀，如 `fetchEventPage`、`createOrder`
- **后台接口**：统一加 `Admin` 前缀，如 `fetchAdminEventPage`、`fetchAdminOrderById`
- **当前用户视角**：使用 `My` 前缀，如 `fetchMyOrderPage`、`fetchMyTicketPage`

## 命名细则

1. **实体名使用单数形式**：`fetchCategoryList` 而非 `fetchCategoriesList`
2. **分页查询必须以 `Page` 结尾**：`fetchAdminCategoryPage` 而非 `fetchAdminCategories`
3. **列表查询必须以 `List` 结尾**：`fetchBannerList` 而非 `fetchBanners`
4. **详情查询必须以 `ById` 结尾**：`fetchVenueById` 而非 `fetchVenueDetail`
5. **提交类动作使用 `submit` 前缀**：工单回复、退款申请等
6. **状态变更使用 `publish` / `offline` / `close` 等动词**：不使用 `save` 或 `do`
7. **Batch 操作保持 `batch` 语义**：如 `batchAddSessions`，不需要改为 `createSessions`
8. **特殊业务动词可保留**：`checkinTicket`、`cancelTicketOrder`、`uploadFile`

## 迁移策略

- 旧命名保留为 `@deprecated` 别名，指向新命名
- 别名保持向后兼容，不修改调用方
- 新代码应使用规范命名

## 示例

```ts
// 分页查询
export const fetchEventPage = (params: EventPageRequest) => ...

// 详情查询
export const fetchEventById = (id: string) => ...

// 非分页列表
export const fetchCategoryList = () => ...

// 创建
export const createEvent = (data: EventCreateRequest) => ...

// 提交动作
export const submitWorkOrderReply = (id: string, data: ReplyRequest) => ...

// 状态变更
export const publishEvent = (id: string) => ...
export const closeWorkOrder = (id: string) => ...
```
