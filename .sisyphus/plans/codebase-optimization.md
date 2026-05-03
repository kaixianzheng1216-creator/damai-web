# Damai-Web 全面优化计划

## TL;DR

> **Quick Summary**: 对Vibe Coding构建的大麦网票务平台前端进行全面优化，分3个Wave：快速改进（依赖清理、无障碍修复、代码整洁）→ 架构重构（admin CRUD统一化、tiptap bundle优化）→ 深度优化（虚拟滚动、异步Tab、WebSocket清理、watch反模式修复）。
>
> **Deliverables**:
>
> - Wave1: 清理6个未使用依赖、20个img alt属性修复、html标题修正、staleTime冗余移除、console.warn优化、eslint规范修复
> - Wave2: 用useAdminCrud重构6个admin composable、tiptap StarterKit→独立扩展、watch→computed重构
> - Wave3: 虚拟滚动3个admin列表页、异步Tab加载、空catch块改善、WebSocket回调清理
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 Waves, 每个Wave内最大并行
> **Critical Path**: Wave1 → Wave2 → Wave3（Wave内可并行）

---

## Context

### Original Request

用户用纯Vibe Coding构建了damai-web项目（大麦网票务平台前端，Vue 3 + Vite 6 + TypeScript），希望进行全面优化。

### Interview Summary

**Key Discussions**:

- 优化范围：全部3个Wave（快速改进 + 架构重构 + 深度优化）
- 测试策略：不写单元测试，仅依赖Agent-Executed QA（Playwright/curl/bash验证）
- 所有任务完成后必须通过 `npm run ci` 完整质量门禁

**Research Findings**（3个并行探索分析的结论）:

- 项目代码质量意外地高：0 `:any`类型、0 TODO/FIXME、0注释代码、TypeScript strict全开
- 主要gap：6个admin composable未用useAdminCrud（664行重复）、20个img缺alt、9个空catch块、tiptap过度导入
- 性能OK但不完美：无虚拟滚动、useServiceListPage有watch反模式

### Metis Review

**Identified Gaps**（已处理）:

- Metis质疑img标签和空catch块不存在 → 独立验证确认两者均存在，Metis搜索工具对.vue文件支持有限
- `console.warn`替换为toast可能造成WebSocket重连时反复弹窗 → 改为：保留console.warn但使用结构化日志（带模块前缀），不换toast
- `useAdminEventListPage`有特殊功能（下拉查询、额外搜索筛选器、非标准mutation）不直接适配useAdminCrud → 添加guardrail：仅包装可适配部分，不改API签名

---

## Work Objectives

### Core Objective

对damai-web项目进行系统化优化，消除代码重复、提升可访问性、减小bundle、改善错误处理，保持现有功能不变。

### Concrete Deliverables

- 清理 `package.json` 中6个未使用依赖
- 修复20个 `<img>` 标签的 `alt` 属性
- 修复 `index.html` 标题和lang属性
- 移除2处冗余 `staleTime` 覆盖
- 规范化 `useWorkOrderChat.ts` 中3处 `console.warn`
- 修复2处 `eslint-disable vue/no-mutating-props` 违规
- 用独立tiptap扩展替换 `StarterKit`，减少bundle
- 6个admin CRUD composable重构为使用 `useAdminCrud`
- 修复 `useServiceListPage.ts` watch→computed反模式
- 3个admin列表页添加虚拟滚动
- `EventEditView.vue` 中3个Tab改为异步加载
- 9个空catch块添加错误日志
- `useWorkOrderChat.ts` 回调清理机制

### Definition of Done

- [ ] `npm run ci` 通过（type-check + lint×2 + audit + openapi + test + format + build）
- [ ] 所有改动后页面Playwright冒烟测试通过
- [ ] bundle大小对比（优化前后）

### Must Have

- 所有现有功能保持不变
- API函数签名不变
- 分页/排序/筛选行为不变
- 默认分页大小不变

### Must NOT Have (Guardrails)

- 不得添加新功能
- 不得抽象/DRY超出指定范围的代码
- 不得修改CSS/样式
- 不得在非目标文件中"顺手清理"imports
- 不得为未修改代码添加JSDoc/注释
- 重构useAdminCrud时如节省<20%行数或需改API签名→放弃该composable的重构
- tiptap优化如bundle分析无收益→回退到StarterKit

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.
> 验收标准中不得出现"用户手动测试/确认"。

### Test Decision

- **Infrastructure exists**: YES（Vitest + happy-dom）
- **Automated tests**: None（用户选择不写单元测试）
- **Agent-Executed QA**: ALWAYS - 每个任务使用 Playwright/curl/bash 验证

### QA Policy

每个任务必须包含Agent-Executed QA Scenarios。
证据保存到 `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`。

- **Frontend/UI**: Playwright - 导航、交互、断言DOM、截图
- **API/Backend**: Bash (curl) - 发送请求、断言状态+响应字段
- **Build验证**: Bash - `npm run ci`, `npm run build`, bundle size comparison

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (立即启动 - 快速改进，最大并行):
├── Task 1: 清理未使用依赖 [quick]
├── Task 2: img alt属性修复 [quick]
├── Task 3: index.html标题+lang修复 [quick]
├── Task 4: 移除冗余staleTime覆盖 [quick]
├── Task 5: console.warn规范化 [quick]
└── Task 6: eslint-disable违规修复 [quick]

Wave 2 (Wave 1完成后 - 架构重构):
├── Task 7: tiptap StarterKit→独立扩展 [quick]
├── Task 8: admin CRUD composable统一化（6个文件） [unspecified-high]
└── Task 9: useServiceListPage watch→computed重构 [deep]

Wave 3 (Wave 2完成后 - 深度优化):
├── Task 10: admin列表页虚拟滚动（3个页面） [visual-engineering]
├── Task 11: EventEditView异步Tab加载 [quick]
├── Task 12: 空catch块改善（9处） [quick]
└── Task 13: useWorkOrderChat回调清理 [quick]

Wave FINAL (所有任务后 - 4个并行review):
├── Task F1: Plan Compliance Audit (oracle)
├── Task F2: Code Quality Review (unspecified-high)
├── Task F3: Real Manual QA (unspecified-high)
└── Task F4: Scope Fidelity Check (deep)
-> 展示结果 → 等待用户明确"okay"
```

### Dependency Matrix

- **1-6**: 无依赖 → Wave1内全部并行
- **7**: 无依赖 → 可并行（与8、9）
- **8**: 无依赖 → 可并行（与7、9）
- **9**: 无依赖 → 可并行（与7、8）
- **10**: 8 → 需要useAdminCrud重构后的列表页
- **11**: 无依赖 → 可并行（与10、12、13）
- **12**: 无依赖 → 可并行（与10、11、13）
- **13**: 无依赖 → 可并行（与10、11、12）

### Critical Path: Task 1-6（任一）→ Task 8 → Task 10 → F1-F4 → 用户okay

---

## TODOs

- [x] 1. 清理6个未使用依赖（package.json）

  **What to do**:
  - 从 `package.json` `dependencies` 中移除以下6个包：
    - `@tiptap/extension-horizontal-rule` — RichTextEditor中已禁用horizontalRule
    - `@tiptap/extension-list` — 已通过starter-kit引入（Task 7后会替换）
    - `@tiptap/extension-typography` — RichTextEditor未使用
    - `@tiptap/extensions` — 未被任何文件import
    - `lodash.throttle` — 代码库中无import
    - 从 `devDependencies` 中移除 `@types/lodash.throttle`
  - 运行 `npm install` 更新 lockfile

  **Must NOT do**:
  - 不移除被使用的包（如 @tiptap/core, @tiptap/starter-kit 等）
  - 不更新任何包的版本号
  - 不添加新依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件修改，删除依赖条目
  - **Skills**: [`vue-best-practices`]
    - `vue-best-practices`: 了解Vue项目的package.json结构

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6)

  **References**:
  - `package.json:48-52` — tiptap extension dependencies位置

  **Acceptance Criteria**:
  - [ ] `npm ls @tiptap/extension-horizontal-rule` → 报错（已移除）
  - [ ] `npm ls lodash.throttle` → 报错（已移除）

  **QA Scenarios**:

  ```
  Scenario: npm install成功且构建通过
    Tool: Bash
    Preconditions: package.json中已移除6个依赖
    Steps:
      1. npm install --no-audit --no-fund
      2. npm run build
      3. assert build exit code = 0
      4. assert dist/ 目录存在
    Expected Result: npm install和build均成功，无missing dependency错误
    Failure Indicators: npm install报missing peer dependency; build报import错误
    Evidence: .sisyphus/evidence/task-1-build.{txt,log}
  ```

  **Commit**: YES
  - Message: `chore(deps): remove 6 unused dependencies (tiptap extensions, lodash.throttle)`
  - Files: `package.json`, `package-lock.json`

- [x] 2. 修复20个img标签的alt属性（16个文件）

  **What to do**:
  - 为以下文件中缺少 `alt` 属性的 `<img>` 标签添加描述性 `alt`：
    1. `HeaderUserMenu.vue:39` — `alt="用户头像"`
    2. `EventCard.vue (common):37` — `alt="活动封面"`
    3. `ImageUpload.vue:183` — `alt="已上传图片预览"`
    4. `OrderCard.vue:25` — `alt="订单封面"`
    5. `TicketCard.vue:32` — `alt="电子票封面"`
    6. `ParticipantsTab.vue:77` — `alt="参与者头像"`
    7. `ParticipantsTab.vue:140` — `alt="参与者封面"`
    8. `AIChatEmptyState.vue:26` — `alt="AI助手"`
    9. `AIChatMessageList.vue:92` — `alt="活动封面"`
    10. `AIChatMessageList.vue:134` — `alt="订单封面"`
    11. `AIChatMessageList.vue:149` — `alt="电子票封面"`
    12. `CheckoutOrderCard.vue:28` — `alt="订单封面"`
    13. `CheckoutQrDialog.vue:39` — `alt="支付二维码"`
    14. `EventDetailHero.vue:63` — `alt="活动宣传图"`
    15. `EventCard.vue (features/home):14` — `alt="活动封面"`
    16. `HomeBanner.vue:41` — `alt="首页Banner"`
    17. `ProfileFollowedParticipantsSection.vue:51` — `alt="参与者头像"`
    18. `ProfileInfoSection.vue:51` — `alt="用户头像"`
    19. `SearchResultListItem.vue:22` — `alt="活动缩略图"`
    20. `TicketDetailView.vue:53` — 已有 `alt="电子票二维码"` ✅（跳过）

  **Must NOT do**:
  - 不修改图片src或其他属性
  - 不修改组件结构
  - 不为已有alt的标签重复添加

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 多文件简单属性添加，纯模板修改
  - **Skills**: [`vue-best-practices`]
    - `vue-best-practices`: Vue模板语法

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5, 6)

  **References**:
  - `views/ticket/TicketDetailView.vue:53` — 已有alt属性的正确示例

  **Acceptance Criteria**:
  - [ ] 所有20个img标签均有 `alt` 属性
  - [ ] `npm run lint:check` 零新增error

  **QA Scenarios**:

  ```
  Scenario: lint检查通过且无alt相关警告
    Tool: Bash
    Steps:
      1. npm run lint:check
      2. assert exit code = 0
      3. assert output无 "Missing 'alt' attribute" 相关错误
    Expected Result: ESLint通过，无img相关a11y警告
    Evidence: .sisyphus/evidence/task-2-lint.txt
  ```

  **Commit**: YES
  - Message: `fix(a11y): add alt attributes to 19 img tags across 16 files`
  - Files: 16个.vue文件

- [x] 3. 修复index.html标题和lang属性

  **What to do**:
  - `index.html:7`: `<title>Vite App</title>` → `<title>Damai - 大麦网</title>`
  - `index.html:2`: `<html lang="">` → `<html lang="zh-CN">`

  **Must NOT do**:
  - 不修改其他meta标签
  - 不添加新标签

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件2行修改

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5, 6)

  **References**:
  - `index.html:2` — lang属性位置
  - `index.html:7` — title标签位置

  **Acceptance Criteria**:
  - [ ] `<title>` 内容为 "Damai - 大麦网"
  - [ ] `<html lang="zh-CN">`

  **QA Scenarios**:

  ```
  Scenario: 验证HTML标签修改正确
    Tool: Bash
    Steps:
      1. grep '<html lang="zh-CN">' index.html → assert匹配
      2. grep '<title>Damai - 大麦网</title>' index.html → assert匹配
    Expected Result: 两处修改均已应用
    Evidence: .sisyphus/evidence/task-3-html.txt
  ```

  **Commit**: YES
  - Message: `fix(html): set correct title and lang attribute in index.html`
  - Files: `index.html`

- [x] 4. 移除冗余staleTime覆盖（2个文件）

  **What to do**:
  - `useEventEditPage.ts:28`: 移除 `staleTime: 1000 * 60 * 5`（与全局默认相同）
  - `useHomePage.ts:69`: 移除 `staleTime: 5 * 60 * 1000`（与全局默认相同）
  - 保留其他useQuery选项（如 `enabled`、`queryKey`、`queryFn`）

  **Must NOT do**:
  - 不修改全局 staleTime 配置（`main.ts:17`）
  - 不修改其他query的 staleTime（仅在值等于全局默认时才移除）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 2文件，删除冗余配置行
  - **Skills**: [`vue-best-practices`]
    - `vue-best-practices`: 理解TanStack Vue Query配置

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5, 6)

  **References**:
  - `src/main.ts:17` — 全局 staleTime: 5min 默认值
  - `src/composables/admin/event-edit/useEventEditPage.ts:28` — 冗余覆盖1
  - `src/composables/home/useHomePage.ts:69` — 冗余覆盖2

  **Acceptance Criteria**:
  - [ ] `useEventEditPage.ts` 中useQuery调用无 staleTime 属性
  - [ ] `useHomePage.ts` 中useQuery调用无 staleTime 属性

  **QA Scenarios**:

  ```
  Scenario: 类型检查和lint通过
    Tool: Bash
    Steps:
      1. npm run type-check → assert exit code 0
      2. npm run lint:check → assert exit code 0
    Expected Result: 移除冗余配置后类型和lint均通过
    Evidence: .sisyphus/evidence/task-4-typecheck.txt
  ```

  **Commit**: YES
  - Message: `chore(query): remove redundant staleTime overrides matching global default`
  - Files: `src/composables/admin/event-edit/useEventEditPage.ts`, `src/composables/home/useHomePage.ts`

- [x] 5. 规范化useWorkOrderChat.ts中的console.warn（保持console.warn但加模块前缀）

  **What to do**:
  - L77: `console.warn('[useWorkOrderChat] Cannot connect: no token provided')` → 已有前缀 ✅（跳过）
  - L102: 确认heartbeat警告格式（如无前缀则添加）
  - L198: 确认"not connected"警告格式（如无前缀则添加）
  - 检查并确保所有console.warn/error在useWorkOrderChat.ts中均有 `[useWorkOrderChat]` 前缀

  **Must NOT do**:
  - **不得**将console.warn替换为toast通知（WebSocket重连时会造成toast轰炸）
  - 不修改logger级别（warn→warn, error→error）
  - 不删除任何错误日志

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件日志格式检查，可能只需1-2行修改

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 6)

  **References**:
  - `src/composables/common/useWorkOrderChat.ts:77` — 已有前缀的console.warn示例
  - `src/composables/common/useWorkOrderChat.ts:102` — heartbeat警告
  - `src/composables/common/useWorkOrderChat.ts:134` — console.error
  - `src/composables/common/useWorkOrderChat.ts:198` — "not connected"警告

  **Acceptance Criteria**:
  - [ ] 所有useWorkOrderChat.ts中的console.warn/error均有 `[useWorkOrderChat]` 前缀
  - [ ] `npm run lint:check` 零新增warning（console相关）

  **QA Scenarios**:

  ```
  Scenario: 日志格式一致性验证
    Tool: Bash
    Steps:
      1. grep -n 'console\.\(warn\|error\)' src/composables/common/useWorkOrderChat.ts
      2. assert 每行都包含 '[useWorkOrderChat]' 前缀
    Expected Result: 所有console调用格式统一
    Evidence: .sisyphus/evidence/task-5-logs.txt
  ```

  **Commit**: YES
  - Message: `chore(logs): standardize console.warn/error prefixes in useWorkOrderChat`
  - Files: `src/composables/common/useWorkOrderChat.ts`

- [x] 6. 修复2处eslint-disable vue/no-mutating-props违规

  **What to do**:
  - `ProfileDialogs.vue:23-56`: 移除 `// eslint-disable vue/no-mutating-props`，改为使用局部变量+emit模式
    - 分析当前props变异逻辑
    - 创建局部ref拷贝props值
    - 使用 `watch` 同步props→local，使用 `emit` 同步local→parent
  - `ProfileSectionContent.vue:36-124`: 同上处理

  **Must NOT do**:
  - 不修改对话框的UI/UX
  - 不修改父组件传递props的方式
  - 不改变emit事件名称

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 2文件中等复杂度重构，需理解props/emit模式
  - **Skills**: [`vue-best-practices`, `vue-pinia-best-practices`]
    - `vue-best-practices`: Vue 3 props/emit最佳实践
    - `vue-pinia-best-practices`: 可能涉及store交互

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5)

  **References**:
  - `src/components/features/profile/ProfileDialogs.vue:23` — eslint-disable位置
  - `src/components/features/profile/ProfileSectionContent.vue:36` — eslint-disable位置
  - AGENTS.md — Dialog弹窗规范（禁止v-if，必须用:open prop）

  **Acceptance Criteria**:
  - [ ] `npm run lint:check` 零 "vue/no-mutating-props" 错误
  - [ ] 两个文件中不再有 `eslint-disable vue/no-mutating-props` 注释

  **QA Scenarios**:

  ```
  Scenario: lint检查通过且对话框功能正常
    Tool: Bash
    Steps:
      1. npm run lint:check → assert exit code 0
      2. npm run type-check → assert exit code 0
    Expected Result: lint和类型检查均通过
    Evidence: .sisyphus/evidence/task-6-lint.txt
  ```

  **Commit**: YES
  - Message: `fix(lint): resolve vue/no-mutating-props violations in ProfileDialogs and ProfileSectionContent`
  - Files: `src/components/features/profile/ProfileDialogs.vue`, `src/components/features/profile/ProfileSectionContent.vue`

- [x] 7. 用独立tiptap扩展替换StarterKit（减少bundle）

  **What to do**:
  - 在 `RichTextEditor.vue` 中将：
    ```ts
    import StarterKit from '@tiptap/starter-kit'
    ```
    替换为独立扩展导入：
    ```ts
    import Document from '@tiptap/extension-document'
    import Paragraph from '@tiptap/extension-paragraph'
    import Text from '@tiptap/extension-text'
    import Bold from '@tiptap/extension-bold'
    import Heading from '@tiptap/extension-heading'
    import BulletList from '@tiptap/extension-bullet-list'
    import OrderedList from '@tiptap/extension-ordered-list'
    import ListItem from '@tiptap/extension-list-item'
    import History from '@tiptap/extension-history'
    ```
  - 更新extensions数组为独立扩展列表
  - 运行 `npm run build` 前后对比dist大小
  - 如bundle减少<5% → 回退（使用guardrail）

  **Must NOT do**:
  - 不添加新编辑器功能（如code block、image等）
  - 不修改编辑器UI/工具栏
  - 不改变现有扩展配置（如heading levels）
  - 如bundle无收益则回退

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件import替换，但需要bundle分析验证
  - **Skills**: [`vue-best-practices`]
    - `vue-best-practices`: Vue组件import管理

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 9)

  **References**:
  - `src/components/common/RichTextEditor.vue:3-4` — 当前StarterKit导入
  - `src/components/common/RichTextEditor.vue:26-30` — 被禁用的扩展列表（blockquote/false, code/false, codeBlock/false, horizontalRule/false, strike/false）

  **Acceptance Criteria**:
  - [ ] RichTextEditor编辑功能正常（bold、heading、list等）
  - [ ] bundle大小不增
  - [ ] `npm run ci` 通过

  **QA Scenarios**:

  ```
  Scenario: 构建通过且bundle不增
    Tool: Bash
    Preconditions: 记录当前dist/大小
    Steps:
      1. ls -la dist/assets/*.js | awk '{sum+=$5} END {print sum}' → 记录baseline
      2. 替换import后 npm run build
      3. ls -la dist/assets/*.js | awk '{sum+=$5} END {print sum}' → 对比
      4. assert 新size <= 旧size
    Expected Result: bundle大小减少或持平
    Evidence: .sisyphus/evidence/task-7-bundle.txt

  Scenario: npm run ci全绿
    Tool: Bash
    Steps:
      1. npm run ci
      2. assert exit code = 0
    Expected Result: 所有质量门禁通过
    Evidence: .sisyphus/evidence/task-7-ci.txt
  ```

  **Commit**: YES
  - Message: `perf(bundle): replace tiptap StarterKit with individual extensions`
  - Files: `src/components/common/RichTextEditor.vue`

- [x] 8. 用useAdminCrud重构6个admin CRUD composable

  **What to do**:
  按复杂度从低到高逐个重构以下6个composable使用 `useAdminCrud`：

  **优先重构（简单）**：
  - `useTicketListPage.ts` (67行) → 标准CRUD，直接包装useAdminCrud
  - `useAdminUserListPage.ts` (71行) → 标准CRUD
  - `useOrderListPage.ts` (89行) → 标准CRUD
  - `useCategoryListPage.ts` (90行) → 标准CRUD

  **需评估后重构（复杂）**：
  - `useAdminEventListPage.ts` (140行) — 有额外dropdown查询(citiesData/categoriesData)、额外搜索筛选器(searchCityId/searchCategoryId)、非标准mutation(publishEvent/offlineEvent)
    - **Guardrail**: 仅包装可适配的CRUD部分，保留额外特性不变
    - 如节省<20%行数或需改API签名→跳过此文件
  - `useAdminWorkOrderListPage.ts` (207行) — 混入WebSocket详情+chat逻辑
    - **Guardrail**: 同上，仅包装CRUD基础部分

  **Must NOT do**:
  - 不修改 `useAdminCrud.ts` 本身
  - 不改变 API函数签名
  - 不修改分页排序筛选行为
  - 不修改默认pageSize
  - 不修改mutation的onSuccess回调行为
  - 重构后如节省<20%行数→放弃

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 6文件重构，需理解CRUD抽象和每个composable的特殊逻辑
  - **Skills**: [`vue-best-practices`, `vue-pinia-best-practices`]
    - `vue-best-practices`: Vue composable模式
    - `vue-pinia-best-practices`: TanStack Query集成

  **Parallelization**:
  - **Can Run In Parallel**: YES（6个文件间无依赖，可并行重构）
  - **Parallel Group**: Wave 2 (with Tasks 7, 9)

  **References**:
  - `src/composables/admin/common/useAdminCrud.ts` — 目标抽象层
  - `src/composables/admin/list-pages/useTicketListPage.ts` — 最简单（67行）
  - `src/composables/admin/list-pages/useAdminEventListPage.ts` — 最复杂（140行，有额外特性）
  - `src/composables/admin/list-pages/useAdminWorkOrderListPage.ts` — 最复杂（207行，有WebSocket逻辑）
  - `src/composables/admin/list-pages/useBannerListPage.ts` — 已在用useAdminCrud的参考示例

  **Acceptance Criteria**:
  - [ ] 每个重构后composable的 `npm run type-check` 通过
  - [ ] 总代码行数减少（目标：200+行净减少）
  - [ ] 所有重构后的composable导出的API（函数签名）不变

  **QA Scenarios**:

  ```
  Scenario: 类型检查和lint全通过
    Tool: Bash
    Steps:
      1. npm run type-check → assert exit code 0
      2. npm run lint:check → assert exit code 0
      3. npm run test → assert 已有测试全部通过
    Expected Result: 重构不影响类型安全、lint规范和已有测试
    Evidence: .sisyphus/evidence/task-8-check.txt
  ```

  **Commit**: YES（每个composable独立commit）
  - Message: `refactor(admin): migrate {ComposableName} to useAdminCrud`
  - Files: 对应的composable文件（每个composable一个commit）

- [x] 9. 修复useServiceListPage.ts watch→computed反模式

  **What to do**:
  - `useServiceListPage.ts:152`: 当前使用 `watch(crud.list, () => { syncSelectedService() })` 监听list变化后调用另一个函数
  - 改为：将 `selectedService` 设计为 `computed` 属性，直接从 `crud.list` 派生
  - 分析 `syncSelectedService()` 的完整逻辑
  - 检查 `selectedService` 是否存在其他赋值点（确保可完全派生）

  **Must NOT do**:
  - 不修改服务选择的外部行为
  - 不改变 `selectedService` 的对外接口
  - 不修改其他watch

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 需深入理解服务列表同步逻辑，确保computed替代正确
  - **Skills**: [`vue-best-practices`]
    - `vue-best-practices`: Vue reactive patterns（watch vs computed）

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8)

  **References**:
  - `src/composables/admin/list-pages/useServiceListPage.ts:152` — watch反模式位置
  - `src/composables/admin/list-pages/useServiceListPage.ts:syncSelectedService()` — 当前被watch触发的函数

  **Acceptance Criteria**:
  - [ ] `useServiceListPage.ts` 中不再有 `watch(crud.list, ...)` 调用 `syncSelectedService`
  - [ ] `selectedService` 行为与重构前完全一致

  **QA Scenarios**:

  ```
  Scenario: 类型检查通过
    Tool: Bash
    Steps:
      1. npm run type-check → assert exit code 0
    Expected Result: 类型检查通过
    Evidence: .sisyphus/evidence/task-9-typecheck.txt
  ```

  **Commit**: YES
  - Message: `refactor(admin): replace watch with computed in useServiceListPage selectedService`
  - Files: `src/composables/admin/list-pages/useServiceListPage.ts`

- [x] 10. 为3个admin列表页添加虚拟滚动

  **What to do**:
  - 安装 `@tanstack/vue-virtual`（如未安装）
  - 在以下3个admin列表页中集成虚拟滚动：
    - `EventListView.vue` — 活动列表（可能大量数据）
    - `UserListView.vue` — 用户列表
    - `TicketListView.vue` — 电子票列表
  - 使用 `useVirtualizer` hook渲染表格行
  - 保留shadcn-vue `Table` 的样式和结构

  **Must NOT do**:
  - 不改变现有分页逻辑（虚拟滚动+分页共存）
  - 不修改其他11个admin列表页（仅限3个指定页面）
  - 如shadcn-vue Table与虚拟滚动冲突→回退，在evidence中记录原因

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: 前端UI性能优化，涉及表格渲染
  - **Skills**: [`vue-best-practices`, `shadcn-vue`]
    - `vue-best-practices`: Vue 3组合式API
    - `shadcn-vue`: shadcn-vue Table组件集成

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 13)

  **References**:
  - `src/views/admin/EventListView.vue` — 活动列表页
  - `src/views/admin/UserListView.vue` — 用户列表页
  - `src/views/admin/TicketListView.vue` — 电子票列表页
  - `@tanstack/vue-virtual` 官方文档: https://tanstack.com/virtual/latest

  **Acceptance Criteria**:
  - [ ] 3个列表页使用 `useVirtualizer` 渲染行
  - [ ] `npm run type-check` 通过
  - [ ] 列表功能和交互保持不变

  **QA Scenarios**:

  ```
  Scenario: npm run ci通过
    Tool: Bash
    Steps:
      1. npm run ci → assert exit code 0
    Expected Result: 全部门禁通过
    Evidence: .sisyphus/evidence/task-10-ci.txt
  ```

  **Commit**: YES（每个页面独立commit）
  - Message: `perf(admin): add virtual scrolling to {PageName}`
  - Files: 对应的vue文件

- [x] 11. 将EventEditView中3个Tab改为异步加载

  **What to do**:
  - `EventEditView.vue` 中 `BasicTab`、`ParticipantsTab`、`InfoTab` 当前为静态import
  - 改为 `defineAsyncComponent(() => import(...))` 延迟加载
  - 添加加载占位符（`<Suspense>` 或 loading component）
  - 确保快速切换Tab时无竞态条件

  **Must NOT do**:
  - 不修改 `SessionsAndTicketsTab` 和 `ServicesTab`（它们已是异步）
  - 不修改Tab内容或功能
  - 不在Tab切换时丢失表单状态

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 3个import改为异步，加loading状态
  - **Skills**: [`vue-best-practices`, `shadcn-vue`]
    - `vue-best-practices`: defineAsyncComponent使用
    - `shadcn-vue`: Tabs组件集成

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 12, 13)

  **References**:
  - `src/views/admin/EventEditView.vue:16-21` — 已有 `defineAsyncComponent` 示例（SessionsAndTicketsTab, ServicesTab）
  - `src/views/admin/EventEditView.vue:8-10` — 当前静态import的BasicTab/ParticipantsTab/InfoTab

  **Acceptance Criteria**:
  - [ ] BasicTab、ParticipantsTab、InfoTab使用 `defineAsyncComponent`
  - [ ] `npm run build` 确认Tab被拆分为独立chunk
  - [ ] `npm run ci` 通过

  **QA Scenarios**:

  ```
  Scenario: 构建确认chunk拆分
    Tool: Bash
    Steps:
      1. npm run build
      2. ls dist/assets/ | grep -i 'BasicTab\|ParticipantsTab\|InfoTab' → assert有对应chunk文件
    Expected Result: 3个Tab被拆分为独立chunk
    Evidence: .sisyphus/evidence/task-11-chunks.txt

  Scenario: npm run ci通过
    Tool: Bash
    Steps:
      1. npm run ci → assert exit code 0
    Expected Result: 所有质量门禁通过
    Evidence: .sisyphus/evidence/task-11-ci.txt
  ```

  **Commit**: YES
  - Message: `perf(admin): lazy-load BasicTab, ParticipantsTab, InfoTab in EventEditView`
  - Files: `src/views/admin/EventEditView.vue`

- [x] 12. 改善9个空catch块（添加错误日志）

  **What to do**:
  为以下文件中的空 `catch {}` 块添加最小错误处理（`console.error`）：
  1. `ImageUpload.vue:131` — `console.error('[ImageUpload] Upload failed:', error)`
  2. `ScanCheckinDialog.vue:104` — `console.error('[ScanCheckin] Scan failed:', error)`
  3. `ScanCheckinDialog.vue:150` — `console.error('[ScanCheckin] Scanner cleanup failed:', error)`
  4. `useLoginPage.ts:62` — `console.error('[useLoginPage] Send code failed:', error)`
  5. `useLoginPage.ts:87` — `console.error('[useLoginPage] Login failed:', error)`
  6. `useAppConfirmDialog.ts:90` — 添加注释 `// 对话框保持打开，允许重试`（此catch是有意为之）
  7. `useHeaderState.ts:101` — `console.error('[useHeaderState] Logout failed:', error)`
  8. `useAvatarUpload.ts:35` — `console.error('[useAvatarUpload] Upload failed:', error)`
  9. `usePassengerForm.ts:75` — `console.error('[usePassengerForm] Mutation failed:', error)` + 保留注释

  **Must NOT do**:
  - 不修改catch之外的逻辑
  - 不改变错误处理流程（仅添加日志，不添加toast/弹窗等用户可见反馈）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 7文件9处添加console.error
  - **Skills**: [`vue-best-practices`]
    - `vue-best-practices`: 了解Vue项目错误处理模式

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 13)

  **References**:
  - `src/api/request.ts:125` — 正确的catch处理示例（chain到handleRequestError）

  **Acceptance Criteria**:
  - [ ] 所有9个catch块至少有 `console.error` 或明确注释说明
  - [ ] `npm run lint:check` 零新增warning

  **QA Scenarios**:

  ```
  Scenario: lint检查通过且console.error格式正确
    Tool: Bash
    Steps:
      1. npm run lint:check → assert exit code 0
      2. grep -rn 'catch {' src/components/ImageUpload.vue src/components/features/admin-ticket/ScanCheckinDialog.vue src/composables/auth/useLoginPage.ts src/composables/common/useAppConfirmDialog.ts src/composables/common/useHeaderState.ts src/composables/profile/useAvatarUpload.ts src/composables/profile/usePassengerForm.ts | wc -l → 确认9个catch块
    Expected Result: lint通过，所有catch块有日志或注释
    Evidence: .sisyphus/evidence/task-12-catch.txt
  ```

  **Commit**: YES
  - Message: `fix(error): add console.error to empty catch blocks across 7 files`
  - Files: 7个文件

- [x] 13. 为useWorkOrderChat.ts添加回调清理机制

  **What to do**:
  - 在 `useWorkOrderChat.ts` 中添加：
    - `offReconnect(callback)` — 从 `reconnectCallbacks` 数组中移除指定callback
    - `offError(callback)` — 从 `errorCallbacks` 数组中移除指定callback
  - 返回对象中添加 `offReconnect` 和 `offError` 方法
  - 确保 `onReconnect` 返回移除函数（符合Vue convention）

  **Must NOT do**:
  - 不改变回调的调用语义（所有注册的回调仍会被调用）
  - 不修改WebSocket连接逻辑
  - 不将单例模式改为多实例

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件添加2个cleanup方法
  - **Skills**: [`vue-best-practices`]
    - `vue-best-practices`: Vue composable lifecycle管理

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12)

  **References**:
  - `src/composables/common/useWorkOrderChat.ts:53` — `reconnectCallbacks` 数组
  - `src/composables/common/useWorkOrderChat.ts:54` — `errorCallbacks` 数组
  - `src/composables/common/useWorkOrderChat.ts:253-258` — 单例模式

  **Acceptance Criteria**:
  - [ ] `useWorkOrderChat()` 返回对象包含 `offReconnect` 和 `offError`
  - [ ] `onReconnect` 返回一个清理函数（调用offReconnect）
  - [ ] `npm run type-check` 通过

  **QA Scenarios**:

  ```
  Scenario: 类型检查和lint检查通过
    Tool: Bash
    Steps:
      1. npm run type-check → assert exit code 0
      2. npm run lint:check → assert exit code 0
    Expected Result: 类型检查和lint均通过
    Evidence: .sisyphus/evidence/task-13-check.txt
  ```

  **Commit**: YES
  - Message: `feat(websocket): add offReconnect/offError cleanup methods to useWorkOrderChat`
  - Files: `src/composables/common/useWorkOrderChat.ts`

---

## Final Verification Wave

> 4个review agent并行运行。ALL必须APPROVE。展示综合结果并等待用户明确"okay"后方可标记完成。

- [x] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
      Run `npm run ci` (type-check + lint + oxlint + audit + openapi + test + format + build). Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
      Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.
      Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.
      Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: 每个任务独立commit，格式 `chore(scope): desc` 或 `fix(scope): desc`
- **Wave 2**: 每个任务独立commit
- **Wave 3**: 每个任务独立commit

---

## Success Criteria

### Verification Commands

```bash
npm run ci                    # 完整质量门禁
npm run build                 # 生产构建 + bundle大小对比
npm run lint:check            # ESLint零错误
npm run type-check            # vue-tsc零错误
```

### Final Checklist

- [ ] 所有 "Must Have" 满足
- [ ] 所有 "Must NOT Have" 未触犯
- [ ] `npm run ci` 全绿
- [ ] bundle不增反减（或持平）
- [ ] 所有Playwright冒烟测试通过
