<script setup lang="ts">
import {
  ProfileDialogs,
  ProfilePageShell,
  ProfileSectionContent,
} from '@/components/features/profile'
import { provideProfilePage } from '@/components/features/profile/profilePageContext'
import { useProfilePage } from '@/composables/profile/useProfilePage'

const profile = useProfilePage()
provideProfilePage(profile)
</script>

<template>
  <ProfilePageShell>
    <ProfileSectionContent />
  </ProfilePageShell>

  <ProfileDialogs />
</template>
