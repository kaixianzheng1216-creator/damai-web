<script setup lang="ts">
import { sendVerifyCode, login } from '@/api/account'
import { AUTH_COPY, PROFILE_CONFIG } from '@/constants'
import { useAuthSession } from '@/composables/common/useAuthSession'
import { useCountdown } from '@/composables/common'
import { Input } from '@/components/common/ui/input'
import { Button } from '@/components/common/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/common/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/common/ui/input-otp'
import AuthPageShell from '@/components/features/auth/AuthPageShell.vue'

const router = useRouter()
const { saveSession } = useAuthSession()

const isLoading = ref(false)
const isSendingCode = ref(false)
const errorMsg = ref('')

const form = reactive({
  mobile: '',
  code: '',
})

const schema = z.object({
  mobile: z.string().regex(/^1[3-9]\d{9}$/, AUTH_COPY.mobileRequired),
  code: z.string().regex(/^\d{6}$/, AUTH_COPY.codeRequired),
})

const {
  countdown,
  isRunning: isCountdownRunning,
  start: startCountdown,
} = useCountdown(PROFILE_CONFIG.SMS_VERIFICATION_COUNTDOWN)

const countdownText = computed(() =>
  countdown.value > 0 ? `${countdown.value}s ${AUTH_COPY.resendCodeSuffix}` : AUTH_COPY.sendCode,
)

const handleSendCode = async () => {
  errorMsg.value = ''
  const mobileCheck = z
    .string()
    .regex(/^1[3-9]\d{9}$/, AUTH_COPY.mobileRequired)
    .safeParse(form.mobile)
  if (!mobileCheck.success) {
    errorMsg.value = mobileCheck.error.issues[0]?.message || AUTH_COPY.mobileFormatError
    return
  }

  if (isCountdownRunning.value) {
    return
  }

  try {
    isSendingCode.value = true
    await sendVerifyCode({ mobile: form.mobile, accountType: 'user' })
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
      accountType: 'user',
    })
    saveSession(response)

    const redirect = router.currentRoute.value.query.redirect
    const redirectPath = typeof redirect === 'string' ? redirect : '/'
    await router.push(redirectPath)
  } catch (error) {
    console.error(error)
    errorMsg.value = AUTH_COPY.loginFailed
  } finally {
    isLoading.value = false
  }
}
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
