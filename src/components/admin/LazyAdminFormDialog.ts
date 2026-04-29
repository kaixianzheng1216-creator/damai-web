import { defineAsyncComponent } from 'vue'

const LazyAdminFormDialog = defineAsyncComponent(() => import('./AdminFormDialog.vue'))

export default LazyAdminFormDialog
