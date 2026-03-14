# UI 设计图转代码提示词

### 核心约束条件：

1. **仅提取结构与布局**：请重点分析图片中的页面骨架、组件层级、排版布局（如左右分布、上下结构）以及元素间的空间关系。
2. **完全忽略颜色与特殊视觉样式**：**绝对不要**从图片中提取任何具体的颜色值（Hex/RGB）、阴影或特殊字体样式进行硬编码。请统一使用项目默认的 `TDesign` 主题色或 `Tailwind CSS` 的中性色（如 `text-gray-900`, `text-gray-500`, `bg-white` 等）。
3. **UI 组件库映射 (TDesign)**：
   - 识别图片中的交互元素（按钮、输入框、表格、标签等），并**强制使用** `TDesign Vue Next` 的内置组件。
   - **Skill & MCP 使用要求**：在生成代码前，**必须**调用 `ui-ux-pro-max` Skill 或 TDesign MCP 工具来查询组件的确切用法和可用 Icon 图标。确保使用的是**真实存在**的组件属性和图标名称（如 `t-icon-user` vs `user-circle`），严禁凭空臆造组件 API。
4. **使用 Tailwind 布局**：页面的宏观布局和组件间的微观间距，请全部使用 `Tailwind CSS` 原子类（如 `flex`, `grid`, `gap-4`, `p-6`, `justify-between` 等）来实现，禁止手写自定义的 `<style>`。
5. **Mock 数据与图片占位符**：
   - **Mock 数据**：如果页面需要展示列表或详细信息，请将模拟数据（数组/对象）单独抽离到 `mock` 目录下的 `.ts` 文件中，不要在组件内部写死大量静态数据。组件内通过 API 请求获取。
   - **图片占位符**：所有图片资源（Banner、头像、商品图等）请统一使用 `https://placehold.jp` 生成的占位图链接。
     - 格式：`https://placehold.jp/{width}x{height}.png`
     - 示例：`https://placehold.jp/300x200.png` (宽300px 高200px)
     - 带文字示例：`https://placehold.jp/300x200.png?text=Banner`
6. **技术栈要求**：使用 Vue 3 `<script setup lang="ts">` 语法，遵循响应式最佳实践。
