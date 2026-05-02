# API Directory

This document catalogs all API files under `src/api/` and the main exported functions from each. The API layer is organized by **domain** (account, event, trade, ticket, ai, file). All network requests are sent through the `request` wrapper in `src/api/request.ts`.

> For request/response types, see the corresponding `types.ts` or `types/*.ts` files in each domain folder.

---

## Core Infrastructure

| File                           | Exports                                              | Description                                                                                                                                                                            |
| ------------------------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/api/request.ts`           | `request`, `uploadFormData`, `ApiRequestError`       | Axios instance wrapper with interceptors (auth headers, error handling, response normalization). Exports `request.get`, `request.post`, `request.put`, `request.patch`, `request.del`. |
| `src/api/requestTransforms.ts` | `normalizeResponseFields`, `transformDateTimeFields` | Response field normalization (ID → string, datetime → ISO 8601) and request datetime transformation.                                                                                   |
| `src/api/types.ts`             | `normalizeEntityId`, `RawEntityId`                   | Shared API types and entity ID normalization helpers.                                                                                                                                  |

---

## Account (`src/api/account/`)

### `auth.ts`

- `sendVerifyCode`
- `login`
- `logout`

### `user.ts`

- `fetchUserInfo`
- `updateUserInfo`
- `fetchAdminUserPage`
- `fetchUserById`
- `updateAdminUserStatus`

### `admin.ts`

- `fetchAdminPage`
- `fetchAdminInfo`
- `fetchAdminById`
- `createAdmin`
- `updateAdmin`
- `updateAdminStatus`

### `passenger.ts`

- `fetchPassengerPage`
- `createPassenger`
- `deletePassenger`

---

## AI (`src/api/ai/`)

### `index.ts`

- `chatWithAI`

---

## Event (`src/api/event/`)

### `event.ts`

**Front**

- `fetchEventPage`
- `fetchEventDetailById`

**Admin**

- `fetchAdminEventPage`
- `fetchEventById`
- `createEvent`
- `updateEvent`
- `deleteEvent`
- `publishEvent`
- `offlineEvent`
- `saveEventInfo`
- `publishAllEvents`

**Session**

- `batchAddSessions`
- `updateSession`
- `deleteSession`

**Ticket Type**

- `createTicketType`
- `updateTicketType`
- `deleteTicketType`
- `adjustTicketTypeInventory`

**Service**

- `batchAddServices`
- `removeService`

**Participant**

- `removeParticipant`
- `batchAddParticipants`
- `sortParticipants`

**Copy**

- `copyTicketTypes`

### `category.ts`

**Front**

- `fetchCategoryList`
- `fetchCategories` _(deprecated, alias of `fetchCategoryList`)_

**Admin**

- `fetchAdminCategoryList`
- `fetchAdminCategories` _(deprecated, alias of `fetchAdminCategoryList`)_
- `fetchAdminCategoriesPage`
- `createCategory`
- `updateCategory`
- `deleteCategory`

### `city.ts`

**Front**

- `fetchGroupedCityList`
- `fetchGroupedCities` _(deprecated, alias of `fetchGroupedCityList`)_
- `fetchCityList`
- `fetchCitiesList` _(deprecated, alias of `fetchCityList`)_

**Admin**

- `fetchAdminCityList`
- `fetchAdminCities` _(deprecated, alias of `fetchAdminCityList`)_
- `fetchAdminCitiesPage`
- `createCity`
- `updateCity`
- `deleteCity`
- `updateCityFeatured`

### `venue.ts`

**Admin**

- `fetchAdminVenueList`
- `fetchAdminVenues` _(deprecated, alias of `fetchAdminVenueList`)_
- `fetchAdminVenuesPage`
- `createVenue`
- `updateVenue`
- `deleteVenue`

**Front**

- `fetchVenueById`
- `fetchVenueDetail` _(deprecated, alias of `fetchVenueById`)_

### `banner.ts`

**Front**

- `fetchBannerList`
- `fetchBanners` _(deprecated, alias of `fetchBannerList`)_

**Admin**

- `fetchAdminBannerList`
- `fetchAdminBanners` _(deprecated, alias of `fetchAdminBannerList`)_
- `fetchAdminBannersPage`
- `createBanner`
- `updateBanner`
- `deleteBanner`

### `series.ts`

**Admin**

- `fetchAdminSeriesList`
- `fetchAdminSeries` _(deprecated, alias of `fetchAdminSeriesList`)_
- `fetchAdminSeriesPage`
- `createSeries`
- `updateSeries`
- `deleteSeries`

### `service.ts`

**Admin**

- `fetchAdminServiceList`
- `fetchAdminServices` _(deprecated, alias of `fetchAdminServiceList`)_
- `fetchAdminServicesPage`
- `createService`
- `updateService`
- `deleteService`
- `createServiceOption`
- `updateServiceOption`
- `deleteServiceOption`

### `participant.ts`

**Admin**

- `fetchAdminParticipantList`
- `fetchAdminParticipants` _(deprecated, alias of `fetchAdminParticipantList`)_
- `fetchAdminParticipantsPage`
- `createParticipant`
- `updateParticipant`
- `deleteParticipant`

**Front**

- `fetchParticipantById`
- `fetchParticipantDetail` _(deprecated, alias of `fetchParticipantById`)_
- `fetchParticipantEventsPage`

### `notice.ts`

**Admin**

- `fetchAdminNoticeList`
- `fetchAdminNotices` _(deprecated, alias of `fetchAdminNoticeList`)_
- `fetchAdminNoticesPage`
- `createNotice`
- `updateNotice`
- `deleteNotice`

### `follow.ts`

**Event Follow**

- `followEvent`
- `unfollowEvent`
- `checkIsFollowedEvent`
- `fetchFollowedEventsPage`

**Participant Follow**

- `followParticipant`
- `unfollowParticipant`
- `checkIsFollowedParticipant`
- `fetchFollowedParticipantsPage`
- `fetchFollowedParticipantEventsPage`

---

## File (`src/api/file/`)

### `file.ts`

- `uploadFile`

---

## Ticket (`src/api/ticket/`)

### `ticket.ts`

- `fetchMyTicketPage`
- `fetchTicketById`
- `fetchAdminTicketPage`
- `checkinTicket`

---

## Trade (`src/api/trade/`)

### `order.ts`

**Front**

- `fetchMyOrderPage`
- `fetchUserPurchaseCounts`
- `fetchOrderById`
- `fetchOrderStatus`

**Admin**

- `fetchAdminOrderPage`
- `fetchAdminOrderById`

### `payment.ts`

- `createTicketOrder`
- `createPayment`
- `cancelTicketOrder`
- `createRefund`

### `workOrder.ts`

**Front**

- `fetchMyWorkOrderPage`
- `fetchWorkOrderById`
- `submitWorkOrderReply`
- `replyWorkOrder` _(deprecated, alias of `submitWorkOrderReply`)_
- `closeWorkOrder`

**Admin**

- `fetchAdminWorkOrderPage`
- `fetchAdminWorkOrderById`
- `submitAdminWorkOrderReply`
- `replyAdminWorkOrder` _(deprecated, alias of `submitAdminWorkOrderReply`)_
- `closeAdminWorkOrder`

---

## Naming Conventions

| Prefix                | Meaning             | Example                                      |
| --------------------- | ------------------- | -------------------------------------------- |
| `fetch`               | GET request         | `fetchEventPage`, `fetchUserInfo`            |
| `create`              | POST request        | `createEvent`, `createOrder`                 |
| `update`              | PUT request         | `updateEvent`, `updateUserInfo`              |
| `delete`              | DELETE request      | `deleteEvent`, `deletePassenger`             |
| `publish` / `offline` | Status transition   | `publishEvent`, `offlineEvent`               |
| `check`               | Check state         | `checkIsFollowedEvent`                       |
| `submit` / `send`     | Action without CRUD | `submitWorkOrderReply`, `sendVerifyCode`     |
| `fetchMy...`          | Front user-scoped   | `fetchMyOrderPage`, `fetchMyTicketPage`      |
| `fetchAdmin...`       | Admin-scoped        | `fetchAdminEventPage`, `fetchAdminOrderPage` |

---

## Authentication Headers

The `request.ts` interceptor automatically injects auth headers based on the request path:

| Path pattern | Header                                |
| ------------ | ------------------------------------- |
| `/admin/*`   | `Authorization-Admin: Bearer <token>` |
| `/front/*`   | `Authorization-User: Bearer <token>`  |

No individual API function needs to set these headers manually.
