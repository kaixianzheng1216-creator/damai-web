# 代码风格指南

本文档定义了 damai-web 项目的代码风格规范。

## 目录

1. [命名规范](#命名规范)
2. [导入顺序](#导入顺序)
3. [组件结构](#组件结构)
4. [TypeScript 使用](#typescript-使用)
5. [样式规范](#样式规范)

---

## 命名规范

### 组件命名

- 使用 **PascalCase** 命名组件文件和组件名
- 示例: `UserProfile.vue`, `EventDetailView.vue`

### 变量和函数

- 使用 **camelCase** 命名变量和函数
- 示例: `userName`, `fetchUserData()`

### 常量

- **顶层导出常量** 使用 **UPPER_SNAKE_CASE**
- 示例:

  ```typescript
  export const PAGE_SIZE = 10
  export const API_BASE_URL = '/api'
  ```

- **配置对象** 内部属性使用 **camelCase**
- 示例:
  ```typescript
  export const AUTH_COPY = {
    loginTitle: '登录',
    loginButton: '立即登录',
  } as const
  ```

### Composables

- 使用 `use` 前缀，camelCase
- 示例: `useUserProfile.ts`, `useCheckoutPage.ts`

---

## 导入顺序

统一按照以下顺序分组导入，组之间用空行分隔：

### 1. 第三方库

```typescript
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'
```

### 2. 内部模块 (@/ 别名)

按功能顺序排列：

```typescript
import { fetchUser } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { useAuthSession } from '@/composables/common'
import { Button } from '@/components/common/ui/button'
```

### 3. 类型导入 (单独分组)

```typescript
import type { UserVO } from '@/api/user'
import type { Ref } from 'vue'
```

### 完整示例

```typescript
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'

import { fetchEvent } from '@/api/event'
import { useUserStore } from '@/stores/user'
import { useCountdown } from '@/composables/common'
import { Button } from '@/components/common/ui/button'

import type { EventVO } from '@/api/event'
```

---

## 组件结构

Vue 3 `<script setup>` 组件的统一结构顺序：

```vue
<script setup lang="ts">
// 1. 导入语句
// 2. defineProps
// 3. defineEmits / defineModel
// 4. ref / reactive / computed
// 5. composables 使用
// 6. watch / watchEffect
// 7. 事件处理函数
// 8. 其他逻辑
</script>

<template>
  <!-- 模板内容 -->
</template>
```

### Props 和 Emits 定义

- 优先使用 TypeScript 类型语法定义 props
- 示例:

  ```typescript
  const props = defineProps<{
    title: string
    count?: number
  }>()

  const emit = defineEmits<{
    'update:count': [value: number]
    close: []
  }>()
  ```

---

## TypeScript 使用

### Interface vs Type

- **对象类型定义** 优先使用 `interface`（便于扩展）

  ```typescript
  export interface User {
    id: string
    name: string
  }
  ```

- **联合类型、工具类型** 使用 `type`
  ```typescript
  export type Status = 'pending' | 'success' | 'error'
  export type PartialUser = Partial<User>
  ```

### Any 类型

- 避免使用 `any`，优先使用 `unknown` 并添加类型守卫
- 如需使用 `any`，必须添加注释说明原因

### 类型断言

- 谨慎使用类型断言 `as`
- 优先使用类型守卫或类型细化
- 示例:

  ```typescript
  // 不推荐
  const value = data as string

  // 推荐
  if (typeof data === 'string') {
    const value = data
  }
  ```

---

## 样式规范

### Tailwind CSS

- 优先使用 Tailwind CSS utility 类
- 避免内联样式
- 示例:

  ```vue
  <!-- 推荐 -->
  <div class="rounded-xl border border-border p-4">

  <!-- 避免 -->
  <div style="border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px;">
  ```

### 自定义 CSS

- 如需自定义 CSS，在 `@layer utilities` 中定义
- 文件位置: `src/styles/index.css`

### 响应式设计

- 使用统一的断点: `sm:`, `md:`, `lg:`, `xl:`
- 移动优先设计

### 共享工具类

项目已定义以下共享工具类：

- `.flex-center` - `flex items-center justify-center`
- `.text-muted-sm` - `text-sm text-muted-foreground`
- `.section-card` - `rounded-xl border border-border p-4`
- `.section-card-muted` - `rounded-xl border border-border bg-muted/20 p-4`

---

## 工具库使用

### VueUse

- 优先使用 VueUse 提供的功能，避免手造轮子
- 常用功能:
  - `useStorage` - 本地存储
  - `useDebounceFn` - 防抖
  - `useIntervalFn` - 定时器
  - `useNow` - 当前时间

### Day.js

- 使用 dayjs 处理所有日期时间格式化
- 避免手动日期计算

### Zod

- 使用 Zod 进行表单验证
- 验证模式定义在 `src/constants/validation.ts`

---

## 代码检查

### 自动检查

项目已配置以下工具自动检查代码风格：

- **Prettier** - 代码格式化
- **ESLint** - 代码质量检查
- **Oxlint** - 快速 lint 检查

### 运行检查

```bash
# 运行 lint 并自动修复
npm run lint

# 运行格式化
npm run format

# 类型检查
npm run type-check
```

---

## Git 提交

### 提交前检查

- Husky 会在提交前自动运行 lint 和 type-check
- 确保所有检查通过后再提交

### 提交信息规范

使用清晰的提交信息描述变更：

- `feat:` - 新功能
- `fix:` - 修复 bug
- `refactor:` - 重构
- `style:` - 代码格式调整
- `docs:` - 文档更新

---

## 参考资源

- [Vue 3 风格指南](https://cn.vuejs.org/style-guide/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
