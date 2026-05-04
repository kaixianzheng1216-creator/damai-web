import { computed, reactive, ref } from 'vue'
import { useRouter, type RouteLocationNormalizedLoaded, type RouteLocationRaw } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
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

  const sendCodeMutation = useMutation({
    mutationFn: () => sendVerifyCode({ mobile: form.mobile, accountType: options.accountType }),
    onSuccess: () => {
      errorMsg.value = ''
      startCountdown()
    },
    onError: (error) => {
      console.error('[useLoginPage] Send code failed:', error)
      errorMsg.value = AUTH_COPY.sendCodeFailed
    },
  })

  const loginMutation = useMutation({
    mutationFn: () =>
      login({
        mobile: form.mobile,
        code: form.code,
        accountType: options.accountType,
      }),
    onSuccess: async (response) => {
      errorMsg.value = ''
      options.saveSession(response)
      await router.push(options.resolveRedirect(router.currentRoute.value))
    },
    onError: (error) => {
      console.error('[useLoginPage] Login failed:', error)
      errorMsg.value = AUTH_COPY.loginFailed
    },
  })

  const handleSendCode = () => {
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

    sendCodeMutation.mutate()
  }

  const handleLogin = () => {
    errorMsg.value = ''

    const validated = schema.safeParse(form)
    if (!validated.success) {
      errorMsg.value = validated.error.issues[0]?.message || AUTH_COPY.validationFailed
      return
    }

    loginMutation.mutate()
  }

  return {
    form,
    isLoading: computed(() => loginMutation.isPending.value),
    isSendingCode: computed(() => sendCodeMutation.isPending.value),
    isCountdownRunning,
    errorMsg,
    countdownText,
    handleSendCode,
    handleLogin,
  }
}
