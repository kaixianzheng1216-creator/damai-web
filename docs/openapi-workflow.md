# OpenAPI 使用说明

本文档说明 `docs/` 下 OpenAPI 文件的来源、同步方式，以及前端如何用它们约束 API 类型。

## 1. 文档来源

当前前端仓库以 `docs/` 目录下的 OpenAPI JSON 作为接口契约校验输入：

```text
docs/认证管理_OpenAPI.json
docs/账号管理_OpenAPI.json
docs/活动管理_OpenAPI.json
docs/交易管理_OpenAPI.json
docs/电子票管理_OpenAPI.json
docs/文件管理_OpenAPI.json
docs/AI 助手_OpenAPI.json
```

这些文件应从后端项目导出的最新 OpenAPI 文档同步而来。前端不直接修改 OpenAPI JSON 来“适配”代码；如果文档与后端实际响应不一致，应先确认后端行为，再在前端记录差异并补测试。

## 2. 同步流程

当后端接口发生变化时：

1. 从后端重新导出对应领域的 OpenAPI JSON。
2. 替换前端 `docs/` 下同名文件。
3. 对比 `src/api/<domain>/types.ts` 和 `src/api/<domain>/*.ts`。
4. 更新请求类型、响应类型和 API 函数。
5. 更新或新增 `src/api/__tests__/apiOpenApiContract.test.ts` 覆盖新增/变更端点。
6. 运行 `npm run test -- apiOpenApiContract`。
7. 运行 `npm run ci`。

不要只靠页面能跑来判断接口正确。接口路径、method、query 参数、request body、response schema 都应有契约测试兜底。

## 3. 当前类型策略

当前采用“手写类型 + 契约测试”的策略：

- 手写类型位于 `src/api/<domain>/types.ts`。
- API 函数位于 `src/api/<domain>/*.ts`。
- 契约测试读取 `docs/` 下 OpenAPI JSON，校验核心端点是否存在且 schema 关键字段一致。

V3 阶段继续采用方案 B：保留手写类型，但增加一条可重复的差异报告命令。

```bash
npm run openapi:report
```

该命令会扫描 `src/api` 中的 `request.*` 调用，并与 `docs/*_OpenAPI.json` 的 path/method 做对照：

- 前端已经调用但 OpenAPI 不存在的接口会直接失败。
- OpenAPI 中存在但前端尚未实现的接口会作为报告输出，不阻塞构建。

后续如果引入 OpenAPI 类型生成，仍建议保留契约测试和差异报告，至少覆盖核心链路，避免生成配置或文档漂移悄悄破坏业务。

## 4. ID 规范

后端 OpenAPI 里大量 ID 标为 `integer/int64`，但后端实际响应已将 Long ID 序列化为 string。前端统一按 string 处理：

- VO 的 `id`、`eventId`、`userId`、`ticketTypeId` 等 ID 字段声明为 `string`。
- 请求体中的 ID 保持 string 传递。
- 创建接口返回原始 Long/number/string 时使用 `normalizeEntityId` 转为 `string`。
- `requestTransforms.ts` 会递归兜底，把 ID 字段转为 string，把分页字段转为 number。

禁止把 ID 转成 number 后再传给 API。

## 5. 允许的文档差异

如果 OpenAPI 与后端实际序列化存在临时差异，必须满足三点：

- 在 `【接口清洁 TODO 清单】.md` 或相关文档中说明差异原因。
- 前端类型按后端实际响应处理。
- 有测试覆盖该差异，避免未来误改。

例如：ID 字段文档为 `integer/int64`，实际响应为 string，前端保留 string 并由 transform 兜底。

## 6. 新增接口检查项

新增或修改 API 时检查：

- [ ] `docs/` 中存在对应 path。
- [ ] method 与后端一致。
- [ ] query/path/body 参数完整。
- [ ] 响应类型包含页面需要的字段。
- [ ] ID 字段为 string。
- [ ] API 函数命名能表达前台/后台和业务动作，例如 `fetchAdminOrderPage`。
- [ ] Query 使用 `queryKeys`，Mutation 成功后失效正确缓存。
- [ ] `apiOpenApiContract.test.ts` 覆盖关键端点。
- [ ] `npm run openapi:report` 没有发现前端调用但文档缺失的接口。
