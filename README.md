# damai-web

高性能大麦网票务平台前端应用，基于 Vue 3、Vite、TypeScript、Pinia、Vue Router、TanStack Vue Query、shadcn-vue 与 Tailwind CSS 构建。

## 技术栈

- Vue 3 + Composition API + `<script setup>`
- Vite 6 + TypeScript
- Pinia + Vue Router
- Axios + TanStack Vue Query
- shadcn-vue + Lucide Icons
- Tailwind CSS v4
- Zod、ESLint、Oxlint、Prettier、Vitest

## 常用命令

```bash
npm install
npm run dev
npm run type-check
npm run lint:check
npm run lint:oxlint
npm run test
npm run format:check
npm run build
```

## 环境变量

- `VITE_API_BASE_URL`: 前端请求使用的 API 基础路径。
- `VITE_API_TARGET_URL`: Vite 开发代理转发目标。

## 项目结构

```text
src/
├── api/            # API 请求定义与类型
├── components/     # UI 与业务组件
├── composables/    # 组合式函数
├── constants/      # 全局常量与配置
├── layouts/        # 页面布局
├── router/         # 路由配置
├── stores/         # Pinia 状态
├── styles/         # 全局样式
├── types/          # 全局类型与生成声明
├── utils/          # 工具函数
└── views/          # 页面组件
```

## API 文档

OpenAPI 文档位于 `docs/` 目录。前端 API 层按领域拆分到 `src/api/*`，请求统一经过 `src/api/request.ts`。

认证请求头约定：

- 前台用户接口：`Authorization-User`
- 后台管理接口：`Authorization-Admin`

## 项目文档

- [当前 TODO 清单](<./TODO 清单 Version 3.md>)：下一阶段重构进度与验收标准。
- [Version 2 归档](<./TODO 清单 Version 2.md>)：已完成的阶段性重构记录。
- [架构说明](./docs/architecture.md)：API 层、Query Key、页面/composable/组件边界、错误处理与认证约定。
- [重构检查清单](./docs/refactor-checklist.md)：PR 或阶段性重构前后的检查项。
- [OpenAPI 使用说明](./docs/openapi-workflow.md)：接口文档来源、同步流程与契约校验策略。

## 开发约定

- 页面优先把业务逻辑放进 `composables`，视图层保持声明式。
- 服务端状态优先使用 TanStack Vue Query，并通过 `src/constants/queryKeys.ts` 维护 query key。
- 业务组件建议显式 import；自动导入范围主要保留基础工具、composable 与 shadcn-vue 基础组件。
- 新增页面需要处理 loading、error、success 三态。
- 提交前至少运行 `npm run ci`；小范围改动可先运行对应的 `type-check`、`lint:check`、`test` 子命令。
