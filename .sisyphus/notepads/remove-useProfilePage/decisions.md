# Decisions: remove-useProfilePage

## Decision 1: Keep composable calls in ProfileView, pass as props

**Context**: `ProfileSectionContent` and `ProfileDialogs` share state from `usePassengerManagement` and `useWorkOrderList`. Moving composable calls into children would create separate instances with separate local state.
**Decision**: Call all sub-composables in `ProfileView.vue` (replicating the enabled computed pattern from useProfilePage). Pass composable return objects as typed props to children.
**Rationale**: Maintains shared mutable state between dialog and content components without introducing a new abstraction (provide/inject or event bus).

## Decision 2: Pass composable objects wholesale instead of individual properties

**Context**: Defining 80+ individual props for each child would be verbose and brittle.
**Decision**: Pass entire composable return objects as props, typed with `ReturnType<typeof composable>`.
**Rationale**: Each child destructures only what it needs. Type safety is preserved. Changes to composable signatures don't require prop definition updates.

## Decision 3: eslint-disable for intentional prop mutations

**Context**: Children use `v-model` on nested composable properties and direct `.value` assignments. ESLint `vue/no-mutating-props` flags these.
**Decision**: Add block-level `eslint-disable vue/no-mutating-props` around entire template content in affected components.
**Rationale**: These are intentional mutations on shared mutable state containers, not accidental prop mutations. Restructuring to pure props+emits would require significant changes to deep child components (ProfileInfoSection, ProfileOrdersSection, etc.) which is out of scope.
