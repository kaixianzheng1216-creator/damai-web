# TDesign 与 Tailwind CSS 协作规范

本项目采用了 **TDesign Vue Next** 作为基础 UI 组件库，结合 **Tailwind CSS** 作为原子化 CSS 引擎。为了保持代码整洁、可维护且风格统一，特制定以下协作开发规范。

## 核心分工

- **TDesign 负责“组件”与“交互”**：一切复杂的、带有交互逻辑的 UI 元素（如按钮、表单、表格、弹窗、下拉菜单等）均优先使用 TDesign 提供的现成组件。
- **Tailwind CSS 负责“布局”、“排版”与“微调”**：页面的整体布局、组件之间的间距、容器的大小、文字颜色和粗细等，均使用 Tailwind CSS 的原子类来实现，尽量避免手写自定义的 CSS。

## 最佳实践

### 1. 使用 Tailwind 布局，包裹 TDesign 组件

不要过度依赖 TDesign 的 `Row` / `Col` 栅格系统或布局组件（除非是整体的 App Shell Layout）。推荐使用 Tailwind 的 Flexbox 或 Grid 进行页面级别的布局。

**推荐 (Tailwind Flex/Grid 布局):**

```vue
<template>
  <div class="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-sm">
    <h2 class="text-xl font-bold text-gray-800">用户信息</h2>

    <div class="grid grid-cols-2 gap-4">
      <t-input placeholder="请输入姓名" />
      <t-input placeholder="请输入手机号" />
    </div>

    <div class="flex justify-end mt-4">
      <t-button theme="primary">保存提交</t-button>
    </div>
  </div>
</template>
```

### 2. 直接在 TDesign 组件上使用 Tailwind 类

Tailwind 的原子类可以直接写在 TDesign 组件的 `class` 属性上，用于调整外边距、宽度等外层样式。

**推荐:**

```vue
<template>
  <!-- 直接使用 w-full 撑满父容器，使用 mt-4 增加上边距 -->
  <t-button class="w-full mt-4" theme="primary" size="large"> 登录 </t-button>
</template>
```

### 3. 避免样式冲突与深层覆盖

TDesign 组件内部有自己的 DOM 结构和类名。

- **禁止**：尽量不要使用 `:deep()` 去强行修改 TDesign 内部的具体样式。
- **推荐**：如果必须修改，优先考虑 TDesign 提供的 `style` 属性、CSS 变量（CSS Variables）或者组件自带的 API（如 `row-class-name` 等）。

### 4. 颜色与主题统一

TDesign 有自己的一套 Design Token（CSS 变量，如 `--td-brand-color`）。
如果在 Tailwind 中需要用到与 TDesign 一致的颜色，建议在 `tailwind.config.js` (或 `vite.config.ts` 中的 tailwind 配置 / `app.css`) 中将 TDesign 的 CSS 变量映射为 Tailwind 的自定义颜色。

_在 Tailwind v4 体系中，可以在全局 CSS 中这样映射：_

```css
@theme {
  --color-primary: var(--td-brand-color);
  --color-primary-hover: var(--td-brand-color-hover);
  --color-success: var(--td-success-color);
  --color-error: var(--td-error-color);
}
```

这样你就可以在 HTML 中使用 `text-primary` 或 `bg-primary`，并保持与 TDesign 主题的完美一致。

## 注意事项

1. **不要重复造轮子**：Tailwind 很强大，但如果 TDesign 已经提供了一个开箱即用的组件（例如 Badge, Tag, Alert），请直接使用 TDesign 组件，不要用 Tailwind 手捏一个。
2. **Preflight 样式重置**：Tailwind 默认带有 `Preflight` 样式重置，TDesign 也有部分基础样式。通常它们能良好共存，但如果遇到某些原生标签（如 `h1`, `ul`, `button`）样式表现异常，请检查是否是 Tailwind 的默认重置导致的，并使用 Tailwind 工具类显式声明样式。
3. **响应式设计**：使用 Tailwind 的响应式前缀（`sm:`, `md:`, `lg:`）来控制布局的响应式变化，这比编写媒体查询或者使用 JS 监听屏幕宽度要优雅得多。
