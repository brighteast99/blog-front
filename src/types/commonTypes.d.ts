export type PositiveInteger<T extends number> = `${T}` extends
  | '0'
  | `-${any}`
  | `${any}.${any}`
  ? never
  : T
