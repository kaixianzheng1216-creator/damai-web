# 文案集中管理 - 发现记录

## 重复的 toast / form 文案

以下文案在多个 composable 中出现相同文本，但语义场景不同，当前按场景拆分为独立常量以保持精确性。后续可考虑统一为通用常量：

- `"添加失败"` — useSessionList (sessionAddFailed)、useEventParticipantsTab (participantsAddFailed)、useTicketTypeDialog (ticketTypeCreateFailed)
- `"更新失败"` — useSessionList (sessionUpdateFailed)、useTicketTypeDialog (ticketTypeUpdateFailed)
- `"删除失败"` — useSessionList (sessionDeleteFailed)、useSessionsAndTicketsTab (ticketTypeDeleteFailed)
- `"保存失败"` — useEventServicesTab (servicesSaveFailed)、useEventInfoTab (infoSaveFailed)
- `"创建失败"` — useEventBasicTab (eventCreateFailed)、useTicketTypeDialog (ticketTypeCreateFailed)
- `"请填写完整信息"` — useEventBasicTab (fillCompleteInfo)、useTicketTypeDialog (fillCompleteInfo)

## 文件变更

- 新建 `src/constants/copy.ts`，导出 `TOAST_COPY`、`FORM_COPY`、`COMMON_COPY`
- 更新 `src/constants/index.ts` 追加 `export * from './copy'`
- 迁移 13 个 composable 中的 47 处 toast 调用 + 10 处 form error 文案到常量引用
