import { useCallback, useState } from 'react'

export const useToggle = (_initialValue: boolean) => {
  const [value, setValue] = useState<boolean>(_initialValue)

  const setTrue = useCallback(() => setValue(true), [setValue])
  const setFalse = useCallback(() => setValue(false), [setValue])
  const toggle = useCallback(() => setValue((prev) => !prev), [setValue])

  return {
    value,
    setValue,
    setTrue,
    setFalse,
    toggle
  }
}
