export namespace Cap {
  export const Butt = 0
  export const Round = 1
  export const Square = 2
}
export type Cap = typeof Cap.Butt | typeof Cap.Round | typeof Cap.Square
