## Split monolithic listPageColumns.ts — Learnings

### Pattern: Per-entity column files with shared helpers

- Extracted 6 shared helpers into columnUtils.ts: stopAndRun, ctionButton, ctionGroup, editDeleteActions, ccountStatusBadge, ccountAvatarCell
- Plus shared types: RowAction<T>, CrudColumnActions<T>
- Each per-entity file imports ONLY the helpers/types it needs (not all)

### Key gotcha: h import

- In .vue <script setup>, h is auto-imported by Vue
- In .ts files (columns are pure TS), h MUST be manually imported from 'vue'
- Forgot this for cityColumns.ts initially — it uses h(Button, ...) inline

### Verified: type-check passes, LSP diagnostics clean, no remaining old imports

### Files created:

- 1 util file: columnUtils.ts
- 14 per-entity files: event, admin, user, workOrder, banner, category, city, venue, notice, participant, series, ticket, order, service

### Files modified:

- 14 view files (import paths only)

### Files deleted:

- listPageColumns.ts (753 lines → zero)
