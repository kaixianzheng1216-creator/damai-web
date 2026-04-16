import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

export const useCountdown = (initialSeconds: number = 60) => {
  const countdown = ref(0)
  const isRunning = ref(false)

  const { pause, resume } = useIntervalFn(
    () => {
      if (countdown.value <= 1) {
        countdown.value = 0
        isRunning.value = false
        pause()
        return
      }
      countdown.value -= 1
    },
    1000,
    { immediate: false },
  )

  const start = (seconds: number = initialSeconds) => {
    countdown.value = seconds
    isRunning.value = true
    resume()
  }

  const stop = () => {
    pause()
    countdown.value = 0
    isRunning.value = false
  }

  return {
    countdown,
    isRunning,
    start,
    stop,
  }
}
