export namespace ChannelMask {
  export const ROUT = 0x2
  export const ATOP = 0x6
  export const XOR = 0xA
  export const ROVER = 0xB
  export const OVER = 0xE
  export const PLUS = 0xF
  export const RIN = 0x1
  export const IN = 0x4
  export const OUT = 0x8
  export const RATOP = 0x9
  export const SRC = 0xC

  const htmlCompositeOps: Record<ChannelMask, GlobalCompositeOperation> = {
    [RIN]: "destination-in",
    [ROUT]: "destination-out",
    [IN]: "source-in",
    [ATOP]: "source-atop",
    [OUT]: "source-out",
    [RATOP]: "destination-atop",
    [XOR]: "xor",
    [ROVER]: "destination-over",
    [SRC]: "copy",
    [OVER]: "source-over",
    [PLUS]: "lighter"
  }

  export const toHtmlCanvasCompositeOperation = (mask: ChannelMask): GlobalCompositeOperation => htmlCompositeOps[mask]
}

export type ChannelMask =
  typeof ChannelMask.ROUT | typeof ChannelMask.ATOP | typeof ChannelMask.XOR |
  typeof ChannelMask.ROVER | typeof ChannelMask.OVER | typeof ChannelMask.PLUS |
  typeof ChannelMask.RIN | typeof ChannelMask.IN | typeof ChannelMask.OUT |
  typeof ChannelMask.RATOP | typeof ChannelMask.SRC
