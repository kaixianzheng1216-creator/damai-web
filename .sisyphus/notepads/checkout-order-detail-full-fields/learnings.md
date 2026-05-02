## T2 - CheckoutOrderCard.vue Field Expansion

### Changes Made

- Added `createAt` and `expireAt` to the info grid (always visible, after sessionStartAtSnapshot row)
- Added `closeTime` conditional: `v-if="isClosed && order.closeTime"`
- Added `refundTime` conditional: `v-if="order.refundTime"` (direct field check, no isRefunded flag exists)
- Added new payments section using `v-if="order.payments?.length"` with shadcn Card/CardContent

### Patterns Followed

- All labels from PAYMENT_COPY
- All datetimes via formatDateTime()
- All amounts via formatPrice()
- Conditional time fields follow `v-if="isPaid && order.payTime"` style pattern
- Payments section mirrors refunds section structure (mt-6 border-t border-border pt-6, Card bg-muted/30 border-0)
- channelTradeNo shown conditionally `v-if="payment.channelTradeNo"` (it's a string, nullable)

### Verification

- `npm run type-check`: PASS (clean)
- `npm run test`: PASS (25 files, 93 tests)
