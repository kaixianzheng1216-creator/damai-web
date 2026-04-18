<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/common/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/common/ui/input-otp'
import { sendVerifyCode, login } from '@/api/account'
import { ADMIN_AUTH_COPY } from '@/constants/admin'
import { AUTH_COPY } from '@/constants/auth'
import { VALIDATION_PATTERNS } from '@/constants/validation'
import { PROFILE_CONFIG } from '@/constants/profile'
import { useAdminAuth } from '@/composables/admin/useAdminAuth'
import { useCountdown } from '@/composables/common'
import AuthPageShell from '@/components/features/auth/AuthPageShell.vue'

const router = useRouter()
const { saveAdminSession } = useAdminAuth()

const isLoading = ref(false)
const isSendingCode = ref(false)
const errorMsg = ref('')

const form = reactive({
  mobile: '',
  code: '',
})

const schema = z.object({
  mobile: z.string().regex(VALIDATION_PATTERNS.MOBILE, AUTH_COPY.mobileRequired),
  code: z.string().length(6, AUTH_COPY.codeRequired),
})

const {
  countdown,
  isRunning: isCountdownRunning,
  start: startCountdown,
} = useCountdown(PROFILE_CONFIG.SMS_VERIFICATION_COUNTDOWN)

const countdownText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s 后重试` : ADMIN_AUTH_COPY.sendCodeButton,
)

const handleSendCode = async () => {
  errorMsg.value = ''
  const mobileCheck = z
    .string()
    .regex(VALIDATION_PATTERNS.MOBILE, AUTH_COPY.mobileRequired)
    .safeParse(form.mobile)

  if (!mobileCheck.success) {
    errorMsg.value = mobileCheck.error.issues[0]?.message || AUTH_COPY.mobileFormatError
    return
  }

  if (isCountdownRunning.value) return

  try {
    isSendingCode.value = true
    await sendVerifyCode({ mobile: form.mobile, accountType: 'admin' })
    startCountdown()
  } catch (error) {
    console.error(error)
    errorMsg.value = AUTH_COPY.sendCodeFailed
  } finally {
    isSendingCode.value = false
  }
}

const handleLogin = async () => {
  errorMsg.value = ''

  const validated = schema.safeParse(form)
  if (!validated.success) {
    errorMsg.value = validated.error.issues[0]?.message || AUTH_COPY.validationFailed
    return
  }

  try {
    isLoading.value = true
    const response = await login({
      mobile: form.mobile,
      code: form.code,
      accountType: 'admin',
    })
    saveAdminSession(response)
    await router.push('/admin')
  } catch (error) {
    console.error(error)
    errorMsg.value = AUTH_COPY.loginFailed
  } finally {
    isLoading.value = false
  }
}
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
