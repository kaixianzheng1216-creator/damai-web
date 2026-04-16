<script setup lang="ts">
import { ref, reactive, computed, h } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { type ColumnDef } from '@tanstack/vue-table'
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
import {
  fetchAdminServices,
  createService,
  updateService,
  deleteService,
  createServiceOption,
  updateServiceOption,
  deleteServiceOption,
} from '@/api/event/service'
import type {
  ServiceGuaranteeVO,
  ServiceGuaranteeOptionVO,
  ServiceGuaranteeCreateRequest,
  ServiceGuaranteeUpdateRequest,
  ServiceOptionCreateRequest,
  ServiceOptionUpdateRequest,
} from '@/api/event'

const queryClient = useQueryClient()

const serviceColumns: ColumnDef<ServiceGuaranteeVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
    cell: ({ row }) => {
      return h(
        'button',
        {
          class: 'font-mono text-xs text-primary hover:underline text-left',
          onClick: () => selectService(row.original),
        },
        row.original.id
      )
    },
  },
  {
    accessorKey: 'name',
    header: '服务名称',
    cell: ({ row }) => {
      return h(
        'button',
        {
          class: 'font-medium hover:text-primary text-left',
          onClick: () => selectService(row.original),
        },
        row.original.name
      )
    },
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
    size: 100,
  },
]

const optionColumns: ColumnDef<ServiceGuaranteeOptionVO>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 180,
  },
  {
    accessorKey: 'name',
    header: '选项名称',
  },
  {
    accessorKey: 'description',
    header: '描述',
  },
  {
    accessorKey: 'isBooleanType',
    header: '布尔类型',
    size: 100,
    cell: ({ row }) => {
      const isBoolean = row.original.isBooleanType === 1
      return h(
        'span',
        {
          class: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isBoolean ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`,
        },
        isBoolean ? '是' : '否'
      )
    },
  },
]

const { data, isLoading } = useQuery({
  queryKey: ['admin-services'],
  queryFn: fetchAdminServices,
})

const list = computed(() => data.value ?? [])
const selectedService = ref<ServiceGuaranteeVO | null>(null)
const currentOptions = computed(() => selectedService.value?.options ?? [])

const selectService = (row: ServiceGuaranteeVO) => {
  const fresh = list.value.find((s) => s.id === row.id)
  selectedService.value = fresh ?? row
}

const syncSelectedService = () => {
  if (!selectedService.value) return
  const fresh = list.value.find((s) => s.id === selectedService.value!.id)
  if (fresh) selectedService.value = fresh
}

const showServiceDialog = ref(false)
const editingServiceId = ref<string | null>(null)
const serviceForm = reactive<ServiceGuaranteeCreateRequest & ServiceGuaranteeUpdateRequest>({
  name: '',
  sortOrder: undefined,
})

const serviceDialogTitle = computed(() =>
  editingServiceId.value ? '编辑服务保障' : '新建服务保障',
)

const resetServiceForm = () => {
  serviceForm.name = ''
  serviceForm.sortOrder = undefined
}

const openCreateService = () => {
  resetServiceForm()
  editingServiceId.value = null
  showServiceDialog.value = true
}

const openEditService = (row: ServiceGuaranteeVO) => {
  serviceForm.name = row.name
  serviceForm.sortOrder = row.sortOrder
  editingServiceId.value = row.id
  showServiceDialog.value = true
}

const showOptionDialog = ref(false)
const editingOptionId = ref<string | null>(null)
const optionForm = reactive<ServiceOptionCreateRequest & ServiceOptionUpdateRequest>({
  name: '',
  description: '',
  isBooleanType: 0,
})

const optionDialogTitle = computed(() => (editingOptionId.value ? '编辑选项' : '新建选项'))

const resetOptionForm = () => {
  optionForm.name = ''
  optionForm.description = ''
  optionForm.isBooleanType = 0
}

const openCreateOption = () => {
  resetOptionForm()
  editingOptionId.value = null
  showOptionDialog.value = true
}

const openEditOption = (row: ServiceGuaranteeOptionVO) => {
  optionForm.name = row.name
  optionForm.description = row.description
  optionForm.isBooleanType = row.isBooleanType
  editingOptionId.value = row.id
  showOptionDialog.value = true
}

const invalidate = () => {
  queryClient.invalidateQueries({ queryKey: ['admin-services'] }).then(syncSelectedService)
}

const createServiceMutation = useMutation({
  mutationFn: (data: ServiceGuaranteeCreateRequest) => createService(data),
  onSuccess: () => {
    invalidate()
    showServiceDialog.value = false
  },
})

const updateServiceMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: ServiceGuaranteeUpdateRequest }) =>
    updateService(id, data),
  onSuccess: () => {
    invalidate()
    showServiceDialog.value = false
  },
})

const deleteServiceMutation = useMutation({
  mutationFn: (id: string) => deleteService(id),
  onSuccess: () => {
    if (selectedService.value?.id === deleteServiceMutation.variables?.valueOf()) {
      selectedService.value = null
    }
    invalidate()
  },
})

const createOptionMutation = useMutation({
  mutationFn: (data: ServiceOptionCreateRequest) =>
    createServiceOption(selectedService.value!.id, data),
  onSuccess: () => {
    invalidate()
    showOptionDialog.value = false
  },
})

const updateOptionMutation = useMutation({
  mutationFn: ({ optionId, data }: { optionId: string; data: ServiceOptionUpdateRequest }) =>
    updateServiceOption(selectedService.value!.id, optionId, data),
  onSuccess: () => {
    invalidate()
    showOptionDialog.value = false
  },
})

const deleteOptionMutation = useMutation({
  mutationFn: ({ serviceId, optionId }: { serviceId: string; optionId: string }) =>
    deleteServiceOption(serviceId, optionId),
  onSuccess: invalidate,
})

const handleServiceSubmit = async () => {
  if (editingServiceId.value) {
    await updateServiceMutation.mutateAsync({
      id: editingServiceId.value,
      data: {
        name: serviceForm.name || undefined,
        sortOrder: serviceForm.sortOrder,
      },
    })
  } else {
    if (!serviceForm.name) return
    await createServiceMutation.mutateAsync({
      name: serviceForm.name,
      sortOrder: serviceForm.sortOrder,
    })
  }
}

const handleDeleteService = (row: ServiceGuaranteeVO) => {
  if (selectedService.value?.id === row.id) selectedService.value = null
  deleteServiceMutation.mutate(row.id)
}

const handleOptionSubmit = async () => {
  if (!selectedService.value) return
  if (editingOptionId.value) {
    await updateOptionMutation.mutateAsync({
      optionId: editingOptionId.value,
      data: {
        name: optionForm.name || undefined,
        description: optionForm.description || undefined,
        isBooleanType: optionForm.isBooleanType,
      },
    })
  } else {
    if (!optionForm.name) return
    await createOptionMutation.mutateAsync({
      name: optionForm.name,
      description: optionForm.description || undefined,
      isBooleanType: optionForm.isBooleanType,
    })
  }
}

const handleDeleteOption = (row: ServiceGuaranteeOptionVO) => {
  if (!selectedService.value) return
  deleteOptionMutation.mutate({ serviceId: selectedService.value.id, optionId: row.id })
}
</script>

<template>
  <div class="space-y-8">
    <DataTableCrud
      :columns="serviceColumns"
      :data="list"
      :loading="isLoading"
      title="服务保障管理"
      @create="openCreateService"
      @edit="openEditService"
      @delete="handleDeleteService"
    />

    <div v-if="selectedService">
      <div class="mb-3 flex items-center gap-2">
        <div class="h-4 w-1 rounded bg-primary" />
        <h3 class="text-sm font-medium text-muted-foreground">
          「{{ selectedService.name }}」的选项
        </h3>
        <button
          class="ml-auto text-xs text-muted-foreground hover:text-foreground"
          @click="selectedService = null"
        >
          <icon-lucide-x class="h-4 w-4" />
        </button>
      </div>

      <DataTableCrud
        :columns="optionColumns"
        :data="currentOptions"
        title="服务选项"
        @create="openCreateOption"
        @edit="openEditOption"
        @delete="handleDeleteOption"
      />
    </div>
    <div
      v-else
      class="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground"
    >
      点击服务保障 ID 或名称查看其选项
    </div>
  </div>

  <Dialog :open="showServiceDialog" @update:open="(v) => !v && (showServiceDialog = false)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ serviceDialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label class="text-sm font-medium"
            >服务名称 <span class="text-destructive">*</span></label
          >
          <Input v-model="serviceForm.name" placeholder="请输入服务保障名称" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">排序</label>
          <Input
            v-model.number="serviceForm.sortOrder"
            type="number"
            placeholder="排序权重（可选，数值越小越靠前）"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showServiceDialog = false">取消</Button>
        <Button
          :disabled="createServiceMutation.isPending.value || updateServiceMutation.isPending.value"
          @click="handleServiceSubmit"
        >
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog :open="showOptionDialog" @update:open="(v) => !v && (showOptionDialog = false)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ optionDialogTitle }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <label class="text-sm font-medium"
            >选项名称 <span class="text-destructive">*</span></label
          >
          <Input v-model="optionForm.name" placeholder="请输入选项名称" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium">描述</label>
          <Input v-model="optionForm.description" placeholder="请输入描述（可选）" />
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium">布尔类型</label>
          <button
            type="button"
            class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
            :class="optionForm.isBooleanType === 1 ? 'bg-primary' : 'bg-muted'"
            @click="optionForm.isBooleanType = optionForm.isBooleanType === 1 ? 0 : 1"
          >
            <span
              class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200"
              :class="optionForm.isBooleanType === 1 ? 'translate-x-4' : 'translate-x-0'"
            />
          </button>
          <span class="text-sm text-muted-foreground">
            {{ optionForm.isBooleanType === 1 ? '是' : '否' }}
          </span>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="showOptionDialog = false">取消</Button>
        <Button
          :disabled="createOptionMutation.isPending.value || updateOptionMutation.isPending.value"
          @click="handleOptionSubmit"
        >
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
