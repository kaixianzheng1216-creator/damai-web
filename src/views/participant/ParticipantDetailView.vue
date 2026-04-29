<script setup lang="ts">
import { useParticipantDetailPage } from '@/composables/participant/useParticipantDetailPage'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/common/ui/pagination'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/common/ui/avatar'
import { Button } from '@/components/common/ui/button'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import SearchResultListItem from '@/components/features/search/SearchResultListItem.vue'

const {
  participantQuery,
  eventsQuery,
  currentPage,
  handlePageChange,
  toggleFollow,
  isFollowed,
  isFollowLoading,
} = useParticipantDetailPage()
</script>

<template>
  <div class="container mx-auto px-4 py-6 md:px-6">
    <!-- 参与方信息 -->
    <div v-if="participantQuery.isLoading.value" class="flex min-h-[200px] flex-center">
      <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <ErrorState
      v-else-if="participantQuery.isError.value"
      class="min-h-[200px]"
      title="参与方加载失败"
      description="请稍后重试"
    />

    <template v-else-if="participantQuery.data.value">
      <section class="mb-8">
        <div
          class="flex items-center justify-between gap-6 rounded-lg border border-border bg-background p-6"
        >
          <div class="flex items-center gap-6">
            <Avatar class="h-24 w-24">
              <AvatarImage
                :src="participantQuery.data.value.avatarUrl"
                :alt="participantQuery.data.value.name"
              />
              <AvatarFallback class="text-2xl">{{
                participantQuery.data.value.name.charAt(0)
              }}</AvatarFallback>
            </Avatar>
            <div>
              <h1 class="text-2xl font-bold text-foreground">
                {{ participantQuery.data.value.name }}
              </h1>
              <p
                v-if="participantQuery.data.value.followCount != null"
                class="mt-2 text-sm text-muted-foreground"
              >
                {{ participantQuery.data.value.followCount }} 人关注
              </p>
            </div>
          </div>
          <Button
            :variant="isFollowed ? 'default' : 'outline'"
            size="sm"
            :disabled="isFollowLoading"
            @click="toggleFollow"
          >
            <icon-lucide-heart v-if="isFollowed" class="mr-1 h-4 w-4 fill-current" />
            <icon-lucide-heart v-else class="mr-1 h-4 w-4" />
            {{ isFollowed ? '已关注' : '关注' }}
          </Button>
        </div>
      </section>

      <!-- 相关活动列表 -->
      <section>
        <p class="mb-4 text-lg text-foreground">
          共
          <span class="px-1 text-primary">{{ eventsQuery.data.value?.totalRow ?? 0 }}</span>
          个相关活动
        </p>

        <div class="border border-border bg-background">
          <div v-if="eventsQuery.isLoading.value" class="flex min-h-[420px] flex-center">
            <icon-lucide-loader2 class="h-8 w-8 animate-spin text-primary" />
          </div>

          <ErrorState
            v-else-if="eventsQuery.isError.value"
            class="min-h-[420px]"
            title="活动加载失败"
            description="请稍后重试"
          />

          <EmptyState
            v-else-if="!eventsQuery.data.value?.records.length"
            class="min-h-[420px]"
            title="暂无相关活动"
          />

          <div v-else class="px-4">
            <SearchResultListItem
              v-for="item in eventsQuery.data.value.records"
              :key="item.id"
              :item="item"
              :show-participants="false"
            />
          </div>

          <Pagination
            v-slot="{ page }"
            :total="Number(eventsQuery.data.value?.totalRow ?? 0)"
            :items-per-page="10"
            :sibling-count="1"
            :default-page="1"
            :page="currentPage"
            @update:page="handlePageChange"
            class="justify-end border-t border-border py-5"
          >
            <PaginationContent v-slot="{ items }">
              <PaginationPrevious />
              <template v-for="(item, index) in items" :key="index">
                <PaginationItem v-if="item.type === 'page'" :value="item.value" as-child>
                  <Button :variant="item.value === page ? 'default' : 'outline'" size="sm">
                    {{ item.value }}
                  </Button>
                </PaginationItem>
                <PaginationEllipsis v-else :index="index" />
              </template>
              <PaginationNext />
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </template>
  </div>
</template>
