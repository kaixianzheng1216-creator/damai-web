<script setup lang="ts">
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/common/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/common/ui/input-otp'
import { ADMIN_AUTH_COPY } from '@/constants/admin'
import { useAdminAuth } from '@/composables/admin'
import { useLoginPage } from '@/composables/auth'
import AuthPageShell from '@/components/features/auth/AuthPageShell.vue'

const { saveAdminSession } = useAdminAuth()

const {
  form,
  isLoading,
  isSendingCode,
  isCountdownRunning,
  errorMsg,
  countdownText,
  handleSendCode,
  handleLogin,
} = useLoginPage({
  accountType: 'admin',
  sendCodeText: ADMIN_AUTH_COPY.sendCodeButton,
  resendCodeText: (seconds) => `${seconds}s 后重试`,
  saveSession: saveAdminSession,
  resolveRedirect: () => '/admin',
})
</script>

<template>
  <AuthPageShell :title="ADMIN_AUTH_COPY.title" :description="ADMIN_AUTH_COPY.subtitle">
    <form @submit.prevent="handleLogin">
      <FieldGroup class="gap-4">
        <Field>
          <FieldLabel for="admin-mobile">手机号</FieldLabel>
          <Input
            id="admin-mobile"
            v-model="form.mobile"
            :placeholder="ADMIN_AUTH_COPY.mobilePlaceholder"
            type="tel"
            auto-complete="tel"
            :disabled="isLoading"
          />
        </Field>

        <Field>
          <FieldLabel for="admin-code">验证码</FieldLabel>
          <div class="flex flex-wrap gap-2">
            <InputOTP id="admin-code" v-model="form.code" :maxlength="6" :disabled="isLoading">
              <InputOTPGroup
                class="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border"
              >
                <InputOTPSlot :index="0" />
                <InputOTPSlot :index="1" />
                <InputOTPSlot :index="2" />
                <InputOTPSlot :index="3" />
                <InputOTPSlot :index="4" />
                <InputOTPSlot :index="5" />
              </InputOTPGroup>
            </InputOTP>
            <Button
              type="button"
              variant="outline"
              class="shrink-0 flex-1"
              :disabled="isSendingCode || isCountdownRunning"
              @click="handleSendCode"
            >
              {{ countdownText }}
            </Button>
          </div>
        </Field>

        <div v-if="errorMsg" class="text-sm font-medium text-destructive">
          {{ errorMsg }}
        </div>

        <Button type="submit" :disabled="isLoading" class="w-full font-bold">
          <icon-lucide-loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ ADMIN_AUTH_COPY.loginButton }}
        </Button>
      </FieldGroup>
    </form>
  </AuthPageShell>
</template>
