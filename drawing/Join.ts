
export namespace Join {
  export const Bevel = 0
  export const Miter = 1
  export const Round = 2
}
export type Join = typeof Join.Bevel | typeof Join.Miter | typeof Join.Round
