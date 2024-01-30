
export const Guacamole = {

  join (join: number): CanvasLineJoin {
    switch (join) {
      case 0: return 'bevel'
      case 1: return 'miter'
      case 2: return 'round'
      default: throw `Invalid join: ${join}`
    }
  },

  cap (cap: number): CanvasLineCap {
    switch (cap) {
      case 0: return 'butt'
      case 1: return 'round'
      case 2: return 'square'
      default: throw `Invalid cap: ${cap}`
    }
  },

  channelMask (mask: number): GlobalCompositeOperation {
    switch (mask) {
      // ROUT
      case 0x2: return 'destination-in'
      // ATOP
      case 0x6: return 'source-atop'
      // XOR
      case 0xA: return 'xor'
      // ROVER
      case 0xB: return 'destination-over'
      // OVER
      case 0xE: return 'source-over'
      // PLUS
      case 0xF: return 'lighter'
      // RIN
      case 0x1: return 'destination-in'
      // IN
      case 0x4: return 'source-in'
      // OUT
      case 0x8: return 'source-out'
      // RATOP
      case 0x9: return 'destination-atop'
      // SRC
      case 0xC: return 'copy'

      default: throw `Invalid channel mask: ${mask}`
    }
  },

}
