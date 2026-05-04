<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const title = useTitle('Damai')

router.afterEach((to) => {
  const t = typeof to.meta.title === 'string' ? to.meta.title : ''
  title.value = t ? `${t} - Damai` : 'Damai'
})
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>
