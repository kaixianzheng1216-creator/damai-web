<script setup lang="ts">
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { type ColumnDef } from '@tanstack/vue-table'
import type { UserFollowParticipantVO } from '@/api/event'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/ui/avatar'
import { Card, CardHeader, CardTitle } from '@/components/common/ui/card'
import { Button } from '@/components/common/ui/button'
import { formatDateTime } from '@/utils/format'

defineProps<{
  paginatedParticipants: UserFollowParticipantVO[]
  page: number
  totalPages: number
  pageSize?: number
  totalRow?: number
}>()

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'toggle-follow': [participantId: string]
}>()

const router = useRouter()
const { viewMode } = useViewMode()

const viewParticipantDetail = (participantId: string) => {
  router.push(`/participant/${participantId}`)
}

const handleUnfollowClick = (participantId: string) => {
  emit('toggle-follow', participantId)
}

const columns: ColumnDef<UserFollowParticipantVO>[] = [
  {
    accessorKey: 'participant',
    header: '艺人',
    size: 200,
    cell: ({ row }) => {
      if (!row.original.participant) return '-'
      return h(
        'div',
        { class: 'flex items-center gap-2 cursor-pointer hover:text-primary' },
        {
          default: () => [
            h(
              Avatar,
              { class: 'h-8 w-8' },
              {
                default: () => [
                  h(AvatarImage, {
                    src: row.original.participant.avatarUrl,
                    alt: row.original.participant.name,
                  }),
                  h(AvatarFallback, () => row.original.participant.name.charAt(0)),
                ],
              },
            ),
            h('span', row.original.participant.name),
          ],
        },
      )
    },
  },
  {
    accessorKey: 'participant.followCount',
    header: '关注数',
    size: 120,
    cell: ({ row }) => row.original.participant?.followCount ?? '-',
  },
  {
    accessorKey: 'createAt',
    header: '关注时间',
    size: 180,
    cell: ({ row }) => formatDateTime(row.original.createAt, '-'),
  },
  {
    id: 'actions',
    header: '操作',
    size: 120,
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: (e: Event) => {
            e.stopPropagation()
            handleUnfollowClick(row.original.participantId)
          },
        },
        () => '取消关注',
      ),
  },
]
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="paginatedParticipants"
    :current-page="page"
    :total-pages="totalPages"
    :page-size="pageSize || 10"
    :total-row="totalRow || 0"
    :show-create-button="false"
    :view-mode="viewMode"
    @update:current-page="emit('update:page', $event)"
    @update:page-size="emit('update:pageSize', $event)"
    @row-click="(item) => viewParticipantDetail(item.participantId)"
  >
    <template #cardTemplate="{ data }">
      <div class="space-y-4">
        <Card
          v-for="item in data"
          :key="item.id"
          class="cursor-pointer hover:border-primary/50 transition-colors"
        >
          <CardHeader v-if="item.participant" class="py-3">
            <div class="flex items-center justify-between gap-2 w-full">
              <div class="flex items-center gap-3">
                <Avatar class="h-12 w-12">
                  <AvatarImage :src="item.participant.avatarUrl" :alt="item.participant.name" />
                  <AvatarFallback>{{ item.participant.name.charAt(0) }}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle class="text-base leading-tight">{{ item.participant.name }}</CardTitle>
                  <p
                    v-if="item.participant.followCount != null"
                    class="mt-1 text-sm text-muted-foreground"
                  >
                    {{ item.participant.followCount }} 人关注
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                @click.stop="handleUnfollowClick(item.participantId)"
              >
                取消关注
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </template>
  </DataTableCrud>
</template>
