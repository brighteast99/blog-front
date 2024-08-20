type _PositiveInteger<T extends number> = `${T}` extends
  | '0'
  | `-${any}`
  | `${any}.${any}`
  ? never
  : T

export type PositiveInteger = _PositiveInteger<number>
