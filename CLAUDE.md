# CLAUDE.md

该文件为在本项目中进行代码开发时的 Claude Code (claude.ai/code) 提供指南。

## 项目概览

这是一个名为 **damai-web** 的高性能大麦网票务平台前端应用，基于 Vue 3 + Vite + TypeScript 构建。

## 核心技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite 6
- **语言**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 5
- **UI 组件**: shadcn-vue (New York 风格) + Lucide Icons
- **样式**: Tailwind CSS v4
- **数据获取**: Axios + TanStack Vue Query v5
- **验证**: Zod
- **代码规范**: ESLint + Oxlint + Prettier

## 常用命令

- **安装依赖**: `npm install`
- **启动开发服务器**: `npm run dev`
- **构建生产环境版本**: `npm run build`
- **类型检查**: `npm run type-check`
- **Lint 与代码修复**: `npm run lint`
- **代码格式化**: `npm run format`

## 项目结构

```text
src/
├── api/            # API 请求定义与类型（按领域划分）
├── components/     # UI 组件
│   ├── common/ui/  # shadcn-vue 基础组件
│   └── common/     # 公共业务组件
├── composables/    # 可复用的组合式函数 (Composables)
├── constants/      # 全局常量
├── layouts/        # 页面布局
├── lib/            # 工具库 (shadcn/ui 依赖)
├── router/         # 路由配置
├── stores/         # Pinia 状态管理 (user.ts, admin.ts)
├── styles/         # 全局样式
├── types/          # 全局 TypeScript 类型定义
├── utils/          # 工具函数
└── views/          # 页面组件
```

## 关键架构特性

### 1. API 层 (`src/api/`)

- 集中化的 API 请求，按业务领域（活动、票务、交易、账户等）组织。
- 使用在 `src/api/request.ts` 中配置的 Axios 实例及其拦截器。
- **身份验证**:
  - 前端用户端点: `/front/*` 使用 `Authorization-User` 请求头。
  - 管理后台端点: `/admin/*` 使用 `Authorization-Admin` 请求头。
- 支持日期时间字段自动转换（datetime-local → ISO 8601）。
- 支持分页字段自动转换（字符串 → 数字）。
- 包含 Toast 通知错误处理。
- 基于 Token 的验证，身份验证失败（代码 10002）时会自动重定向到登录页。

### 2. 路由 (`src/router/index.ts`)

- 两套主要布局系统：
  - `MainLayout.vue`: 用于前端用户页面。
  - `AdminLayout.vue`: 用于后台管理页面。
- 路由守卫：
  - `requiresAuth`: 用于需要用户身份验证的页面。
  - `requiresAdmin`: 用于需要管理员身份验证的页面。

### 3. 状态管理 (`src/stores/`)

- `user.ts`: 前端用户状态（Token、用户信息等）。
- `admin.ts`: 管理员用户状态（AdminToken、管理员信息等）。

### 4. 自动导入配置

本项目使用 `unplugin-auto-import` 和 `unplugin-vue-components` 实现自动导入：

- 自动导入的 API: Vue, Vue Router, Pinia, @vueuse/core, TanStack Query, Zod, clsx, tailwind-merge。
- 自动导入的目录: `src/utils`, `src/composables`, `src/api`, `src/stores`。
- 图标: 通过 `icon-` 前缀使用 `unplugin-icons` 自动导入。
- 自动生成的类型定义: `src/types/auto-imports.d.ts`, `src/types/components.d.ts`。

### 5. TanStack Vue Query 配置

- 默认缓存过期时间 (stale time): 5 分钟。
- 默认垃圾回收时间 (GC time): 30 分钟。
- 窗口聚焦时重新获取数据 (refetch on window focus): 已禁用。

## 重要环境变量

- `VITE_API_BASE_URL`: API 基础路径（用于代理）。
- `VITE_API_TARGET_URL`: API 目标地址（用于代理）。

## 文档

API 文档位于 `docs/` 目录下，以 OpenAPI JSON 文件格式提供。

---

## 页面开发指南

### shadcn-vue 组件库使用

项目集成了 **shadcn-vue**（New York 风格），共有 **30 个基础组件**，位于 `src/components/common/ui/`。

#### 可用的 shadcn-vue 组件列表：

| 组件          | 说明                                |
| ------------- | ----------------------------------- |
| Alert Dialog  | 警告对话框                          |
| Avatar        | 头像组件                            |
| Badge         | 徽章组件                            |
| Breadcrumb    | 面包屑导航                          |
| Button        | 按钮组件（支持 variant、size 变体） |
| Calendar      | 日历组件                            |
| Card          | 卡片组件                            |
| Carousel      | 轮播组件                            |
| Chart         | 图表组件                            |
| Checkbox      | 复选框                              |
| Dialog        | 对话框                              |
| Dropdown Menu | 下拉菜单                            |
| Field         | 字段包装器                          |
| Input         | 输入框                              |
| Input OTP     | 一次性密码输入                      |
| Label         | 标签                                |
| Native Select | 原生选择框                          |
| Number Field  | 数字输入框                          |
| Pagination    | 分页                                |
| Popover       | 弹出框                              |
| Radio Group   | 单选组                              |
| Select        | 选择框                              |
| Separator     | 分隔线                              |
| Sheet         | 侧边抽屉                            |
| Sidebar       | 侧边栏                              |
| Skeleton      | 骨架屏                              |
| Table         | 表格                                |
| Tabs          | 标签页                              |
| Tooltip       | 工具提示                            |

#### Button 组件使用示例：

```vue
<script setup lang="ts">
import { Button } from '@/components/common/ui/button'
</script>

<template>
  <Button variant="default" size="default">默认按钮</Button>
  <Button variant="destructive">危险按钮</Button>
  <Button variant="outline">边框按钮</Button>
  <Button variant="ghost">幽灵按钮</Button>
  <Button variant="link">链接按钮</Button>
</template>
```

### 内部业务组件

项目封装了以下可复用的内部业务组件，位于 `src/components/common/`：

| 组件名                 | 文件路径                        | 用途                                                 |
| ---------------------- | ------------------------------- | ---------------------------------------------------- |
| **TheHeader**          | `TheHeader.vue`                 | 网站顶部导航栏（品牌标识、城市选择、搜索、用户菜单） |
| **HeaderCitySelector** | `header/HeaderCitySelector.vue` | 城市选择下拉菜单                                     |
| **HeaderSearchBar**    | `header/HeaderSearchBar.vue`    | 搜索栏组件                                           |
| **HeaderUserMenu**     | `header/HeaderUserMenu.vue`     | 用户菜单下拉组件                                     |
| **MobileBottomNav**    | `MobileBottomNav.vue`           | 移动端底部导航栏                                     |
| **ConfirmDialog**      | `ConfirmDialog.vue`             | 确认对话框（基于 AlertDialog 封装）                  |
| **DateTimePicker**     | `DateTimePicker.vue`            | 日期时间选择器                                       |
| **ImageUpload**        | `ImageUpload.vue`               | 图片上传组件（点击/拖拽上传、预览、更换、移除）      |
| **RichTextEditor**     | `RichTextEditor.vue`            | 富文本编辑器（基于 TipTap）                          |

管理后台专用组件（位于 `src/components/admin/`）：

| 组件名                | 用途                                      |
| --------------------- | ----------------------------------------- |
| **AdminSidebar**      | 管理后台侧边栏导航                        |
| **DataTableCrud**     | 数据表格 CRUD 组件（集成 TanStack Table） |
| **NavUser**           | 后台用户导航                              |
| **ScanCheckinDialog** | 扫码检票对话框                            |

### 页面编写模式与最佳实践

#### 1. 标准页面结构（前台页面）：

```vue
<script setup lang="ts">
import { useHomePage } from '@/composables/home/useHomePage'

// 业务逻辑完全封装在 Composable 中
const { data, isLoading, isError } = useHomePage()
</script>

<template>
  <div class="container mx-auto space-y-3 px-4 py-3 md:space-y-8 md:px-6 md:py-6">
    <!-- Loading 状态 -->
    <div v-if="isLoading" class="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <icon-lucide-loader2 class="h-10 w-10 animate-spin text-primary" />
      <p class="animate-pulse text-muted-foreground">加载中...</p>
    </div>

    <!-- Error 状态 -->
    <div v-else-if="isError" class="flex h-[60vh] items-center justify-center text-destructive">
      加载失败，请稍后重试
    </div>

    <!-- Success 状态 -->
    <template v-else>
      <!-- 页面内容 -->
    </template>
  </div>
</template>
```

#### 2. 管理后台列表页结构：

```vue
<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Button } from '@/components/common/ui/button'

// 定义表格列
const columns: ColumnDef<ItemVO>[] = [
  { accessorKey: 'id', header: 'ID', size: 100 },
  { accessorKey: 'name', header: '名称' },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          { variant: 'outline', size: 'sm', onClick: () => openEdit(row.original) },
          '编辑',
        ),
        h(
          Button,
          { variant: 'destructive', size: 'sm', onClick: () => handleDelete(row.original) },
          '删除',
        ),
      ]),
  },
]

// 使用 TanStack Query
const queryKey = computed(() => ['admin-items', currentPage.value])
const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () => fetchData(),
})
</script>
```

#### 3. 关键最佳实践：

- **Composables 优先**：业务逻辑完全封装在 `useXxx` 函数中，与 UI 分离
- **三态处理**：始终处理 `loading`、`error`、`success` 三种状态
- **TanStack Query**：用于服务端状态管理，提供缓存、重取、失效等功能
- **v-model 约定**：自定义组件统一使用 `modelValue` + `update:modelValue`
- **TypeScript 完整类型**：所有 Props、Emits、数据都有完整类型定义
- **响应式网格布局**：使用 Tailwind 的 `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` 等
- **组件化分解**：大页面拆分为多个功能单一的子组件

### 布局系统

项目包含三种布局：

| 布局            | 文件                          | 用途                                                |
| --------------- | ----------------------------- | --------------------------------------------------- |
| **MainLayout**  | `src/layouts/MainLayout.vue`  | 前台主布局（Header + Content + 移动端底部导航）     |
| **AdminLayout** | `src/layouts/AdminLayout.vue` | 管理后台布局（Sidebar + Header + Content + 面包屑） |
| **EmptyLayout** | `src/layouts/EmptyLayout.vue` | 空布局（登录页、错误页等）                          |

### 自动导入说明

项目配置了自动导入，以下内容无需手动 import：

- **API**：Vue、Vue Router、Pinia、@vueuse/core、TanStack Query、Zod、clsx、tailwind-merge
- **目录**：`src/utils`、`src/composables`、`src/api`、`src/stores` 下的所有导出
- **图标**：使用 `icon-lucide-xxx` 格式自动导入 Lucide 图标
- **类型定义**：自动生成到 `src/types/auto-imports.d.ts` 和 `src/types/components.d.ts`
