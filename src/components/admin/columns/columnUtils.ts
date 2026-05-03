import { h, type VNode } from 'vue'
import { Badge } from '@/components/common/ui/badge'
import { Button } from '@/components/common/ui/button'
import { USER_STATUS } from '@/constants'

export type RowAction<T> = (row: T) => void

export interface CrudColumnActions<T> {
  openEdit: RowAction<T>
  handleDelete: RowAction<T>
}

export const stopAndRun = (event: Event, action: () => void) => {
  event.stopPropagation()
  action()
}

export const actionButton = (
  label: string,
  variant: 'default' | 'outline' | 'destructive',
  onClick: (event: Event) => void,
) => h(Button, { size: 'sm', variant, onClick }, () => label)

export const actionGroup = (buttons: (VNode | null)[]) =>
  h('div', { class: 'flex items-center gap-2' }, buttons.filter(Boolean))

export const editDeleteActions = <T>(row: T, { openEdit, handleDelete }: CrudColumnActions<T>) =>
  actionGroup([
    actionButton('编辑', 'outline', (event) => stopAndRun(event, () => openEdit(row))),
    actionButton('删除', 'destructive', (event) => stopAndRun(event, () => handleDelete(row))),
  ])

export const accountStatusBadge = (status: number) =>
  h(
    Badge,
    { variant: 'outline' },
    { default: () => (status === USER_STATUS.NORMAL ? '正常' : '封禁') },
  )

export const accountAvatarCell = (avatarUrl: string | undefined, alt: string) =>
  avatarUrl
    ? h('img', {
        src: avatarUrl,
        alt,
        class: 'h-8 w-8 rounded-full object-cover',
      })
    : null
