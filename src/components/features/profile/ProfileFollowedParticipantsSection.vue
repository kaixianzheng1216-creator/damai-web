<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { UserFollowParticipantVO } from '@/api/event'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import CardListItem from '@/components/common/CardListItem.vue'
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

const viewParticipantDetail = (participantId: string) => {
  router.push(`/participant/${participantId}`)
}

const handleUnfollowClick = (participantId: string) => {
  emit('toggle-follow', participantId)
}
</script>

<template>
  <DataTableCrud
    :data="paginatedParticipants"
    :current-page="page"
    :total-pages="totalPages"
    :page-size="pageSize || 10"
    :total-row="totalRow || 0"
    :show-create-button="false"
    @update:current-page="emit('update:page', $event)"
    @update:page-size="emit('update:pageSize', $event)"
    @row-click="(item) => viewParticipantDetail(item.participantId)"
  >
    <template #cardTemplate="{ data }">
      <div class="space-y-4">
        <template v-for="item in data" :key="item.id">
          <CardListItem v-if="item.participant" :to="'/participant/' + item.participantId">
            <template #cover>
              <Avatar class="aspect-square h-auto w-24">
                <AvatarImage :src="item.participant.avatarUrl || ''" alt="参与者头像" />
                <AvatarFallback>
                  <icon-lucide-user class="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </template>
            <template #title>
              <p class="line-clamp-1 text-sm font-bold text-foreground">
                {{ item.participant.name }}
              </p>
              <p
                v-if="item.participant.followCount != null"
                class="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <icon-lucide-users class="h-3 w-3 shrink-0" />{{ item.participant.followCount }}
                人关注
              </p>
            </template>
            <template #details>
              <p class="flex items-center gap-1 text-xs text-muted-foreground">
                <icon-lucide-clock class="h-3 w-3 shrink-0" />{{
                  formatDateTime(item.createAt, '-')
                }}
              </p>
            </template>
            <template #bottomRight>
              <Button
                variant="outline"
                size="sm"
                class="h-auto rounded px-3 py-1 text-xs"
                @click.stop="handleUnfollowClick(item.participantId)"
                >取消关注</Button
              >
            </template>
          </CardListItem>
        </template>
      </div>
    </template>
  </DataTableCrud>
</template>
