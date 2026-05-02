# 恢复后台 DataTableCrud 的表格渲染

## TL;DR

> `DataTableCrud.vue` 被之前卡片统一改造时移除了表格渲染，只保留卡片模式。所有后台管理页面本应是表格，现在全部显示为卡片。需要重新添加表格渲染作为默认模式。
>
> **Estimated Effort**: Short
> **Parallel Execution**: NO — 1 个文件修改

---

## Context

### 问题

- `DataTableCrud.vue` 当前只渲染 `TableCardView`（卡片）
- 14 个后台页面传递了 `:columns` prop + 列定义（含 header/cell），但这些被忽略了
- 用户的后台管理全部变成了卡片列表，体验不好

### 解决方案

在 `DataTableCrud.vue` 中添加条件分支：

- **表格模式**：当 `columns.length > 0` 时，渲染标准 HTML table（含 thead/tbody）
- **卡片模式**：当没有 columns 或有 `#cardTemplate` 时，渲染 `TableCardView`

---

## Execution Strategy

- [ ] **T1. 在 DataTableCrud.vue 中添加表格渲染**
      **What to do**:
  1. `src/components/admin/DataTableCrud.vue` — 在 `TableCardView` 前加入表格条件渲染
  2. 表格使用 Vue Table 的 `FlexRender`（项目已有 `@tanstack/vue-table`）
  3. 表格样式：`table-auto w-full border` + 表头行 `bg-muted` + 数据行 `border-t hover:bg-muted/50`
  4. 保留 `TableCardView` 作为卡片模式下使用

  **模板结构**:

  ```vue
  <!-- 表格模式：有 columns 时渲染 -->
  <template v-if="columns.length > 0">
    <div class="relative">
      <div
        v-if="loading"
        class="absolute inset-0 z-10 flex-center bg-background/60 backdrop-blur-sm"
      >
        <icon-lucide-loader2 class="h-6 w-6 animate-spin text-primary" />
      </div>
      <div class="overflow-auto" :class="{ 'opacity-60': loading }">
        <table class="w-full border">
          <thead>
            <tr
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class="bg-muted"
            >
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                class="px-4 py-3 text-left text-sm font-medium text-foreground"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="data.length">
              <tr
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                class="border-t hover:bg-muted/50 cursor-pointer"
                @click="emit('row-click', row.original)"
              >
                <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-4 py-3 text-sm">
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </td>
              </tr>
            </template>
            <tr v-else>
              <td :colspan="columns.length" class="px-4 py-16 text-center text-muted-foreground">
                <EmptyState class="min-h-0" title="暂无数据" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>

  <!-- 卡片模式：无 columns 时渲染 -->
  <TableCardView v-else>
    ...
  </TableCardView>
  ```

  **需要检查的依赖**:
  - `FlexRender` 已在 `TableCardView.vue` 中从 `@tanstack/vue-table` 导入 → confirm it's also in DataTableCrud imports
  - `EmptyState` 组件已在 `TableCardView.vue` 中使用 → 需要在 DataTableCrud 中导入

  **Acceptance Criteria**:
  - [x] 有 `:columns` 的后台页面渲染为标准 HTML 表格
  - [x] 无 `:columns` 但有 `#cardTemplate` 的页面仍渲染卡片（如工单列表）
  - [x] 表格支持排序（通过 Vue Table 已有）和行点击
  - [x] `npm run ci` 通过

---

## Success Criteria

- `npm run ci` 通过
- 14 个后台管理页面恢复表格视图
- 前台 profile 部分的卡片视图不受影响
