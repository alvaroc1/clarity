import { ChannelMask } from "./ChannelMask"

export enum MouseButton {
  Left,
  Middle,
  Right,
  ScrollUp,
  ScrollDown,
}

export namespace Cap {
  export const Butt = 0
  export const Round = 1
  export const Square = 2
}
export type Cap = typeof Cap.Butt | typeof Cap.Round | typeof Cap.Square

export namespace Join {
  export const Bevel = 0
  export const Miter = 1
  export const Round = 2
}
export type Join = typeof Join.Bevel | typeof Join.Miter | typeof Join.Round

export type Rgba = [r: number, g: number, b: number, a: number]
