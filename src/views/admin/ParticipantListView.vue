<script setup lang="ts">
import { ref, reactive, computed, h, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ImageUpload from '@/components/common/ImageUpload.vue'
import {
  fetchAdminParticipantsPage,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from '@/api/event/participant'
import type { ParticipantVO, ParticipantCreateRequest, ParticipantUpdateRequest } from '@/api/event'

const queryClient = useQueryClient()

const columns: ColumnDef<ParticipantVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => String(row.getValue('id')),
  },
  {
    accessorKey: 'name',
    header: '名称',
    cell: ({ row }) => String(row.getValue('name')),
  },
  {
    accessorKey: 'avatarUrl',
    header: '头像URL',
    cell: ({ row }) => {
      const avatarUrl = row.getValue('avatarUrl') as string
      return h('div', { class: 'flex items-center gap-2' }, [
        avatarUrl
          ? h('img', {
              src: avatarUrl,
              alt: row.original.name,
              class: 'h-8 w-8 rounded-full object-cover border border-border',
            })
          : null,
        h(
          'span',
          { class: 'text-sm text-muted-foreground truncate max-w-[200px]' },
          avatarUrl || '-',
        ),
      ])
    },
  },
  {
    id: 'actions',
    header: '操作',
    size: 160,
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: (e: Event) => {
              e.stopPropagation()
              openEdit(row.original)
            },
          },
          () => '编辑',
        ),
        h(
          Button,
          {
            size: 'sm',
            variant: 'destructive',
            onClick: (e: Event) => {
              e.stopPropagation()
              handleDelete(row.original)
            },
          },
          () => '删除',
        ),
      ]),
  },
]

const currentPage = ref(1)
const pageSize = ref(10)
const searchName = ref('')

const queryKey = computed(() => ['admin-participants', currentPage.value, pageSize.value, searchName.value])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () => fetchAdminParticipantsPage({ page: currentPage.value, size: pageSize.value, name: searchName.value || undefined }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<ParticipantCreateRequest & ParticipantUpdateRequest>({
  name: '',
  avatarUrl: '',
})

const dialogTitle = computed(() => (editingId.value ? '编辑参与方' : '新建参与方'))

const resetForm = () => {
  form.name = ''
  form.avatarUrl = ''
}

const openCreate = () => {
  resetForm()
  editingId.value = null
  showDialog.value = true
}

const openEdit = (row: ParticipantVO) => {
  form.name = row.name
  form.avatarUrl = row.avatarUrl
  editingId.value = row.id
  showDialog.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-participants'] })

watch(searchName, () => { currentPage.value = 1 })

const createMutation = useMutation({
  mutationFn: (data: ParticipantCreateRequest) => createParticipant(data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: ParticipantUpdateRequest }) =>
    updateParticipant(id, data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string) => deleteParticipant(id),
  onSuccess: invalidate,
})

const handleSubmit = async () => {
  if (editingId.value) {
    await updateMutation.mutateAsync({
      id: editingId.value,
      data: {
        name: form.name || undefined,
        avatarUrl: form.avatarUrl || undefined,
      },
    })
  } else {
    if (!form.name) return
    await createMutation.mutateAsync({
      name: form.name,
      avatarUrl: form.avatarUrl || undefined,
    })
  }
}

const handleDelete = (row: ParticipantVO) => {
  deleteMutation.mutate(row.id)
}
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    :total-row="totalRow"
    :total-pages="totalPages"
    :current-page="currentPage"
    :page-size="pageSize"
    title="参与方管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex items-center gap-2">
        <Input v-model="searchName" placeholder="搜索参与方名称" class="h-8 w-48" />
      </div>
    </template>
  </DataTableCrud>

  <Dialog :open="showDialog" @update:open="(v) => !v && (showDialog = false)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label class="text-sm font-medium">名称 <span class="text-destructive">*</span></label>
          <Input v-model="form.name" placeholder="请输入参与方名称" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">头像</label>
          <ImageUpload v-model="form.avatarUrl" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showDialog = false">取消</Button>
        <Button
          :disabled="createMutation.isPending.value || updateMutation.isPending.value"
          @click="handleSubmit"
        >
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
