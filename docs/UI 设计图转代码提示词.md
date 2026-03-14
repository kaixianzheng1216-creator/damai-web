# UI 设计图转代码提示词

### 核心约束条件：

1. **仅提取结构与布局**：请重点分析图片中的页面骨架、组件层级、排版布局（如左右分布、上下结构）以及元素间的空间关系。
2. **完全忽略颜色与特殊视觉样式**：**绝对不要**从图片中提取任何具体的颜色值（Hex/RGB）、阴影或特殊字体样式进行硬编码。请统一使用项目默认的 `Tailwind CSS` 语义化类名（如 `text-foreground`, `text-muted-foreground`, `bg-background` 等）或 `shadcn-vue` 的预设样式。
3. **UI 组件库映射 (shadcn-vue)**：
   - 识别图片中的交互元素（按钮、输入框、表格、标签等），优先使用 `shadcn-vue` 提供的基础组件。
   - 如果图片中存在项目中尚未安装的 `shadcn-vue` 组件，请在代码注释中注明需要通过 `npx shadcn-vue@latest add [component-name]` 安装。
4. **使用 Tailwind v4 布局**：页面的宏观布局和组件间的微观间距，请全部使用 `Tailwind CSS v4` 原子类（如 `flex`, `grid`, `gap-4`, `p-6`, `justify-between` 等）来实现，禁止使用 `<style>` 块。
5. **Mock 数据与图片占位符**：
   - **Mock 数据**：将展示用的模拟数据（数组/对象）单独抽离到 `mock` 目录下的 `.ts` 文件中，不要在组件内部写死。组件内通过 API 请求获取并配合 `Vue Query` 管理。
   - **图片占位符**：所有图片资源（Banner、头像、商品图等）请统一使用 `https://placehold.jp` 生成的占位图链接。
     - 格式：`https://placehold.jp/{width}x{height}.png`
     - 示例：`https://placehold.jp/300x200.png`
6. **技术栈要求**：
   - 框架：Vue 3 `<script setup lang="ts">`。
   - 图标：优先使用 `Lucide Icons` (lucide-vue-next)。
   - 状态管理：Pinia。
   - 数据请求：Axios + TanStack Vue Query。
   - 样式工具：使用 `cn` 函数处理动态类名。
