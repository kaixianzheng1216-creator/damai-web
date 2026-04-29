<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import AdminFormDialog from '@/components/admin/LazyAdminFormDialog'
import DataTableCrud from '@/components/admin/DataTableCrud.vue'
import { createAdminColumns } from '@/components/admin/listPageColumns'
import { Input } from '@/components/common/ui/input'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { fetchAdminPage, createAdmin, updateAdmin, updateAdminStatus } from '@/api/account/admin'
import type { AdminVO, AdminCreateRequest, AdminUpdateRequest } from '@/api/account'
import { USER_STATUS, queryKeys } from '@/constants'

const queryClient = useQueryClient()
const currentPage = ref(1)
const pageSize = ref(10)
const searchUsername = ref('')
const searchMobile = ref('')

const queryKey = computed(() => [
  ...queryKeys.admin.list('admins'),
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

const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('admins') })

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
  const newStatus = row.status === USER_STATUS.NORMAL ? USER_STATUS.BANNED : USER_STATUS.NORMAL
  statusMutation.mutate({ id: row.id, status: newStatus })
}

const columns = createAdminColumns({ openEdit, toggleStatus })
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
          aria-label="搜索管理员用户名"
          @input="handleSearch"
        />
        <Input
          v-model="searchMobile"
          placeholder="搜索手机号"
          class="h-8 w-36"
          aria-label="搜索管理员手机号"
          @input="handleSearch"
        />
      </div>
    </template>
  </DataTableCrud>

  <AdminFormDialog
    v-if="showDialog"
    v-model:open="showDialog"
    :title="dialogTitle"
    description="维护管理员手机号、用户名和头像"
    :is-saving="createMutation.isPending.value || updateMutation.isPending.value"
    @submit="handleSubmit"
  >
    <div class="grid gap-4">
      <div class="grid gap-2">
        <label for="admin-mobile" class="text-sm font-medium">
          手机号 <span class="text-destructive">*</span>
        </label>
        <Input
          id="admin-mobile"
          v-model="form.mobile"
          placeholder="请输入手机号"
          type="tel"
          :disabled="!!editingId"
        />
      </div>
      <div class="grid gap-2">
        <label for="admin-username" class="text-sm font-medium">用户名</label>
        <Input id="admin-username" v-model="form.username" placeholder="请输入用户名（可选）" />
      </div>
      <div v-if="editingId" class="grid gap-2">
        <label class="text-sm font-medium">头像</label>
        <ImageUpload
          v-model="form.avatarUrl"
          preview-alt="管理员头像预览"
          upload-label="上传管理员头像"
        />
      </div>
    </div>
  </AdminFormDialog>
</template>
