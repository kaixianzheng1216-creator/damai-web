# Learnings: restore-admin-table-rendering

## Pattern: Dual-mode DataTableCrud (table vs card)

- `columns.length > 0` → render HTML `<table>` with `<FlexRender>` for header/cell
- `columns.length === 0` → render `<TableCardView>` (card mode, used by profile sections)
- Both modes share the same `useVueTable` instance, only rendering differs

## Key points

- `FlexRender` must be imported in `DataTableCrud.vue` for the table mode template (was only in `TableCardView.vue` before)
- The loading overlay uses `absolute inset-0 z-10 bg-background/60 backdrop-blur-sm` pattern
- Empty state uses inline `暂无数据` text with colspan matching column count
- Row click emits `row-click` with `row.original` (raw data object)
- No new dependencies needed — `@tanstack/vue-table` already has `FlexRender`
