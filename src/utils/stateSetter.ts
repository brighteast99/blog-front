import type { Dispatch, SetStateAction } from 'react'

export function createSetter<T, U>(
  updateFunc: Dispatch<SetStateAction<U>>,
  name: string
) {
  return (value: T) => {
    updateFunc((prev: U) => {
      return {
        ...prev,
        [name]: value
      }
    })
  }
}
