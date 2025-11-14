/**
 * Example custom hook test
 *
 * Add your custom hook tests here
 */

import { renderHook, act } from '@testing-library/react'
import { useState } from 'react'

// Example: Testing a simple counter hook
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount((c) => c + 1)
  const decrement = () => setCount((c) => c - 1)
  const reset = () => setCount(initialValue)

  return { count, increment, decrement, reset }
}

describe('Example Hook Tests', () => {
  describe('useCounter', () => {
    it('should initialize with default value', () => {
      const { result } = renderHook(() => useCounter())
      expect(result.current.count).toBe(0)
    })

    it('should initialize with custom value', () => {
      const { result } = renderHook(() => useCounter(10))
      expect(result.current.count).toBe(10)
    })

    it('should increment count', () => {
      const { result } = renderHook(() => useCounter())

      act(() => {
        result.current.increment()
      })

      expect(result.current.count).toBe(1)
    })

    it('should decrement count', () => {
      const { result } = renderHook(() => useCounter(5))

      act(() => {
        result.current.decrement()
      })

      expect(result.current.count).toBe(4)
    })

    it('should reset count to initial value', () => {
      const { result } = renderHook(() => useCounter(10))

      act(() => {
        result.current.increment()
        result.current.increment()
      })

      expect(result.current.count).toBe(12)

      act(() => {
        result.current.reset()
      })

      expect(result.current.count).toBe(10)
    })
  })
})
