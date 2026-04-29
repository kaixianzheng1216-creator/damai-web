# 重构检查清单

每次新增页面、拆组件、迁移 API 或修改核心流程前后，都按此清单快速过一遍。

## 1. 范围与边界

- [ ] 只改本轮目标相关文件，没有顺手重构无关模块。
- [ ] 页面组件仍然只做编排，业务逻辑没有继续堆进 `views`。
- [ ] 新增复杂逻辑已进入 `composables/<domain>/useXxxPage|Dialog|Tab.ts`。
- [ ] 组件职责单一，props/emits 合同清晰且有类型。
- [ ] 没有在前台页面引入后台专用体验，除非已有明确通用抽象。

## 2. 数据请求与缓存

- [ ] 所有服务端状态使用 TanStack Vue Query。
- [ ] 所有 query key 来自 `src/constants/queryKeys.ts`。
- [ ] Mutation 成功后失效了正确的 query key。
- [ ] 弹窗数据只在弹窗打开时请求。
- [ ] 隐藏 tab、隐藏 section 不预取不必要数据。
- [ ] 搜索、筛选、分页变化会正确回到第一页。

## 3. API 与类型

- [ ] API 函数放在 `src/api/<domain>/`，页面没有直接写请求 URL。
- [ ] 请求参数和返回类型与 `docs/*_OpenAPI.json` 对齐。
- [ ] VO 中实体 ID 仍为 `string`。
- [ ] 没有新增 `Number(id)`、`parseInt(id)`、`+id` 等 ID 转 number 逻辑。
- [ ] 创建接口返回原始 ID 时使用 `normalizeEntityId`。
- [ ] 新增 OpenAPI 差异已补契约测试或记录原因。

## 4. UI 与可访问性

- [ ] 页面有 loading、error、success 三态。
- [ ] 表单控件有 `label for/id` 或 `aria-label`。
- [ ] 原生 `<button>` 都显式写了 `type`。
- [ ] 图片有业务化 `alt`；装饰图使用空 `alt`。
- [ ] Dialog 在小屏下不溢出视口，长内容内部滚动。
- [ ] 优先使用 shadcn-vue/Reka UI 控件，避免手写 checkbox/radio/select 行为。
- [ ] 图标优先使用 Lucide。

## 5. 性能与懒加载

- [ ] 富文本、扫码、图表、大弹窗、非首屏助手等重组件按需加载。
- [ ] `v-if` 用于昂贵或不常显示的内容；频繁切换且轻量的内容再考虑 `v-show`。
- [ ] 列表模板不做复杂过滤/排序，派生逻辑放到 computed。
- [ ] 新增图片资源经过压缩，避免首屏引入大图。

## 6. 测试

- [ ] 核心 composable 有单测覆盖提交、校验、缓存失效、路由同步。
- [ ] 关键组件 smoke test 覆盖能否 mount、关键文本、按钮事件、emit。
- [ ] API 契约变化已更新 `apiOpenApiContract.test.ts`。
- [ ] request transform 或状态映射变化已补纯函数测试。

## 7. 提交前命令

推荐直接运行：

```bash
npm run ci
```

小范围改动可先分段运行：

```bash
npm run type-check
npm run lint:check
npm run lint:oxlint
npm run test
npm run format:check
npm run build
```

涉及路由、懒加载、构建配置、自动导入、依赖变更时必须跑 `npm run build`。
