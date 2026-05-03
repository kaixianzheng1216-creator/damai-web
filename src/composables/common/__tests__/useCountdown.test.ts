import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useCountdown } from '../useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('start(duration) sets countdown to duration and isRunning to true', () => {
    const { countdown, isRunning, start } = useCountdown()

    start(10)

    expect(countdown.value).toBe(10)
    expect(isRunning.value).toBe(true)
  })

  it('start() with no argument uses initialSeconds (default 60)', () => {
    const { countdown, isRunning, start } = useCountdown()

    start()

    expect(countdown.value).toBe(60)
    expect(isRunning.value).toBe(true)
  })

  it('start() with no argument uses custom initialSeconds', () => {
    const { countdown, isRunning, start } = useCountdown(30)

    start()

    expect(countdown.value).toBe(30)
    expect(isRunning.value).toBe(true)
  })

  it('timer decrements by 1 every second', () => {
    const { countdown, start } = useCountdown()

    start(5)
    vi.advanceTimersByTime(1000)

    expect(countdown.value).toBe(4)

    vi.advanceTimersByTime(1000)

    expect(countdown.value).toBe(3)
  })

  it('timer reaches zero and stops after expected time', () => {
    const { countdown, isRunning, start } = useCountdown()

    start(3)
    vi.advanceTimersByTime(3000)

    expect(countdown.value).toBe(0)
    expect(isRunning.value).toBe(false)
  })

  it('stop() resets countdown to 0 and sets isRunning to false', () => {
    const { countdown, isRunning, start, stop } = useCountdown()

    start(10)
    stop()

    expect(countdown.value).toBe(0)
    expect(isRunning.value).toBe(false)
  })

  it('start after stop works correctly', () => {
    const { countdown, isRunning, start, stop } = useCountdown()

    start(10)
    stop()
    start(5)

    expect(countdown.value).toBe(5)
    expect(isRunning.value).toBe(true)
  })

  it('never goes below zero even when advancing past the countdown', () => {
    const { countdown, isRunning, start } = useCountdown()

    start(3)
    vi.advanceTimersByTime(5000)

    expect(countdown.value).toBe(0)
    expect(isRunning.value).toBe(false)
  })

  it('timer does not run before start is called', () => {
    const { countdown, isRunning } = useCountdown()

    vi.advanceTimersByTime(5000)

    expect(countdown.value).toBe(0)
    expect(isRunning.value).toBe(false)
  })
})
