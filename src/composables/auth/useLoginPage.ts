import { computed, reactive, ref } from 'vue'
import { useRouter, type RouteLocationNormalizedLoaded, type RouteLocationRaw } from 'vue-router'
import { z } from 'zod'
import { login, sendVerifyCode, type LoginParams, type LoginResponse } from '@/api/account'
import { AUTH_COPY, PROFILE_CONFIG, VALIDATION_PATTERNS } from '@/constants'
import { useCountdown } from '@/composables/common'

interface UseLoginPageOptions {
  accountType: LoginParams['accountType']
  sendCodeText: string
  resendCodeText: (seconds: number) => string
  saveSession: (response: LoginResponse) => void
  resolveRedirect: (route: RouteLocationNormalizedLoaded) => RouteLocationRaw
}

export function useLoginPage(options: UseLoginPageOptions) {
  const router = useRouter()
  const isLoading = ref(false)
  const isSendingCode = ref(false)
  const errorMsg = ref('')

  const form = reactive({
    mobile: '',
    code: '',
  })

  const schema = z.object({
    mobile: z.string().regex(VALIDATION_PATTERNS.MOBILE, AUTH_COPY.mobileRequired),
    code: z.string().regex(VALIDATION_PATTERNS.CODE, AUTH_COPY.codeRequired),
  })

  const {
    countdown,
    isRunning: isCountdownRunning,
    start: startCountdown,
  } = useCountdown(PROFILE_CONFIG.SMS_VERIFICATION_COUNTDOWN)

  const countdownText = computed(() =>
    countdown.value > 0 ? options.resendCodeText(countdown.value) : options.sendCodeText,
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

    if (isCountdownRunning.value) {
      return
    }

    try {
      isSendingCode.value = true
      await sendVerifyCode({ mobile: form.mobile, accountType: options.accountType })
      startCountdown()
    } catch (error) {
      console.error('[useLoginPage] Send code failed:', error)
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
        accountType: options.accountType,
      })
      options.saveSession(response)
      await router.push(options.resolveRedirect(router.currentRoute.value))
    } catch (error) {
      console.error('[useLoginPage] Login failed:', error)
      errorMsg.value = AUTH_COPY.loginFailed
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    isLoading,
    isSendingCode,
    isCountdownRunning,
    errorMsg,
    countdownText,
    handleSendCode,
    handleLogin,
  }
}
