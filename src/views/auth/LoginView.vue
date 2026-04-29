<script setup lang="ts">
import { AUTH_COPY } from '@/constants'
import { useAuthSession } from '@/composables/common/useAuthSession'
import { useLoginPage } from '@/composables/auth'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/common/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/common/ui/input-otp'
import AuthPageShell from '@/components/features/auth/AuthPageShell.vue'

const { saveSession } = useAuthSession()

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
  accountType: 'user',
  sendCodeText: AUTH_COPY.sendCode,
  resendCodeText: (seconds) => `${seconds}s ${AUTH_COPY.resendCodeSuffix}`,
  saveSession,
  resolveRedirect: (route) => {
    const redirect = route.query.redirect
    return typeof redirect === 'string' ? redirect : '/'
  },
})
</script>

<template>
  <AuthPageShell :title="AUTH_COPY.loginTitle" :description="AUTH_COPY.loginDesc">
    <form @submit.prevent="handleLogin">
      <FieldGroup class="gap-4">
        <Field>
          <FieldLabel for="mobile">
            {{ AUTH_COPY.mobileLabel }}
          </FieldLabel>
          <Input
            id="mobile"
            v-model="form.mobile"
            :placeholder="AUTH_COPY.mobilePlaceholder"
            type="tel"
            auto-complete="tel"
            :disabled="isLoading"
          />
        </Field>

        <Field>
          <FieldLabel for="code">
            {{ AUTH_COPY.codeLabel }}
          </FieldLabel>
          <div class="flex flex-wrap gap-2">
            <InputOTP id="code" v-model="form.code" :maxlength="6" :disabled="isLoading">
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

        <Button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
        >
          <icon-lucide-loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ AUTH_COPY.loginButton }}
        </Button>
      </FieldGroup>
    </form>
  </AuthPageShell>
</template>
