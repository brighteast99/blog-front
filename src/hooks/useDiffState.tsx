import { useCallback, useState } from 'react'

export const useDiffState = <T extends Exclude<any, Function>>(
  _initialValue: T
) => {
  const [initialValue, setInitialValue] = useState<T>(_initialValue)
  const [value, setValue] = useState<T>(_initialValue)
  const hasChange = JSON.stringify(initialValue) !== JSON.stringify(value)

  const initialize = useCallback(
    (value: T | ((prev: T) => T)) => {
      setInitialValue(value)
      setValue(value)
    },
    [setInitialValue, setValue]
  )

  const resetValue = useCallback(
    () => setValue(initialValue),
    [setValue, initialValue]
  )

  return {
    value,
    hasChange,
    initialize,
    setValue,
    resetValue
  }
}
