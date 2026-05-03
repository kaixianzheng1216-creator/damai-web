# Learnings - architecture-fixes

## 2026-05-03: format.ts test suite

- Created `src/utils/__tests__/format.test.ts` with 29 test cases covering all 7 functions
- All tests pass, zero LSP diagnostics
- Test pattern: use `describe` per function, `it` per case, real dayjs (no mocking)
- Key edge cases tested: null/undefined inputs, negative prices, same-day vs different-day date ranges, custom fallback strings, Date object inputs
