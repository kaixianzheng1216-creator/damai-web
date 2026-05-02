# Auto-Import Catalog

This document lists all APIs that are automatically imported by [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) and all components that are automatically registered by [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components). You do **not** need to write `import` statements for these in `.vue` files or `.ts` files inside `src/`.

> The authoritative generated declaration is at `src/types/auto-imports.d.ts` (for APIs) and `src/types/components.d.ts` (for components).

---

## Table of Contents

- [1. Automatically Imported APIs](#1-automatically-imported-apis)
  - [Vue](#vue)
  - [Vue Router](#vue-router)
  - [Pinia](#pinia)
  - [TanStack Vue Query](#tanstack-vue-query)
  - [VueUse](#vueuse)
  - [Project Utilities (`src/utils/`)](#project-utilities-srcutils)
  - [Third-Party Utilities](#third-party-utilities)
  - [Zod](#zod)
- [2. Auto-Imported Directories](#2-auto-imported-directories)
- [3. Auto-Registered Components](#3-auto-registered-components)
- [4. What Still Needs Manual Import](#4-what-still-needs-manual-import)

---

## 1. Automatically Imported APIs

### Vue

All exports from `vue` are auto-imported. Commonly used ones include:

| API                                                                                                                      | Purpose                          |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `ref` / `shallowRef`                                                                                                     | Create reactive refs             |
| `reactive` / `shallowReactive`                                                                                           | Create reactive objects          |
| `computed`                                                                                                               | Create computed refs             |
| `watch` / `watchEffect` / `watchPostEffect` / `watchSyncEffect`                                                          | Watch reactive dependencies      |
| `onMounted` / `onUnmounted` / `onBeforeMount` / `onBeforeUnmount` / `onUpdated` / `onBeforeUpdate`                       | Lifecycle hooks                  |
| `onActivated` / `onDeactivated`                                                                                          | KeepAlive lifecycle hooks        |
| `onErrorCaptured` / `onScopeDispose` / `onRenderTracked` / `onRenderTriggered` / `onServerPrefetch` / `onWatcherCleanup` | Advanced lifecycle / debug hooks |
| `provide` / `inject`                                                                                                     | Dependency injection             |
| `toRef` / `toRefs` / `toValue` / `toRaw`                                                                                 | Reactivity utilities             |
| `markRaw` / `readonly`                                                                                                   | Advanced reactivity control      |
| `isRef` / `isReactive` / `isProxy` / `isReadonly` / `isShallow`                                                          | Type checks                      |
| `nextTick`                                                                                                               | DOM update flush                 |
| `h` / `resolveComponent`                                                                                                 | Render utilities                 |
| `defineComponent` / `defineAsyncComponent`                                                                               | Component definition             |
| `useAttrs` / `useSlots` / `useCssModule` / `useCssVars` / `useId` / `useModel` / `useTemplateRef`                        | Component instance utilities     |
| `getCurrentInstance` / `getCurrentScope` / `getCurrentWatcher`                                                           | Current context getters          |
| `effectScope` / `EffectScope`                                                                                            | Effect scope management          |
| `customRef` / `triggerRef`                                                                                               | Advanced refs                    |
| `unref`                                                                                                                  | Deref utility                    |

> **Full list**: see `src/types/auto-imports.d.ts` lines 8–337.

---

### Vue Router

All exports from `vue-router` are auto-imported:

| API                   | Purpose                    |
| --------------------- | -------------------------- |
| `useRoute`            | Access current route       |
| `useRouter`           | Access router instance     |
| `useLink`             | Programmatic link creation |
| `onBeforeRouteLeave`  | Guard before leaving route |
| `onBeforeRouteUpdate` | Guard before route update  |

---

### Pinia

All exports from `pinia` are auto-imported:

| API                                                                         | Purpose                   |
| --------------------------------------------------------------------------- | ------------------------- |
| `defineStore`                                                               | Define a Pinia store      |
| `storeToRefs`                                                               | Extract refs from a store |
| `createPinia`                                                               | Create Pinia instance     |
| `acceptHMRUpdate`                                                           | HMR support for stores    |
| `getActivePinia` / `setActivePinia`                                         | Active Pinia management   |
| `setMapStoreSuffix`                                                         | Store naming suffix       |
| `mapState` / `mapGetters` / `mapActions` / `mapStores` / `mapWritableState` | Options API helpers       |

---

### TanStack Vue Query

Selected exports from `@tanstack/vue-query` are auto-imported:

| API              | Purpose                         |
| ---------------- | ------------------------------- |
| `useQuery`       | Data fetching query             |
| `useMutation`    | Data mutation                   |
| `useQueryClient` | Access the QueryClient instance |

> Note: `useInfiniteQuery` is **not** currently configured in `vite.config.ts`. If you need it, add it to the `imports` array or import it manually.

---

### VueUse

All exports from `@vueuse/core` are auto-imported. This is a very large set (150+ APIs). Commonly used ones in this project include:

| API                                                                                                                                                                                                                                | Purpose                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `useStorage` / `useLocalStorage` / `useSessionStorage`                                                                                                                                                                             | Reactive local/session storage |
| `useEventListener`                                                                                                                                                                                                                 | Add DOM event listeners safely |
| `useDebounceFn` / `useThrottleFn`                                                                                                                                                                                                  | Debounce / throttle utilities  |
| `useDebounce` / `useThrottle`                                                                                                                                                                                                      | Debounced / throttled refs     |
| `useCountdown`                                                                                                                                                                                                                     | Countdown timer                |
| `useClipboard` / `useClipboardItems`                                                                                                                                                                                               | Clipboard access               |
| `useDark` / `useColorMode` / `usePreferredColorScheme` / `usePreferredDark`                                                                                                                                                        | Theme / color scheme           |
| `useDocumentVisibility` / `usePageLeave` / `useWindowFocus` / `useOnline` / `useNetwork`                                                                                                                                           | Browser state                  |
| `useFetch`                                                                                                                                                                                                                         | Reactive fetch wrapper         |
| `useIntersectionObserver` / `useMutationObserver` / `useResizeObserver` / `usePerformanceObserver`                                                                                                                                 | Observers                      |
| `useElementBounding` / `useElementSize` / `useElementHover` / `useElementVisibility`                                                                                                                                               | Element utilities              |
| `useMouse` / `useMouseInElement` / `useMousePressed`                                                                                                                                                                               | Mouse tracking                 |
| `useScroll` / `useWindowScroll` / `useScrollLock`                                                                                                                                                                                  | Scroll utilities               |
| `useFullscreen`                                                                                                                                                                                                                    | Fullscreen API                 |
| `useImage`                                                                                                                                                                                                                         | Image loading state            |
| `useMediaQuery`                                                                                                                                                                                                                    | CSS media query reactive       |
| `useBreakpoints`                                                                                                                                                                                                                   | Responsive breakpoints         |
| `useAnimate`                                                                                                                                                                                                                       | Web Animations API             |
| `useVirtualList`                                                                                                                                                                                                                   | Virtual scrolling              |
| `useInfiniteScroll`                                                                                                                                                                                                                | Infinite scroll                |
| `useDraggable` / `useDropZone`                                                                                                                                                                                                     | Drag & drop                    |
| `useFileDialog`                                                                                                                                                                                                                    | File picker                    |
| `useShare`                                                                                                                                                                                                                         | Web Share API                  |
| `useWebSocket` / `useWebWorker` / `useWebWorkerFn`                                                                                                                                                                                 | WebSocket / Web Worker         |
| `useTitle`                                                                                                                                                                                                                         | Document title                 |
| `useUrlSearchParams`                                                                                                                                                                                                               | URL search params              |
| `useNow` / `useDateFormat` / `useTimeAgo` / `useTimeAgoIntl`                                                                                                                                                                       | Time utilities                 |
| `useInterval` / `useIntervalFn` / `useTimeout` / `useTimeoutFn` / `useTimeoutPoll`                                                                                                                                                 | Timer utilities                |
| `useRafFn` / `useTimestamp` / `useTransition`                                                                                                                                                                                      | Animation utilities            |
| `useCounter` / `useToggle` / `useCycleList` / `useStepper`                                                                                                                                                                         | State utilities                |
| `useCloned`                                                                                                                                                                                                                        | Deep clone with reactivity     |
| `useMemoize`                                                                                                                                                                                                                       | Memoization                    |
| `useAsyncState` / `useAsyncQueue`                                                                                                                                                                                                  | Async state management         |
| `useArrayDifference` / `useArrayEvery` / `useArrayFilter` / `useArrayFind` / `useArrayFindIndex` / `useArrayFindLast` / `useArrayIncludes` / `useArrayJoin` / `useArrayMap` / `useArrayReduce` / `useArraySome` / `useArrayUnique` | Array utilities                |
| `watchArray` / `watchAtMost` / `watchDebounced` / `watchDeep` / `watchIgnorable` / `watchImmediate` / `watchOnce` / `watchPausable` / `watchThrottled` / `watchTriggerable` / `watchWithFilter`                                    | Watch utilities                |
| `ignorableWatch` / `pausableWatch` / `debouncedWatch` / `throttledWatch`                                                                                                                                                           | Watch variants                 |
| `whenever`                                                                                                                                                                                                                         | Conditional watcher            |
| `useConfirmDialog`                                                                                                                                                                                                                 | Confirm dialog composable      |
| `useVModel` / `useVModels`                                                                                                                                                                                                         | vModel helpers                 |
| `useCssVar` / `useStyleTag`                                                                                                                                                                                                        | CSS utilities                  |
| `useFocus` / `useFocusWithin`                                                                                                                                                                                                      | Focus management               |
| `useTextareaAutosize`                                                                                                                                                                                                              | Auto-resize textarea           |
| `useTextSelection`                                                                                                                                                                                                                 | Text selection tracking        |
| `useParallax`                                                                                                                                                                                                                      | Parallax effect                |
| `useFavicon`                                                                                                                                                                                                                       | Favicon manipulation           |
| `useGeolocation`                                                                                                                                                                                                                   | Geolocation API                |
| `useBattery` / `useDeviceMotion` / `useDeviceOrientation` / `useDevicePixelRatio` / `useDevicesList` / `useDisplayMedia` / `useUserMedia`                                                                                          | Device APIs                    |
| `useSpeechRecognition` / `useSpeechSynthesis`                                                                                                                                                                                      | Speech APIs                    |
| `useGamepad`                                                                                                                                                                                                                       | Gamepad API                    |
| `useBluetooth` / `useEyeDropper`                                                                                                                                                                                                   | Experimental APIs              |
| `usePermission`                                                                                                                                                                                                                    | Permissions API                |
| `useNavigatorLanguage` / `usePreferredLanguages` / `usePreferredContrast` / `usePreferredReducedMotion` / `usePreferredReducedTransparency`                                                                                        | Preference APIs                |
| `useBrowserLocation`                                                                                                                                                                                                               | Browser location               |
| `useBroadcastChannel`                                                                                                                                                                                                              | Broadcast Channel API          |
| `useEventBus`                                                                                                                                                                                                                      | Event bus                      |
| `useEventSource`                                                                                                                                                                                                                   | Server-Sent Events             |
| `usePointer` / `usePointerLock` / `usePointerSwipe`                                                                                                                                                                                | Pointer APIs                   |
| `useSwipe`                                                                                                                                                                                                                         | Touch swipe                    |
| `useKeyStroke` / `onKeyStroke` / `onClickOutside` / `onLongPress` / `onStartTyping` / `onElementRemoval`                                                                                                                           | DOM interaction hooks          |
| `useMounted` / `tryOnMounted` / `tryOnBeforeMount` / `tryOnBeforeUnmount` / `tryOnUnmounted` / `tryOnScopeDispose`                                                                                                                 | Safe lifecycle hooks           |
| `useSSRWidth`                                                                                                                                                                                                                      | SSR width                      |
| `useScreenOrientation` / `useScreenSafeArea`                                                                                                                                                                                       | Screen APIs                    |
| `useScriptTag`                                                                                                                                                                                                                     | Script injection               |
| `useBase64`                                                                                                                                                                                                                        | Base64 encoding                |
| `useObjectUrl`                                                                                                                                                                                                                     | Object URL                     |
| `useManualRefHistory` / `useDebouncedRefHistory` / `useThrottledRefHistory` / `useRefHistory`                                                                                                                                      | Ref history                    |
| `useOffsetPagination`                                                                                                                                                                                                              | Offset pagination              |
| `useSorted`                                                                                                                                                                                                                        | Sorting                        |
| `useToNumber` / `useToString`                                                                                                                                                                                                      | Type conversion                |
| `useSupported`                                                                                                                                                                                                                     | Feature detection              |
| `useCurrentElement` / `useParentElement` / `useActiveElement`                                                                                                                                                                      | Element refs                   |
| `useMagicKeys`                                                                                                                                                                                                                     | Keyboard shortcuts             |
| `useFps`                                                                                                                                                                                                                           | FPS meter                      |
| `useMemory`                                                                                                                                                                                                                        | Memory info                    |
| `useIdle`                                                                                                                                                                                                                          | Idle detection                 |
| `useWakeLock`                                                                                                                                                                                                                      | Wake Lock API                  |
| `useWebNotification`                                                                                                                                                                                                               | Web Notifications              |
| `useVibrate`                                                                                                                                                                                                                       | Vibration API                  |
| `useFetch`                                                                                                                                                                                                                         | Reactive fetch                 |
| `useFileSystemAccess`                                                                                                                                                                                                              | File System Access API         |
| `createGlobalState` / `createInjectionState` / `createSharedComposable` / `createReusableTemplate` / `createTemplatePromise` / `createEventHook` / `createReactiveFn` / `createRef` / `createUnrefFn`                              | Factory utilities              |
| `injectLocal` / `provideLocal`                                                                                                                                                                                                     | Local provide/inject           |
| `reactify` / `reactifyObject`                                                                                                                                                                                                      | Reactify utilities             |
| `reactiveComputed` / `reactiveOmit` / `reactivePick`                                                                                                                                                                               | Reactive object utilities      |
| `controlledComputed` / `controlledRef` / `computedWithControl` / `eagerComputed` / `computedAsync` / `computedEager` / `computedInject`                                                                                            | Computed variants              |
| `refAutoReset` / `refDebounced` / `refDefault` / `refManualReset` / `refThrottled` / `refWithControl` / `debouncedRef` / `throttledRef` / `autoResetRef` / `extendRef` / `resolveRef` / `syncRef` / `syncRefs` / `templateRef`     | Ref utilities                  |
| `toReactive`                                                                                                                                                                                                                       | toReactive                     |
| `until`                                                                                                                                                                                                                            | Promise-based watcher          |
| `makeDestructurable`                                                                                                                                                                                                               | Destructurable objects         |

> **Full list**: see `src/types/auto-imports.d.ts` lines 8–337.

---

### Project Utilities (`src/utils/`)

Everything exported from files under `src/utils/` is auto-imported because `dirs: ['src/utils', 'src/composables']` is configured in `vite.config.ts`.

#### `src/utils/index.ts`

| API  | Purpose                                               |
| ---- | ----------------------------------------------------- |
| `cn` | Merge Tailwind classes with `clsx` + `tailwind-merge` |

#### `src/utils/format.ts`

| API                            | Purpose                           |
| ------------------------------ | --------------------------------- |
| `formatDate`                   | Date formatting                   |
| `formatDateTime`               | DateTime formatting               |
| `formatDateTimeLocalInput`     | Format for `datetime-local` input |
| `formatDateTimeRange`          | DateTime range formatting         |
| `formatDateTimeWithWeekday`    | DateTime with weekday             |
| `formatDateTimeWithoutWeekday` | DateTime without weekday          |
| `formatPrice`                  | Price formatting                  |
| `formatPriceRange`             | Price range formatting            |

#### `src/utils/mappers.ts`

| API                           | Purpose                          |
| ----------------------------- | -------------------------------- |
| `convertCategoryVOToHomeItem` | Convert category VO to home item |
| `convertEventVOToCardItem`    | Convert event VO to card item    |
| `mapPassengerToPassengerItem` | Map passenger to passenger item  |

#### `src/utils/statusMappers.ts`

| API                            | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `mapOrderStatus`               | Map order status                      |
| `getOrderStatusBadgeClass`     | Get order status badge CSS class      |
| `getTicketStatusClass`         | Get ticket status CSS class           |
| `getWorkOrderStatusBadgeClass` | Get work order status badge CSS class |

#### `src/utils/aiChatPrompt.ts`

| API                 | Purpose              |
| ------------------- | -------------------- |
| `buildAIChatPrompt` | Build AI chat prompt |

---

### Third-Party Utilities

| API       | Source           | Purpose                                  |
| --------- | ---------------- | ---------------------------------------- |
| `clsx`    | `clsx`           | Conditional class names                  |
| `twMerge` | `tailwind-merge` | Merge Tailwind classes without conflicts |

---

### Zod

| API | Source | Purpose                   |
| --- | ------ | ------------------------- |
| `z` | `zod`  | Schema validation builder |

---

## 2. Auto-Imported Directories

The following directories are scanned by `unplugin-auto-import` for exported functions/composables. **Any `export function` or `export const` from these directories is globally available without import.**

| Directory          | Type        | Notes                                                                                                                                    |
| ------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/`       | Utilities   | Helper functions, formatters, mappers                                                                                                    |
| `src/composables/` | Composables | All composables including subdirectories (`admin/`, `auth/`, `common/`, `event/`, `home/`, `profile/`, `ticket/`, `trade/`, `ai/`, etc.) |

> Because composables are deeply nested, the generated `auto-imports.d.ts` only explicitly declares the ones that have been actually used in the codebase so far (e.g. `useAIChat`, `useViewMode`). New composables added to these directories will be picked up automatically on the next dev server start or build.

---

## 3. Auto-Registered Components

The following directories are scanned by `unplugin-vue-components` for Vue components. **Any `.vue` file in these directories is globally available without import.**

| Directory                   | Scope                                                           |
| --------------------------- | --------------------------------------------------------------- |
| `src/components/common/ui/` | shadcn-vue base components (Button, Input, Dialog, Table, etc.) |
| `src/components/admin/`     | Admin-specific components                                       |
| `src/components/features/`  | Feature-specific business components                            |

### Icons

Lucide icons are auto-registered via `IconsResolver` with the prefix `icon`. Usage example:

```vue
<icon-lucide-loader2 />
<icon-lucide-check />
```

The icon name is the kebab-case Lucide icon name prefixed with `icon-lucide-`.

---

## 4. What Still Needs Manual Import

The following **must** still be imported explicitly:

| Item                                                                                                | Reason                                                                                                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Components outside `src/components/common/ui/`, `src/components/admin/`, `src/components/features/` | Not in `unplugin-vue-components` `dirs`                                                                                  |
| Types / Interfaces / Type aliases                                                                   | TypeScript types are erased at runtime; auto-import handles values only                                                  |
| Anything from `src/api/`                                                                            | API layer is not in auto-import dirs                                                                                     |
| Anything from `src/stores/`                                                                         | Pinia stores are not in auto-import dirs                                                                                 |
| Anything from `src/router/`                                                                         | Router config is not in auto-import dirs                                                                                 |
| Anything from `src/views/`                                                                          | Views are not in auto-import dirs                                                                                        |
| Third-party libraries not listed above                                                              | Only `vue`, `vue-router`, `pinia`, `@vueuse/core`, `@tanstack/vue-query`, `zod`, `clsx`, `tailwind-merge` are configured |
| `axios`                                                                                             | Not configured                                                                                                           |
| `vue3-toastify`                                                                                     | Not configured                                                                                                           |
| `@vueuse/integrations`                                                                              | Not configured                                                                                                           |

---

## Configuration Reference

The auto-import setup is in `vite.config.ts`:

```ts
AutoImport({
  imports: [
    'vue',
    'vue-router',
    'pinia',
    '@vueuse/core',
    { '@tanstack/vue-query': ['useQuery', 'useMutation', 'useQueryClient'] },
    { zod: ['z'], clsx: ['clsx'], 'tailwind-merge': ['twMerge'] },
  ],
  dirs: ['src/utils', 'src/composables'],
  dts: 'src/types/auto-imports.d.ts',
  vueTemplate: true,
}),
Components({
  dirs: ['src/components/common/ui', 'src/components/admin', 'src/components/features'],
  resolvers: [IconsResolver({ prefix: 'icon' })],
  dts: 'src/types/components.d.ts',
}),
```
