# Card Status Position Refactor

## TL;DR

> **Quick Summary**: Add a `topRight` slot to `CardListItem.vue` and move all **pure status badges** (non-interactive labels like "已支付", "未使用", "处理中") from `bottomRight` to the new `topRight` slot next to the title. Keep **interactive buttons** ("查看", "取消关注", "删除") in `bottomRight`.
>
> **Deliverables**: 4 files modified (`CardListItem.vue`, `OrderCard.vue`, `TicketCard.vue`, `ProfileWorkOrdersSection.vue`)
>
> **Estimated Effort**: Quick (< 30 min)
> **Parallel Execution**: NO — 4 sequential tasks (each depends on the previous file change)
> **Critical Path**: T1 → T2 → T3 → T4 → type-check

---

## Context

### Original Request

User wants to unify card UI layout: status badges should appear in the **top-right corner** next to the title, while interactive buttons stay in the **bottom-right corner**.

### Interview Summary

**Key Discussions**:

- Image 1 shows ticket cards with status "未使用" currently in bottomRight — user wants it topRight
- Image 2 shows event cards with "取消关注" button in bottomRight — this should stay as it's interactive
- Rule established: **status label → topRight, interactive button → bottomRight**

### Research Findings

All profile cards use `CardListItem.vue` as the shared skeleton. Current slots:

- `#title` — card title (top-left)
- `#details` — subtitle/info lines
- `#middle` — separator / extra info
- `#bottomLeft` — ID/number
- `#bottomRight` — status badge OR button

**No `topRight` slot exists** — this is the missing piece.

### Metis Review

**Identified Gaps** (addressed):

- Gap: Need to decide which components need migration. Resolved: only components showing **pure status labels** (no buttons) in `bottomRight` need change.
- Gap: `TicketCard` has both status + button in `bottomRight`. Resolved: move status to `topRight`, keep button in `bottomRight`.

---

## Work Objectives

### Core Objective

Refactor the shared `CardListItem` component and all consuming cards so that status badges render at the top-right, while action buttons remain at the bottom-right.

### Concrete Deliverables

- `src/components/common/CardListItem.vue` — add `#topRight` slot
- `src/components/common/OrderCard.vue` — move status to `#topRight`
- `src/components/common/TicketCard.vue` — move status to `#topRight`, keep button in `#bottomRight`
- `src/components/features/profile/ProfileWorkOrdersSection.vue` — move status to `#topRight`

### Definition of Done

- [ ] All 4 files compile without errors (`npm run type-check` passes)
- [ ] Status badges appear top-right on Order, Ticket, WorkOrder cards
- [ ] Interactive buttons remain bottom-right on Ticket, Event, Passenger cards
- [ ] No visual regressions on EventCard or ProfilePassengersSection

### Must Have

- `CardListItem.vue` must expose a `#topRight` slot positioned to the right of `#title`
- Status labels must use the new `#topRight` slot

### Must NOT Have (Guardrails)

- Do NOT move interactive buttons to `topRight`
- Do NOT modify `EventCard.vue` (it only has a button, no status)
- Do NOT modify `ProfilePassengersSection.vue` (it only has a delete button)
- Do NOT change any data logic or prop signatures

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision

- **Infrastructure exists**: YES (Vitest + vue-tsc)
- **Automated tests**: None required for this visual refactor
- **Framework**: vue-tsc for type-check

### QA Policy

Every task MUST include agent-executed QA scenarios.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Sequential — each task touches the same shared component):
├── Task 1: Add #topRight slot to CardListItem.vue [quick]
├── Task 2: OrderCard.vue — move status to #topRight [quick]
├── Task 3: TicketCard.vue — move status to #topRight [quick]
├── Task 4: ProfileWorkOrdersSection.vue — move status to #topRight [quick]
└── Task 5: Run type-check and verify [quick]

Critical Path: T1 → T2 → T3 → T4 → T5
Parallel Speedup: N/A (sequential dependency on shared component)
```

### Dependency Matrix

- **T1**: None → blocks T2, T3, T4
- **T2**: T1
- **T3**: T1
- **T4**: T1
- **T5**: T2, T3, T4

### Agent Dispatch Summary

- **Wave 1**: **5** tasks → all `quick` category (single-file visual changes)

---

## TODOs

- [x] 1. Add `#topRight` slot to `CardListItem.vue`

  **What to do**:
  - In both the `RouterLink` branch and the plain `Card` branch, wrap `#title` and add a sibling `#topRight` slot
  - Position: `flex items-start justify-between gap-2`
  - Default fallback: `<div />` (empty div to preserve layout)

  **Must NOT do**:
  - Do NOT remove or rename existing slots
  - Do NOT change any CSS on existing slots

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`
  - **Skills Evaluated but Omitted**: `shadcn-vue` (no new UI components needed)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential Wave 1
  - **Blocks**: T2, T3, T4
  - **Blocked By**: None

  **References**:
  - `src/components/common/CardListItem.vue:14-53` — current slot layout

  **Acceptance Criteria**:
  - [ ] `npm run type-check` passes after change
  - [ ] `#topRight` slot renders content to the right of title
  - [ ] Existing cards without `#topRight` still render correctly (default empty div)

  **QA Scenarios**:

  ```
  Scenario: CardListItem renders topRight slot correctly
    Tool: Bash (build check)
    Preconditions: Code modified
    Steps:
      1. Run `npm run type-check`
      2. Verify no errors
    Expected Result: `vue-tsc --build` exits with code 0
    Evidence: .sisyphus/evidence/task-1-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(ui): add topRight slot to CardListItem`
  - Files: `src/components/common/CardListItem.vue`

- [x] 2. `OrderCard.vue` — move status badge to `#topRight`

  **What to do**:
  - Move the status `<span>` from `#bottomRight` to a new `#topRight` template
  - `#bottomRight` should become empty (or remove the template entirely)

  **Must NOT do**:
  - Do NOT change the status badge styling
  - Do NOT add/remove any props

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T1)
  - **Blocked By**: T1

  **References**:
  - `src/components/common/OrderCard.vue:64-73` — current bottomRight with status

  **Acceptance Criteria**:
  - [ ] Status badge renders in `#topRight`
  - [ ] `#bottomRight` no longer contains status
  - [ ] `npm run type-check` passes

  **QA Scenarios**:

  ```
  Scenario: OrderCard shows status in top-right
    Tool: Playwright
    Preconditions: Dev server running (`npm run dev`)
    Steps:
      1. Navigate to profile orders page
      2. Inspect first order card
      3. Assert status badge is positioned to the right of title
    Expected Result: Status badge visible in top-right area of card
    Failure Indicators: Badge still in bottom-right
    Evidence: .sisyphus/evidence/task-2-order-card.png
  ```

  **Commit**: YES (grouped with T1)

- [x] 3. `TicketCard.vue` — move status to `#topRight`, keep button in `#bottomRight`

  **What to do**:
  - Extract the status `<span>` from `#bottomRight` into a new `#topRight` template
  - Keep the `Button` in `#bottomRight`
  - If `#bottomRight` only contains the button, ensure layout is correct

  **Must NOT do**:
  - Do NOT move the button to `#topRight`
  - Do NOT change button behavior

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T1)
  - **Blocked By**: T1

  **References**:
  - `src/components/common/TicketCard.vue:58-69` — current bottomRight with status + button

  **Acceptance Criteria**:
  - [ ] Status badge in `#topRight`
  - [ ] Button remains in `#bottomRight`
  - [ ] `npm run type-check` passes

  **QA Scenarios**:

  ```
  Scenario: TicketCard shows status top-right and button bottom-right
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to profile tickets page
      2. Inspect ticket card
      3. Assert status badge is top-right
      4. Assert button (if showButton=true) is bottom-right
    Expected Result: Status top-right, button bottom-right
    Evidence: .sisyphus/evidence/task-3-ticket-card.png
  ```

  **Commit**: YES (grouped with T1)

- [x] 4. `ProfileWorkOrdersSection.vue` — move status to `#topRight`

  **What to do**:
  - Move the status `<span>` from `#bottomRight` to a new `#topRight` template inside `CardListItem`
  - `#bottomRight` should become empty

  **Must NOT do**:
  - Do NOT change status badge styling
  - Do NOT affect other card templates in the same file

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T1)
  - **Blocked By**: T1

  **References**:
  - `src/components/features/profile/ProfileWorkOrdersSection.vue:85-90` — current bottomRight with status

  **Acceptance Criteria**:
  - [ ] Status badge renders in `#topRight` of work order cards
  - [ ] `npm run type-check` passes

  **QA Scenarios**:

  ```
  Scenario: WorkOrder card shows status in top-right
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to profile work orders page
      2. Inspect work order card
      3. Assert status badge is top-right
    Expected Result: Badge positioned next to title
    Evidence: .sisyphus/evidence/task-4-workorder-card.png
  ```

  **Commit**: YES (grouped with T1)

- [x] 5. Final type-check and regression test

  **What to do**:
  - Run `npm run type-check`
  - Visually verify EventCard and ProfilePassengersSection are unchanged

  **Must NOT do**:
  - Do NOT modify EventCard or ProfilePassengersSection

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `vue-best-practices`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T2, T3, T4)
  - **Blocked By**: T2, T3, T4

  **Acceptance Criteria**:
  - [ ] `npm run type-check` passes
  - [ ] No TypeScript errors in any modified file

  **QA Scenarios**:

  ```
  Scenario: Full type-check passes
    Tool: Bash
    Steps:
      1. Run `npm run type-check`
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-5-typecheck.txt
  ```

  **Commit**: NO (no new changes — verification only)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE.

- [x] F1. **Plan Compliance Audit** — `oracle`
      Read plan and verify all 4 files were modified correctly. Check that EventCard and ProfilePassengersSection were NOT touched.
      Output: `Files [4/4] | Untouched [2/2] | VERDICT`

- [x] F2. **Code Quality Review** — `unspecified-high`
      Run `npm run type-check`. Check for any `any` usage or lint errors.
      Output: `Build [PASS/FAIL] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
      Open browser, navigate to profile pages, screenshot cards. Verify status positions.
      Output: `Screenshots [N] | Positions [correct/incorrect] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
      Verify only status labels moved, buttons stayed. No business logic changed.
      Output: `Logic Changes [0/N] | VERDICT`

---

## Commit Strategy

- **1**: `feat(ui): unify card status position to top-right`
  - Files: `src/components/common/CardListItem.vue`, `src/components/common/OrderCard.vue`, `src/components/common/TicketCard.vue`, `src/components/features/profile/ProfileWorkOrdersSection.vue`
  - Pre-commit: `npm run type-check`

---

## Success Criteria

### Verification Commands

```bash
npm run type-check  # Expected: success
```

### Final Checklist

- [ ] All status badges appear in top-right
- [ ] All interactive buttons remain in bottom-right
- [ ] EventCard and ProfilePassengersSection unchanged
- [ ] `npm run type-check` passes
- [ ] No visual regressions
