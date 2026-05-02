## Wave 2 - Type File Splitting

### Completed Work

Split three oversized type files into domain-specific submodules under `types/` directories:

1. **`src/api/event/types.ts`** (556 lines) → 7 files under `src/api/event/types/`
   - `event.ts` (148 lines) - Event core, EventDetail, Home, Follow, event-scoped requests
   - `session.ts` (26 lines) - SessionVO, SessionItem, Session requests
   - `ticketType.ts` (46 lines) - TicketTypeVO, TicketInventoryVO, TicketType requests
   - `category.ts` (24 lines) - Category types
   - `series.ts` (18 lines) - Series types
   - `city.ts` (74 lines) - City types + Banner types + HomeBannerItem
   - `venue.ts` (141 lines) - Venue, Participant, ServiceGuarantee, Notice types

2. **`src/api/trade/types.ts`** (155 lines) → 2 files under `src/api/trade/types/`
   - `order.ts` (97 lines) - TicketOrder, Payment, Refund, Order types
   - `workOrder.ts` (45 lines) - WorkOrder types

3. **`src/api/account/types.ts`** (161 lines) → 5 files under `src/api/account/types/`
   - `user.ts` (23 lines)
   - `passenger.ts` (23 lines)
   - `auth.ts` (15 lines)
   - `admin.ts` (29 lines)
   - `profile.ts` (45 lines)

All original `types.ts` files were converted to barrel files using `export * from './types/...'`.

### Cross-file Dependencies

When splitting monolithic type files, some types reference others across domain boundaries:

- `event.ts` imports from `venue.ts`, `session.ts`, `series.ts`
- `session.ts` imports `TicketTypeVO` from `ticketType.ts`
- `auth.ts` imports `UserVO` from `user.ts`

These cross-imports are one-directional with no circular dependencies.

### Verification

- `npm run type-check`: 0 errors (after fixing missing `name` field in `ParticipantPageRequest`)
- `npm run lint:oxlint`: 0 warnings, 0 errors
- `npm test`: 21 test files passed, 67 tests passed

### Key Lesson

When copying type definitions, preserve every field exactly. A single missing optional field (`name?: string` in `ParticipantPageRequest`) caused a type-check failure in downstream composables.
