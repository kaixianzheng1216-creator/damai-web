# Learnings: remove-useProfilePage

## Pattern: Pass-through aggregator removal

- `useProfilePage.ts` was a 139-line aggregator that called 6 sub-composables and re-exported ~80 properties as flat returns
- The aggregator existed solely to reduce the number of props passed to children (via provide/inject)
- Removing it required understanding which child components need which sub-composable state

## Composable state sharing constraint

- `ProfileDialogs.vue` and `ProfileSectionContent.vue` both need `usePassengerManagement` and `useWorkOrderList` state
- These composables create local refs (showPassengerModal, passengerForm, etc.) that must be shared between components
- TanStack Query deduplication handles HTTP request dedup, but local reactive state is NOT shared across composable instances
- Therefore: composable calls must stay in the parent (`ProfileView.vue`) and results passed as props

## ESLint vue/no-mutating-props with composable objects

- When passing composable return objects as props, child components may mutate nested refs/properties
- `vue/no-mutating-props` flags this as violations (v-model on nested prop properties, .value assignment)
- These are intentional mutations on shared state containers, not accidental prop mutations
- Solution: `<!-- eslint-disable vue/no-mutating-props -->` block-level comments around affected template sections

## Template comments with ESLint

- `<!-- eslint-disable-next-line -->` between sibling template elements breaks Vue template parsing (v-else-if chains)
- Must use `<!-- eslint-disable -->` / `<!-- eslint-enable -->` block comments instead
