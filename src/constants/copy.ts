export const TOAST_COPY = {
  // session
  sessionAdded: '场次添加成功',
  sessionAddFailed: '添加失败',
  sessionUpdated: '场次更新成功',
  sessionUpdateFailed: '更新失败',
  sessionDeleted: '场次删除成功',
  sessionDeleteFailed: '删除失败',
  fillSessionName: '请填写场次名称',
  fillAtLeastOneSession: '请至少填写一个场次名称',

  // ticket type
  ticketTypeCreated: '票种创建成功',
  ticketTypeCreateFailed: '创建失败',
  ticketTypeUpdated: '票种更新成功',
  ticketTypeUpdateFailed: '更新失败',
  ticketTypeDeleted: '票种删除成功',
  ticketTypeDeleteFailed: '删除失败',
  ticketTypesCopied: '票种复制成功',
  ticketTypesCopyFailed: '复制失败',
  fillCompleteInfo: '请填写完整信息',
  fillTotalQty: '请填写总库存',

  // services
  servicesSaved: '服务保障保存成功',
  servicesSaveFailed: '保存失败',
  serviceRemoved: '服务保障移除成功',
  serviceRemoveFailed: '移除失败',
  selectServiceOption: '请为每个选中的服务保障选择一个选项',

  // event basic
  eventCreated: '活动创建成功',
  eventCreateFailed: '创建失败',
  eventUpdated: '更新成功',
  eventUpdateFailed: '更新失败',

  // participants
  participantsAdded: '参与方添加成功',
  participantsAddFailed: '添加失败',
  participantsRemoved: '参与方移除成功',
  participantsRemoveFailed: '移除失败',

  // refund
  refundSubmitted: '退款申请已提交',
  refundFailed: '退款申请失败，请稍后重试',

  // checkout
  paymentCreateFailed: '创建支付失败，请重试',
  orderCancelFailed: '取消订单失败，请重试',

  // event edit (publish / offline)
  eventPublished: '活动发布成功',
  eventPublishFailed: '发布失败',
  eventOfflined: '活动已下线',
  eventOfflineFailed: '下线失败',

  // event info
  infoSaved: '详情信息保存成功',
  infoSaveFailed: '保存失败',

  // inventory
  inventoryAdjusted: '库存调整成功',
  inventoryAdjustFailed: '调整失败',
  enterAdjustQty: '请输入调整数量',

  // copy dialog
  selectTargetSession: '请选择目标场次',

  // avatar
  avatarUploadFailed: '头像上传失败，请重试',
} as const

export const ADMIN_CRUD_COPY = {
  edit: '编辑',
  create: '新建',
  confirmDeleteTitle: '确认删除',
  confirmDeleteDescription: '确认删除该项目？',
} as const

export const TICKET_TYPE_COPY = {
  editTitle: '编辑票种',
  createTitle: '添加票种',
} as const

export const CONFIRM_COPY = {
  delete: '确认删除',
  remove: '确认移除',
} as const

export const FORM_COPY = {
  sessionAddFailedRetry: '添加失败，请重试',
  sessionUpdateFailedRetry: '更新失败，请重试',
  fillSessionName: '请填写场次名称',
  fillAtLeastOneSession: '请至少填写一个场次名称',
  ticketTypeCreateFailedRetry: '创建失败，请重试',
  ticketTypeUpdateFailedRetry: '更新失败，请重试',
  fillTicketTypeNameAndPrice: '请填写票种名称和有效售价',
  fillTotalQtyError: '请填写大于 0 的总库存',
  adjustFailedRetry: '调整失败，请重试',
  enterNonZeroAdjustQty: '请输入非 0 的调整数量',
} as const
