<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type ColumnDef } from '@tanstack/vue-table'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Badge } from '@/components/common/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/common/ui/dialog'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { fetchAdminPage, createAdmin, updateAdmin, updateAdminStatus } from '@/api/account/admin'
import type { AdminVO, AdminCreateRequest, AdminUpdateRequest } from '@/api/account'

const queryClient = useQueryClient()
const currentPage = ref(1)
const pageSize = ref(10)
const searchUsername = ref('')
const searchMobile = ref('')

const columns: ColumnDef<AdminVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
  },
  {
    accessorKey: 'avatarUrl',
    header: '头像',
    size: 80,
    cell: ({ row }) =>
      row.original.avatarUrl
        ? h('img', { src: row.original.avatarUrl, class: 'h-8 w-8 rounded-full object-cover' })
        : null,
  },
  {
    accessorKey: 'username',
    header: '用户名',
  },
  {
    accessorKey: 'mobile',
    header: '手机号',
  },
  {
    accessorKey: 'status',
    header: '状态',
    size: 100,
    cell: ({ row }) =>
      h(
        Badge,
        { variant: 'outline' },
        { default: () => (row.original.status === 1 ? '正常' : '封禁') },
      ),
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
            variant: 'outline',
            size: 'sm',
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
            variant: row.original.status === 1 ? 'destructive' : 'default',
            size: 'sm',
            onClick: (e: Event) => {
              e.stopPropagation()
              toggleStatus(row.original)
            },
          },
          () => (row.original.status === 1 ? '封禁' : '解封'),
        ),
      ]),
  },
]

const queryKey = computed(() => [
  'admin-list',
  currentPage.value,
  pageSize.value,
  searchUsername.value,
  searchMobile.value,
])

const { data, isLoading } = useQuery({
  queryKey,
  queryFn: () =>
    fetchAdminPage({
      page: currentPage.value,
      size: pageSize.value,
      username: searchUsername.value || undefined,
      mobile: searchMobile.value || undefined,
    }),
})

const list = computed(() => data.value?.records ?? [])
const totalRow = computed(() => Number(data.value?.totalRow ?? 0))
const totalPages = computed(() => Number(data.value?.totalPage ?? 1))

const handleSearch = () => {
  currentPage.value = 1
}

const showDialog = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<AdminCreateRequest & AdminUpdateRequest>({
  mobile: '',
  username: '',
  avatarUrl: '',
})

const dialogTitle = computed(() => (editingId.value ? '编辑管理员' : '新建管理员'))

const resetForm = () => {
  form.mobile = ''
  form.username = ''
  form.avatarUrl = ''
}

const openCreate = () => {
  resetForm()
  editingId.value = null
  showDialog.value = true
}

const openEdit = (row: AdminVO) => {
  form.mobile = row.mobile
  form.username = row.username
  form.avatarUrl = row.avatarUrl
  editingId.value = row.id
  showDialog.value = true
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-list'] })

const createMutation = useMutation({
  mutationFn: (data: AdminCreateRequest) => createAdmin(data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: AdminUpdateRequest }) => updateAdmin(id, data),
  onSuccess: () => {
    invalidate()
    showDialog.value = false
  },
})

const statusMutation = useMutation({
  mutationFn: ({ id, status }: { id: string; status: number }) => updateAdminStatus(id, status),
  onSuccess: invalidate,
})

const handleSubmit = async () => {
  if (editingId.value) {
    await updateMutation.mutateAsync({
      id: editingId.value,
      data: {
        username: form.username || undefined,
        mobile: form.mobile || undefined,
        avatarUrl: form.avatarUrl || undefined,
      },
    })
  } else {
    if (!form.mobile) return
    await createMutation.mutateAsync({
      mobile: form.mobile,
      username: form.username || undefined,
    })
  }
}

const handleDelete = (_row: AdminVO) => {}

const toggleStatus = (row: AdminVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  statusMutation.mutate({ id: row.id, status: newStatus })
}
</script>

<template>
  <DataTableCrud
    :columns="columns"
    :data="list"
    :loading="isLoading"
    :current-page="currentPage"
    :total-pages="totalPages"
    :page-size="pageSize"
    :total-row="totalRow"
    title="管理员管理"
    @create="openCreate"
    @edit="openEdit"
    @delete="handleDelete"
    @update:current-page="currentPage = $event"
    @update:page-size="pageSize = $event"
  >
    <template #toolbar>
      <div class="flex flex-wrap items-center gap-2">
        <Input
          v-model="searchUsername"
          placeholder="搜索用户名"
          class="h-8 w-36"
          @input="handleSearch"
        />
        <Input
          v-model="searchMobile"
          placeholder="搜索手机号"
          class="h-8 w-36"
          @input="handleSearch"
        />
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
          <label class="text-sm font-medium">手机号 <span class="text-destructive">*</span></label>
          <Input
            v-model="form.mobile"
            placeholder="请输入手机号"
            type="tel"
            :disabled="!!editingId"
          />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">用户名</label>
          <Input v-model="form.username" placeholder="请输入用户名（可选）" />
        </div>
        <div v-if="editingId" class="grid gap-2">
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
