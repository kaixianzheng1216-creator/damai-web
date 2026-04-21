import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

interface UseFollowToggleOptions<TId, TFollowRequest, TEntity> {
  id: () => TId
  followQueryKeyPrefix: string
  entityQueryKeyPrefix: string
  checkIsFollowed: (id: TId) => Promise<boolean>
  follow: (request: TFollowRequest) => Promise<void>
  unfollow: (id: TId) => Promise<void>
  buildFollowRequest: (id: TId) => TFollowRequest
}

export function useFollowToggle<TId extends string, TFollowRequest, TEntity>({
  id,
  followQueryKeyPrefix,
  entityQueryKeyPrefix,
  checkIsFollowed,
  follow,
  unfollow,
  buildFollowRequest,
}: UseFollowToggleOptions<TId, TFollowRequest, TEntity>) {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const queryClient = useQueryClient()

  const isFollowedQuery = useQuery({
    queryKey: computed(() => [followQueryKeyPrefix, id()]),
    queryFn: () => checkIsFollowed(id()),
    enabled: computed(() => !!id() && id().length > 0 && userStore.isLoggedIn),
  })

  const followMutation = useMutation({
    mutationFn: follow,
    onSuccess: () => {
      queryClient.setQueryData([followQueryKeyPrefix, id()], true)
      queryClient.invalidateQueries({ queryKey: [entityQueryKeyPrefix, id()] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: unfollow,
    onSuccess: () => {
      queryClient.setQueryData([followQueryKeyPrefix, id()], false)
      queryClient.invalidateQueries({ queryKey: [entityQueryKeyPrefix, id()] })
    },
  })

  const toggleFollow = async () => {
    if (!userStore.isLoggedIn) {
      await router.push({ name: 'login', query: { redirect: route.fullPath } })
      return
    }

    if (isFollowedQuery.data.value) {
      await unfollowMutation.mutateAsync(id())
    } else {
      await followMutation.mutateAsync(buildFollowRequest(id()))
    }
  }

  const isFollowed = computed(() => isFollowedQuery.data.value ?? false)
  const isFollowLoading = computed(
    () => followMutation.isPending.value || unfollowMutation.isPending.value,
  )

  return {
    isFollowedQuery,
    followMutation,
    unfollowMutation,
    toggleFollow,
    isFollowed,
    isFollowLoading,
  }
}
