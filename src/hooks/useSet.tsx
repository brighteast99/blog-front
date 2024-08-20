import { useCallback, useState } from 'react'

export const useSet = <T extends any>(_initialValue?: Iterable<T> | null) => {
  const [value, setValue] = useState<Set<T>>(new Set<T>(_initialValue))

  const resetValue = useCallback(() => setValue(new Set()), [])
  const addItem = useCallback(
    (item: T) => setValue((prev) => new Set(prev.add(item))),
    []
  )
  const addItems = useCallback(
    (items: T[]) =>
      setValue((prev) => {
        for (const item of items) prev.add(item)
        return new Set(prev)
      }),
    []
  )
  const deleteItem = useCallback(
    (item: T) =>
      setValue((prev) => {
        prev.delete(item)
        return new Set(prev)
      }),
    []
  )
  const deleteItems = useCallback(
    (items: T[]) =>
      setValue((prev) => {
        for (const item of items) prev.delete(item)

        return new Set(prev)
      }),
    []
  )

  return {
    value,
    resetValue,
    setValue,
    addItem,
    addItems,
    deleteItem,
    deleteItems
  }
}
