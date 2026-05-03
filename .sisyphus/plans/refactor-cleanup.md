# damai-web 清理重构计划

## TL;DR（概要）

**目标**：清理 Vibe Coding 遗留的死代码、提取重复模式为可复用组件、统一代码风格与命名约定。

**交付物**：

- 删除 ~13 个死文件/导出
- 提取 `LoadingState` 组件统一加载态
- 将 `ConfirmDialog` 嵌入 `DataTableCrud`（消除 11 处重复模板）
- 统一 11 个 API 文件的导入路径为 `@/` 别名
- 迁移 2 个手写的 CRUD composable 到 `useAdminCrud`
- 修复 `RichTextEditor` 的硬编码颜色和 CSS 重复
- 更新 `AGENTS.md` 消除 5 处与代码不符的描述

**预估工作量**：Medium（约 29 个任务，分 6 个波次）
**并行执行**：YES — 4 个并行波次 + 2 个验证波次
**关键路径**：Wave 1 安全删除 → Wave 2 风格修复 → Wave 3 组件提取 → Wave 4 CRUD 统一 → Wave 5 文档修正 → Wave 6 验证

---

## 上下文

### 原始需求

项目由纯 Vibe Coding 实现，需要提升可维护性：

- 清理无用代码
- 提取可复用组件
- 代码风格更加统一优雅

### 审计发现摘要

通过 6 组并行探索代理对代码库进行了全面审计：

**死代码**：11 个文件/导出确认无任何导入（EmptyLayout、chart 模块、模板文件、死别名、死常量）
**重复模式**：ConfirmDialog 在 11 个 admin 视图中完全重复；5 个前端视图复制粘贴 loading spinner；RichTextEditor CSS 被 EventDetailView 复制
**风格不一致**：11 个 API 文件混用相对路径 `../../types`；硬编码中文字符串分散在 composables 中；硬编码 hex 颜色；`closeXxx` 命名 vs 项目约定的 `cancelXxx`
**文档偏差**：AGENTS.md 中 5 处描述与代码不符

### 用户决策

- 全部一起做
- 由我判断范围
- 接受文件移动/重命名（功能不变）

---

## 工作目标

### 核心目标

消除 Vibe Coding 遗留的维护负担，建立统一的代码基线，使后续开发更可持续。

### 具体交付物

- 删除所有死代码（文件 + 导出 + CSS 变量）
- 提取 `LoadingState` 组件
- 将 `ConfirmDialog` 集成到 `DataTableCrud`
- 统一 API 导入为 `@/` 别名
- 迁移 `useAdminListPage` + `useNoticeListPage` 到 `useAdminCrud`
- 修复硬编码颜色和 CSS 重复
- 修正 AGENTS.md inaccuracies
- 所有 CI 检查通过（`npm run ci`）

### 完成标准

- [ ] `npm run ci` 完整通过（type-check → lint → audit → openapi → test → format → build）
- [ ] 零死代码残留（通过工具扫描确认）
- [ ] 零新增 lint/类型错误
- [ ] 所有测试通过

### Must Have（必须达成）

- 功能行为零变化（纯重构）
- 所有 CI 门禁通过
- 测试覆盖率不下降

### Must NOT Have（禁区）

- 不修改 API 契约（不增删改接口调用）
- 不修改路由结构
- 不修改状态管理核心逻辑
- 不引入新的运行时依赖
- 不修改 shadcn-vue UI 组件（`src/components/common/ui/**` 为禁区）
- 不修改 OpenAPI 文档文件

---

## 验证策略

### 测试决策

- **测试基础设施存在**：YES（Vitest + @vue/test-utils + happy-dom）
- **自动化测试**：YES（Tests-after 模式——重构后确保现有测试通过）
- **测试框架**：Vitest（内嵌于 vite.config.ts）
- **测试策略**：每个重构任务完成后运行相关测试；最终运行 `npm run ci`

### QA 策略

每个任务 MUST 包含 agent-executed QA scenarios。

- **前端/UI**：Playwright 打开浏览器验证页面加载、交互正常
- **API/模块**：Bash（curl/bun REPL）验证导入、函数调用正常
- **构建**：`npm run ci` 作为最终验证

---

## 执行策略

### 并行执行波次

```
Wave 1（安全删除 - 无依赖，全部可并行）:
├── T1: 删除 EmptyLayout.vue
├── T2: 删除 _templates/ 目录
├── T3: 删除 chart/ 模块
├── T4: 删除 search/types.ts + useAIChat.ts shim
├── T5: 移除死导出（format.ts + copy.ts）
├── T6: 清理未使用的 CSS 变量
└── T7: 修复 API 相对导入 → @/ 别名

Wave 2（风格修复 - 与 Wave 1 并行，无依赖）:
├── T8: 修复 RichTextEditor 硬编码颜色
├── T9: 提取共享 rich-text CSS 模块
├── T10: 将 composable 中的硬编码中文字符串移入 constants/copy.ts
├── T11: 修复类型定义（status/isFeatured 为 union 类型）
├── T12: 修复空 catch 块
├── T13: 重命名 useConfirmDialog → useAppConfirmDialog
└── T14: 规范化 closeXxx → cancelXxx 命名

Wave 3（组件提取 - 依赖 Wave 1）:
├── T15: 提取 LoadingState 组件
├── T16: 将 ConfirmDialog 嵌入 DataTableCrud
└── T17: 更新所有视图引用

Wave 4（CRUD 统一 - 依赖 Wave 1）:
├── T18: 重构 useAdminListPage → useAdminCrud
├── T19: 重构 useNoticeListPage → useAdminCrud
└── T20: 清理空 handleDelete stub

Wave 5（文档与配置 - 依赖 Wave 2）:
├── T21: 更新 AGENTS.md 修正 5 处偏差
├── T22: 修复 ESLint 引用（docs/ui-guidelines.md）
├── T23: 添加 VITE_WS_URL 到 env.d.ts
└── T24: 记录 useDialog.withLoading 和 useAdminCrud 模式

Wave 6（最终验证 - 依赖所有前置波次）:
├── T25: 运行 npm run type-check
├── T26: 运行 npm run lint:check + lint:oxlint
├── T27: 运行 npm run test
├── T28: 运行 npm run ci（完整门禁）
└── T29: 死代码扫描复查
```

### 依赖矩阵

| 任务    | 依赖    | 阻塞    |
| ------- | ------- | ------- |
| T1-T7   | 无      | T15-T20 |
| T8-T14  | 无      | T21-T24 |
| T15-T17 | T1-T7   | T25-T29 |
| T18-T20 | T1-T7   | T25-T29 |
| T21-T24 | T8-T14  | T25-T29 |
| T25-T29 | T15-T24 | 无      |

---

## TODOs（任务列表）

- [ ] 1. 删除 `src/layouts/EmptyLayout.vue`

  **做什么**：删除该文件。它在整个项目中零引用。Router 直接内联引用 LoginView/NotFound，不使用任何 layout 包裹。

  **禁止做什么**：不修改 router 配置。不修改其他 layout 文件。

  **推荐 Agent 配置**：Category: `quick`，Skills: [`vue-best-practices`]

  **并行化**：可与 Wave 1 其他任务并行。不阻塞其他任务。

  **参考资料**：`src/layouts/EmptyLayout.vue`（死文件），`src/router/index.ts`（确认未使用）

  **验收标准**：
  - [ ] 文件不存在
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：删除后无编译错误
    工具：Bash
    步骤：1. 删除文件 2. npm run type-check
    预期结果：0 errors, 0 warnings
    证据：.sisyphus/evidence/task-1-type-check.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(layouts): remove unused EmptyLayout.vue`
  - 涉及文件：`src/layouts/EmptyLayout.vue`

- [ ] 2. 删除 `src/components/_templates/` 目录

  **做什么**：删除 `DialogTemplate.vue` 和 `FormDialogTemplate.vue`。这些是参考模板，从未被生产代码导入。实际使用的是 `AdminFormDialog.vue`。

  **禁止做什么**：不修改 `AdminFormDialog.vue`。不修改任何引用 `_templates` 的代码（无引用）。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 1 其他任务并行。

  **验收标准**：
  - [ ] `_templates/` 目录不存在
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：删除模板目录后编译正常
    工具：Bash
    步骤：1. 删除目录 2. npm run type-check
    预期结果：0 errors
    证据：.sisyphus/evidence/task-2-type-check.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(components): remove stale template files`

- [ ] 3. 删除 `src/components/common/ui/chart/` 整个模块

  **做什么**：删除 chart/ 目录下所有 6 个文件（ChartContainer.vue, ChartLegendContent.vue, ChartStyle.vue, ChartTooltipContent.vue, index.ts, utils.ts）。业务代码零引用。同时从 `index.css` 中删除 chart 相关的 `@theme` 颜色变量。

  **禁止做什么**：不修改其他 UI 组件。不修改业务代码。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 1 其他任务并行。

  **验收标准**：
  - [ ] `chart/` 目录不存在
  - [ ] `components.d.ts` 自动更新
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：chart 模块删除后无编译错误
    工具：Bash
    步骤：1. 删除目录 2. npm run type-check
    预期结果：0 errors
    证据：.sisyphus/evidence/task-3-type-check.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(ui): remove unused chart module`

- [ ] 4. 删除死类型文件和无用 shim

  **做什么**：删除 `src/components/features/search/types.ts`（SearchOption 从未导入）。删除 `src/composables/useAIChat.ts`（只是 `export * from './ai/useAIChat'` 的 shim）。检查是否有其他文件导入 shim 路径，改为导入 `@/composables/ai/useAIChat`。

  **禁止做什么**：不删除 `src/composables/ai/useAIChat.ts`（真正的实现）。不修改搜索功能组件。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 1 其他任务并行。

  **验收标准**：
  - [ ] `search/types.ts` 不存在
  - [ ] `useAIChat.ts` shim 不存在
  - [ ] 无残留引用
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：shim 删除后引用正常
    工具：Bash
    步骤：1. 搜索旧导入路径 2. npm run type-check
    预期结果：无残留引用，0 errors
    证据：.sisyphus/evidence/task-4-shim-cleanup.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor: remove dead types and AIChat shim`

- [ ] 5. 移除死导出

  **做什么**：在 `src/utils/format.ts` 中删除 `formatDateTimeWithoutWeekday` 别名（第33行，是 `formatDateTime` 的别名，从未导入）。在 `src/constants/copy.ts` 中删除 `COMMON_COPY` 导出（第86行，从未被导入）。`auto-imports.d.ts` 会自动更新。

  **禁止做什么**：不删除 `FORM_COPY`（在 composables 中使用）。不删除 `formatDateTime`（广泛使用）。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 1 其他任务并行。

  **验收标准**：
  - [ ] `formatDateTimeWithoutWeekday` 已移除
  - [ ] `COMMON_COPY` 已移除
  - [ ] 无残留引用
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：死导出移除后无编译错误
    工具：Bash
    步骤：1. 搜索被移除的导出 2. npm run type-check
    预期结果：Clean，0 errors
    证据：.sisyphus/evidence/task-5-dead-exports.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor: remove dead exports`

- [ ] 6. 清理未使用的 CSS 变量

  **做什么**：在 `src/styles/index.css` 中删除 chart 相关的 `@theme` 变量：`--color-chart-1` 到 `--color-chart-5`（light 主题约第75-83行）及其 dark 主题对应（约第148-157行和第214-222行）。这些仅被已删除的 chart 模块使用。

  **禁止做什么**：不删除其他 `@theme` 变量（radius、layout-height、shadcn 颜色令牌）。不删除自定义 utilities（flex-center、text-muted-sm、section-card、section-card-muted、scrollbar-hide）。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 1 其他任务并行。

  **验收标准**：
  - [ ] Chart 颜色变量已移除
  - [ ] 其他主题变量保持完整
  - [ ] `npm run type-check` 通过
  - [ ] `npm run build` 成功

  **QA 场景**：

  ```
  场景：CSS 清理无样式回退
    工具：Bash
    步骤：1. 编辑 index.css 2. npm run type-check 3. npm run build
    预期结果：Build 成功
    证据：.sisyphus/evidence/task-6-css-cleanup.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(styles): remove unused chart theme variables`

- [ ] 7. 修复 API 相对导入为 `@/` 别名

  **做什么**：在 11 个 API 文件中，将 `../../types` 改为 `@/api/types`。受影响文件：`src/api/account/admin.ts`、`passenger.ts`、`user.ts`；`src/api/event/category.ts`、`city.ts`、`event.ts`、`series.ts`、`venue.ts`；`src/api/trade/order.ts`、`workOrder.ts`；`src/api/trade/types.ts`（`../types`）。

  **禁止做什么**：不修改测试文件中的相对路径（测试中相对路径是惯例）。不修改其他模块的导入。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 1 其他任务并行。

  **验收标准**：
  - [ ] 11 个文件使用 `@/api/types`
  - [ ] `src/api/` 中无 `../../types` 相对导入
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：导入路径统一
    工具：Bash
    步骤：1. 搜索 `../../types` 2. npm run type-check
    预期结果：Clean，0 errors
    证据：.sisyphus/evidence/task-7-import-alias.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(api): unify imports to @/ alias`

- [ ] 8. 修复 RichTextEditor 硬编码颜色

  **做什么**：在 `src/components/common/RichTextEditor.vue` 中，将 style 块中的硬编码 hex 颜色转换为 Tailwind utility class 或 CSS 变量。涉及行：194（`#6b7280`）、203-204（`rgba(0,0,0,0.07)` / `#111827`）、211-212、217（`#e5e7eb`）、265（`#9ca3af`）。使用 `text-gray-500`、`bg-black/5`、`text-gray-900`、`bg-gray-200`、`text-gray-400` 或等效的 CSS 变量。

  **禁止做什么**：不修改编辑器功能。不修改 tiptap 配置。不删除 style 块（tiptap 内容渲染需要自定义 CSS）。

  **推荐 Agent 配置**：Category: `visual-engineering`，Skills: [`shadcn-vue`]

  **并行化**：可与 Wave 2 其他任务并行。

  **验收标准**：
  - [ ] RichTextEditor.vue style 块中无 hex 颜色字面量
  - [ ] 编辑器渲染效果一致
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：编辑器颜色使用 Tailwind/utilities
    工具：Bash
    步骤：1. 搜索 style 块中的 #hex 2. npm run type-check
    预期结果：无 hex 发现，0 errors
    证据：.sisyphus/evidence/task-8-editor-colors.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(components): replace hard-coded colors with Tailwind utilities`

- [ ] 9. 提取共享 rich-text CSS 模块

  **做什么**：`EventDetailView.vue` 第164-205行复制了 `RichTextEditor.vue` 的 CSS（两者都样式化 `.rich-text-content` / `.tiptap-editor` 且规则相同）。将这段 CSS 提取到共享位置：新建 `src/styles/rich-text.css` 并被两者导入，或在 `index.css` 中添加全局 utility class。

  **禁止做什么**：不修改渲染输出。不修改任一组件的 HTML 结构。

  **推荐 Agent 配置**：Category: `visual-engineering`

  **并行化**：可与 Wave 2 其他任务并行。

  **验收标准**：
  - [ ] CSS 提取到共享位置
  - [ ] RichTextEditor 和 EventDetailView 都使用它
  - [ ] 无重复 CSS 规则
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：共享 CSS 模块对两个组件都有效
    工具：Bash
    步骤：1. 提取 CSS 2. 更新导入 3. npm run type-check 4. npm run build
    预期结果：Build 成功，无重复 CSS
    证据：.sisyphus/evidence/task-9-shared-css.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(styles): extract shared rich-text CSS module`

- [ ] 10. 将 composable 中的硬编码中文字符串移入 `constants/copy.ts`

  **做什么**：从 composables 中提取硬编码中文字符串到 `src/constants/copy.ts`。受影响文件和字符串：
  - `useAdminCrud.ts` 第74行：`'编辑'` / `'新建'`
  - `useAdminCrud.ts` 第146行：`'确认删除'` / `'确认删除该项目？'`
  - `useEventParticipantsTab.ts` 第112行：confirm 字符串
  - `useEventServicesTab.ts` 第130行：confirm 字符串
  - `useSessionList.ts` 第140行：confirm 字符串
  - `useSessionsAndTicketsTab.ts` 第65行：confirm 字符串
  - `useTicketTypeDialog.ts` 第36行：`'编辑票种'` / `'新建票种'`
  - `useAIChat.ts` 第27行：欢迎消息

  **禁止做什么**：不修改实际显示的文本内容。不修改已在使用的 copy.ts 字符串。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 2 其他任务并行。

  **验收标准**：
  - [ ] 所有识别字符串已移至 copy.ts
  - [ ] Composables 从 copy.ts 导入
  - [ ] 受影响 composables 中无硬编码中文字符串
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：中文字符串集中管理
    工具：Bash
    步骤：1. 搜索受影响文件中的中文字符串 2. npm run type-check
    预期结果：字符串从 copy.ts 导入，0 errors
    证据：.sisyphus/evidence/task-10-strings.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(constants): centralize hard-coded Chinese strings`

- [ ] 11. 修复类型定义（status/isFeatured 为 union 类型）

  **做什么**：将原始 number 类型改为合适的 union 类型：
  - `src/api/account/admin.ts` 第26行：`status` 参数 `number` → `0 | 1` 或 `AdminStatus` union
  - `src/api/account/user.ts` 第20行：`status` 参数 `number` → `0 | 1` 或 `UserStatus` union
  - `src/api/event/city.ts` 第37行：`isFeatured` 参数 `number` → `0 | 1`
    检查是否已有对应常量（如 `BOOLEAN_TYPE` 或 status enum）并使用它们。

  **禁止做什么**：不修改 API 调用行为。不修改后端契约。不引入 `enum`（项目惯例使用 `as const` 或 union）。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 2 其他任务并行。

  **验收标准**：
  - [ ] `status` / `isFeatured` 使用 union 类型
  - [ ] 所有调用点仍可编译
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：Union 类型安全
    工具：Bash
    步骤：1. 更新类型 2. npm run type-check
    预期结果：0 errors
    证据：.sisyphus/evidence/task-11-type-unions.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(types): use union types for status flags`

- [ ] 12. 修复空 catch 块

  **做什么**：在 `src/composables/home/useHomePage.ts` 第91行，catch 块为空。添加 `console.error` 记录捕获的错误（ESLint 允许 `warn`/`error`；`console.log` 被禁止）。

  **禁止做什么**：不修改错误处理逻辑（仅添加日志）。不删除 catch 块。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 2 其他任务并行。

  **验收标准**：
  - [ ] catch 块包含 `console.error`
  - [ ] `npm run type-check` 通过
  - [ ] `npm run lint:check` 通过

  **QA 场景**：

  ```
  场景：空 catch 已修复
    工具：Bash
    步骤：1. 编辑文件 2. npm run lint:check
    预期结果：无 lint 错误
    证据：.sisyphus/evidence/task-12-catch.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(composables): add error logging to empty catch`

- [ ] 13. 重命名 `useConfirmDialog` 为 `useAppConfirmDialog`

  **做什么**：将项目的 `useConfirmDialog` composable 重命名为 `useAppConfirmDialog`，避免与 `@vueuse/core` 的 `useConfirmDialog` 冲突。更新代码库中所有导入（composables、views、components）。`auto-imports.d.ts` 会自动重新生成。更新 `src/composables/common/index.ts` barrel 导出。

  **禁止做什么**：不重命名 `@vueuse/core` 的 `useConfirmDialog`。不手动修改 `auto-imports.d.ts`（让 unplugin-auto-import 重新生成）。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 2 其他任务并行。

  **验收标准**：
  - [ ] 文件重命名为 `useAppConfirmDialog.ts`
  - [ ] 所有导入已更新
  - [ ] `auto-imports.d.ts` 正确重新生成
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：重命名后无断裂引用
    工具：Bash
    步骤：1. 重命名文件 2. 更新所有导入 3. npm run type-check 4. 搜索旧名称
    预期结果：0 errors，无旧名称引用
    证据：.sisyphus/evidence/task-13-rename.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(composables): rename useConfirmDialog to useAppConfirmDialog`

- [ ] 14. 规范化 `closeXxx` 为 `cancelXxx` 命名

  **做什么**：在 `src/api/trade/workOrder.ts` 中，将 `closeMyWorkOrder` 重命名为 `cancelMyWorkOrder`，`closeAdminWorkOrder` 重命名为 `cancelAdminWorkOrder`，与 `payment.ts` 中的 `cancelTicketOrder` 命名对齐。更新所有调用点（composables 和 views）。

  **禁止做什么**：不修改 API 端点 URL。不修改后端契约。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 Wave 2 其他任务并行。

  **验收标准**：
  - [ ] 函数已重命名
  - [ ] 所有调用点已更新
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：命名已规范化
    工具：Bash
    步骤：1. 重命名函数 2. 更新导入 3. npm run type-check 4. 搜索旧名称
    预期结果：0 errors，无旧名称
    证据：.sisyphus/evidence/task-14-naming.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(api): normalize closeXxx to cancelXxx naming`

- [ ] 15. 提取 `LoadingState` 组件

  **做什么**：创建 `src/components/common/LoadingState.vue`，封装 5 个前端视图中重复的 loading spinner 模式（HomeView、EventDetailView、CheckoutView、TicketDetailView、ParticipantDetailView）。Props：`minHeight`（默认 `'400px'`）、`message`（可选字符串）、`size`（默认 `'md'` 映射到 `h-8`/`h-10`）。使用现有的 `icon-lucide-loader2` 模式。在所有 5 个视图中替换重复 markup。

  **禁止做什么**：不改变视觉效果。不添加新依赖。不修改 `DataTableCrud` 内部的 loading overlay（那是不同的模式）。

  **推荐 Agent 配置**：Category: `visual-engineering`，Skills: [`shadcn-vue`, `vue-best-practices`]

  **并行化**：可与 T16-T20 并行，属于 Wave 3。

  **验收标准**：
  - [ ] `LoadingState.vue` 已创建
  - [ ] 5 个视图都使用它
  - [ ] 视觉效果不变
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：LoadingState 正确渲染
    工具：Playwright
    步骤：1. 访问首页 2. 等待 loading 状态 3. 截图 loading spinner
    预期结果：Spinner 可见，与原外观匹配
    证据：.sisyphus/evidence/task-15-loading-state.png
  ```

  **是否提交**：YES
  - 提交信息：`refactor(components): extract LoadingState component`

- [ ] 16. 将 `ConfirmDialog` 嵌入 `DataTableCrud`

  **做什么**：将 `ConfirmDialog` 作为 `DataTableCrud.vue` 的内部子组件。将 `confirmDialog` 状态作为 prop 传入（或使用 slot/provide 模式）。内部绑定 `@close` 和 `@confirm` 事件，使视图不需要声明 `ConfirmDialog` 模板块。11 个 admin 视图应能完全删除各自的 `<ConfirmDialog>` 块。

  **禁止做什么**：不破坏非 admin 视图中现有的 `ConfirmDialog` 使用（如 EventEditView、profile 等）。不修改 `ConfirmDialog` 组件本身。

  **推荐 Agent 配置**：Category: `visual-engineering`，Skills: [`shadcn-vue`, `vue-best-practices`]

  **并行化**：可与 T15、T18-T20 并行，属于 Wave 3。

  **验收标准**：
  - [ ] `DataTableCrud` 内部包含 `ConfirmDialog`
  - [ ] 11 个 admin 视图删除各自的 `ConfirmDialog` 模板
  - [ ] 删除/确认操作仍然有效
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：admin 列表的删除确认仍然工作
    工具：Playwright
    步骤：1. 访问 admin 列表页 2. 点击某行的删除 3. 确认对话框弹出 4. 点击确认
    预期结果：项目被删除，无 console 错误
    证据：.sisyphus/evidence/task-16-confirm-dialog.png
  ```

  **是否提交**：YES
  - 提交信息：`refactor(components): embed ConfirmDialog into DataTableCrud`

- [ ] 17. 更新所有视图引用（配合 T15 和 T16）

  **做什么**：更新 5 个前端视图使用 `LoadingState`（T15）。更新 11 个 admin 视图删除 `ConfirmDialog` 块并使用 `DataTableCrud` 的内置确认（T16）。涉及文件：HomeView.vue、EventDetailView.vue、CheckoutView.vue、TicketDetailView.vue、ParticipantDetailView.vue，以及所有 admin \*ListView.vue。

  **禁止做什么**：不修改视图逻辑。不修改 API 调用。不修改路由行为。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 T15、T16、T18-T20 并行，属于 Wave 3，依赖 T15 和 T16。

  **验收标准**：
  - [ ] 5 个前端视图使用 `LoadingState`
  - [ ] 11 个 admin 视图使用内置确认
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：视图更新后编译正常
    工具：Bash
    步骤：1. 更新所有视图 2. npm run type-check
    预期结果：0 errors
    证据：.sisyphus/evidence/task-17-views.txt
  ```

  **是否提交**：YES（与 T15、T16 合并提交）

- [ ] 18. 重构 `useAdminListPage` 为 `useAdminCrud`

  **做什么**：将 `src/composables/admin/list-pages/useAdminListPage.ts`（184行）重构为使用通用的 `useAdminCrud` composable，替代手写的 queryKey、分页、表单、mutations 和 confirm 逻辑。参考 `useCityListPage.ts` 作为目标模式。

  **禁止做什么**：不修改 `AdminListView.vue` 行为。不修改 API 调用。不破坏现有测试。

  **推荐 Agent 配置**：Category: `deep`，Skills: [`vue-best-practices`, `create-adaptable-composable`]

  **并行化**：可与 T15-T17、T19-T20 并行，属于 Wave 4。

  **验收标准**：
  - [ ] `useAdminListPage` 使用 `useAdminCrud`
  - [ ] 行数显著减少
  - [ ] 所有现有测试通过
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：Admin 列表页仍然工作
    工具：Bash
    步骤：1. 重构 composable 2. 运行测试 `npm run test src/composables/admin/list-pages/__tests__/useAdminListPage.test.ts`
    预期结果：所有测试通过
    证据：.sisyphus/evidence/task-18-admin-list.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(composables): migrate useAdminListPage to useAdminCrud`

- [ ] 19. 重构 `useNoticeListPage` 为 `useAdminCrud`

  **做什么**：与 T18 相同，针对 `src/composables/admin/list-pages/useNoticeListPage.ts`（188行）。该 composable 有一个额外的 `searchType` 过滤器，`useAdminCrud` 可能不支持。如果 `useAdminCrud` 不支持额外搜索参数，先扩展它添加可选的 `extraSearchParams` 参数，再迁移。

  **禁止做什么**：不丢失 `searchType` 过滤功能。不修改 `NoticeListView.vue` 行为。

  **推荐 Agent 配置**：Category: `deep`，Skills: [`vue-best-practices`, `create-adaptable-composable`]

  **并行化**：可与 T15-T18、T20 并行，属于 Wave 4。

  **验收标准**：
  - [ ] `useNoticeListPage` 使用 `useAdminCrud`
  - [ ] `searchType` 过滤仍然工作
  - [ ] 所有现有测试通过
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：Notice 列表页带 searchType 仍然工作
    工具：Bash
    步骤：1. 重构 composable 2. 运行测试 `npm run test src/composables/admin/list-pages/__tests__/useNoticeListPage.test.ts`
    预期结果：所有测试通过
    证据：.sisyphus/evidence/task-19-notice-list.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(composables): migrate useNoticeListPage to useAdminCrud`

- [ ] 20. 清理空的 `handleDelete` stub

  **做什么**：在 `src/composables/admin/list-pages/useAdminListPage.ts` 第158行，`handleDelete(_row: AdminVO) => {}` 是空实现。直接移除它，并在 `listPageColumns.ts` 中移除 admin 列表对应的删除操作按钮列。鉴于当前 admin 列表无删除功能，移除是最安全的选择。

  **禁止做什么**：不添加真实的删除实现（除非用户明确确认）。不破坏表格渲染。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 T15-T19 并行，属于 Wave 4。

  **验收标准**：
  - [ ] 空的 `handleDelete` 已移除
  - [ ] admin 列表列定义中无删除操作按钮
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：admin 列表无删除按钮
    工具：Playwright
    步骤：1. 访问 admin 列表页 2. 检查表格行
    预期结果：无删除按钮可见
    证据：.sisyphus/evidence/task-20-no-delete.png
  ```

  **是否提交**：YES（与 T18、T19 合并提交）

- [ ] 21. 更新 `AGENTS.md` 修正 5 处偏差

  **做什么**：修复 AGENTS.md 中 5 处已确认的描述偏差：
  1. 第7节（路由）：删除"EmptyLayout 用于登录页"的说法，改为"登录页等直接渲染组件，无 layout 包裹"。
  2. 第10节（TanStack Vue Query）：修正注册位置的描述，从"MainLayout/AdminLayout"改为"main.ts"。
  3. 第10节（useDialog）：在返回值描述中补充 `withLoading`。
  4. 第1节（API）：明确 `datetime-local` 到 ISO 的转换发生在**请求数据**上，而非响应数据。
  5. 第8节（状态管理）：明确 `createAuthStore` 是 `src/composables/common/` 中的**自定义** composable，内部使用 `@vueuse/core` 的 `useStorage`，而非来自 `@vueuse/core` 本身。

  **禁止做什么**：不完全重写 AGENTS.md。不添加未经验证的内容。只修复已验证的偏差。

  **推荐 Agent 配置**：Category: `writing`

  **并行化**：可与 T22-T24 并行，属于 Wave 5。

  **验收标准**：
  - [ ] 5 处偏差已修正
  - [ ] 无新增不准确内容

  **QA 场景**：

  ```
  场景：AGENTS.md 修正准确
    工具：Bash
    步骤：1. 读取修正后的章节 2. 与实际代码交叉验证
    预期结果：描述与代码匹配
    证据：.sisyphus/evidence/task-21-agents.md
  ```

  **是否提交**：YES
  - 提交信息：`docs(agents): correct 5 verified discrepancies`

- [ ] 22. 修复 ESLint 对 `docs/ui-guidelines.md` 的引用

  **做什么**：在 `eslint.config.ts` 第50行，`dialog-no-vif-with-open` 规则的错误消息引用了不存在的 `docs/ui-guidelines.md`。两种选择：(a) 创建该文件，或 (b) 从错误消息中移除引用。选择 (b) 更安全快捷。将消息改为：`'禁止在 Dialog 组件上使用 v-if，请使用 :open 控制显示'`。

  **禁止做什么**：不修改规则逻辑。不修改选择器。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 T21、T23-T24 并行，属于 Wave 5。

  **验收标准**：
  - [ ] 错误消息不再引用缺失文件
  - [ ] `npm run lint:check` 通过

  **QA 场景**：

  ```
  场景：ESLint 消息干净
    工具：Bash
    步骤：1. 编辑 eslint.config.ts 2. npm run lint:check
    预期结果：无 lint 错误
    证据：.sisyphus/evidence/task-22-eslint.txt
  ```

  **是否提交**：YES
  - 提交信息：`chore(eslint): remove reference to non-existent docs/ui-guidelines.md`

- [ ] 23. 添加 `VITE_WS_URL` 到 `env.d.ts`

  **做什么**：在 `env.d.ts` 中添加 `VITE_WS_URL` 声明，与 `VITE_API_BASE_URL` 和 `VITE_API_TARGET_URL` 并列。该变量在 `useWorkOrderChat.ts` 中使用，但当前通过类型转换 hack 访问：`(import.meta as ImportMeta & { env?: { VITE_WS_URL?: string } }).env?.VITE_WS_URL`。

  **禁止做什么**：不修改 `.env` 文件（它们已有值或使用默认值）。不修改 `useWorkOrderChat.ts` 的逻辑。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 T21-T22、T24 并行，属于 Wave 5。

  **验收标准**：
  - [ ] `VITE_WS_URL` 已声明在 `env.d.ts`
  - [ ] `useWorkOrderChat.ts` 不再需要类型转换
  - [ ] `npm run type-check` 通过

  **QA 场景**：

  ```
  场景：WS URL 正确类型化
    工具：Bash
    步骤：1. 添加声明 2. 从 useWorkOrderChat.ts 移除类型转换 3. npm run type-check
    预期结果：0 errors
    证据：.sisyphus/evidence/task-23-env-types.txt
  ```

  **是否提交**：YES
  - 提交信息：`refactor(types): add VITE_WS_URL to env.d.ts`

- [ ] 24. 记录 `useDialog.withLoading` 和 `useAdminCrud` 模式

  **做什么**：在 AGENTS.md 中补充两项：
  1. 第10节（useDialog）：记录 `useDialog` 返回 `withLoading` 辅助函数（包装异步函数并管理 loading 状态）。
  2. 第4节（composables）或新增一节：记录 `useAdminCrud` 作为 admin 列表页 composable 的**推荐模式**，说明其 4 个类型参数和提供的功能。

  **禁止做什么**：不记录未在代码中验证的模式。不写教程。

  **推荐 Agent 配置**：Category: `writing`

  **并行化**：可与 T21-T23 并行，属于 Wave 5。

  **验收标准**：
  - [ ] `useDialog.withLoading` 已记录
  - [ ] `useAdminCrud` 已记录
  - [ ] 描述与实际代码匹配

  **QA 场景**：

  ```
  场景：文档与代码匹配
    工具：Bash
    步骤：1. 读取 AGENTS.md 新增内容 2. 与 useDialog.ts 和 useAdminCrud.ts 交叉验证
    预期结果：描述准确
    证据：.sisyphus/evidence/task-24-docs.txt
  ```

  **是否提交**：YES
  - 提交信息：`docs(agents): document withLoading and useAdminCrud patterns`

- [ ] 25. 运行 `npm run type-check`

  **做什么**：运行 `vue-tsc --build` 验证所有重构后的 TypeScript 编译。

  **禁止做什么**：不用 `any` 或 `@ts-ignore` 修复类型错误。如有错误，报告并正确修复。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：顺序执行，属于 Wave 6。

  **验收标准**：
  - [ ] 0 errors
  - [ ] 0 warnings

  **QA 场景**：

  ```
  场景：类型检查通过
    工具：Bash
    步骤：1. npm run type-check
    预期结果：0 errors
    证据：.sisyphus/evidence/task-25-type-check.txt
  ```

  **是否提交**：NO（仅验证）

- [ ] 26. 运行 `npm run lint:check` + `lint:oxlint`

  **做什么**：运行 ESLint 和 Oxlint 验证无 lint 违规。

  **禁止做什么**：不使用 `lint:fix` 自动修复。报告所有违规供审查。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 T25、T27-T29 并行，属于 Wave 6。

  **验收标准**：
  - [ ] ESLint 0 errors
  - [ ] Oxlint 0 errors

  **QA 场景**：

  ```
  场景：Lint 检查通过
    工具：Bash
    步骤：1. npm run lint:check 2. npm run lint:oxlint
    预期结果：各 0 errors
    证据：.sisyphus/evidence/task-26-lint.txt
  ```

  **是否提交**：NO（仅验证）

- [ ] 27. 运行 `npm run test`

  **做什么**：运行所有 Vitest 测试。

  **禁止做什么**：不跳过失败的测试。修复根本原因。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 T25-T26、T28-T29 并行，属于 Wave 6。

  **验收标准**：
  - [ ] 所有测试通过
  - [ ] 无测试失败

  **QA 场景**：

  ```
  场景：所有测试通过
    工具：Bash
    步骤：1. npm run test
    预期结果：所有测试通过
    证据：.sisyphus/evidence/task-27-test.txt
  ```

  **是否提交**：NO（仅验证）

- [ ] 28. 运行 `npm run ci`（完整门禁）

  **做什么**：运行完整的质量门禁：type-check → lint:check → lint:oxlint → audit:ids → openapi:report → test → format:check → build。

  **禁止做什么**：不跳过任何步骤。完整门禁必须通过。

  **推荐 Agent 配置**：Category: `quick`

  **并行化**：可与 T25-T27、T29 并行，属于 Wave 6。

  **验收标准**：
  - [ ] 全部 8 个步骤通过

  **QA 场景**：

  ```
  场景：完整 CI 门禁通过
    工具：Bash
    步骤：1. npm run ci
    预期结果：Exit code 0
    证据：.sisyphus/evidence/task-28-ci.txt
  ```

  **是否提交**：NO（仅验证）

- [ ] 29. 死代码扫描复查

  **做什么**：重新运行死代码审计，确认无遗漏。检查重构是否引入了新的死代码（例如重命名后遗留的旧导入）。

  **禁止做什么**：不删除实际使用但导入量低的文件。

  **推荐 Agent 配置**：Category: `unspecified-high`

  **并行化**：可与 T25-T28 并行，属于 Wave 6。

  **验收标准**：
  - [ ] 无新增死代码
  - [ ] 所有先前识别的死代码已移除

  **QA 场景**：

  ```
  场景：无死代码残留
    工具：Bash
    步骤：1. 搜索未使用的导出 2. 搜索未被导入的文件
    预期结果：Clean
    证据：.sisyphus/evidence/task-29-dead-code.txt
  ```

  **是否提交**：NO（仅验证）

---

## 最终验证波次

- [ ] F1. **计划合规性审计** — `oracle`
      通读计划全文。对每个 Must Have：验证实现存在（读取文件、curl 接口、运行命令）。对每个 Must NOT Have：搜索代码库中的禁止模式。检查证据文件存在于 `.sisyphus/evidence/`。
      输出：`Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **代码质量审查** — `unspecified-high`
      运行 `tsc --noEmit` + linter + `npm run test`。审查所有改动文件：`as any`、`@ts-ignore`、空 catch、`console.log`、注释掉的代码、未使用的导入。检查 AI slop 模式（过度注释、过度抽象、通用命名）。
      输出：`Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **真实手工 QA** — `unspecified-high`
      从干净状态开始。执行每个任务的每个 QA scenario——按精确步骤执行，捕获证据。测试跨任务集成（功能协同工作）。测试边界情况：空状态、无效输入、快速操作。保存到 `.sisyphus/evidence/final-qa/`。
      输出：`Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **范围保真度检查** — `deep`
      对每个任务：读取 "What to do"，读取实际 diff。验证 1:1——规格中的都建了（无遗漏），规格外的没建（无蔓延）。检查 Must NOT do 合规性。检测跨任务污染：任务 N 触碰了任务 M 的文件。
      输出：`Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## 提交策略

- Wave 1 提交：`refactor(dead-code): remove unused files and exports`
- Wave 2 提交：`refactor(style): unify imports, colors, naming`
- Wave 3 提交：`refactor(components): extract LoadingState, embed ConfirmDialog`
- Wave 4 提交：`refactor(crud): unify list page composables`
- Wave 5 提交：`docs(agents): correct inaccuracies and add missing patterns`
- Wave 6 提交：`chore(ci): verify all gates pass`

## 成功标准

### 验证命令

```bash
npm run ci    # 预期：所有门禁通过
```

### 最终检查清单

- [ ] 所有 Must Have 已达成
- [ ] 所有 Must NOT Have 未触及
- [ ] 所有测试通过
- [ ] 零死代码（已扫描确认）
- [ ] AGENTS.md 准确反映代码库
