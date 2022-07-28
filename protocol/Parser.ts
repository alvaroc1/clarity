import assert from "node:assert/strict"

/**
 * The parser is always in the process of either reading the size of a parameter
 * or reading a parameter
 * 
 * size - Collecting the size characters
 * data - Collecting data up to the size collected
 */
enum State {
  size,
  data
}

export class Parser {
  static #dot = '.'.charCodeAt(0)
  static #comma = ','.charCodeAt(0)
  static #semi = ';'.charCodeAt(0)

  #callback: (cmd: string[]) => void

  constructor(callback: (cmd: string[]) => void) {
    this.#callback = callback
  }

  #args: string[] = []
  #size: number = 0
  #sizeChars: number[] = []
  #data: string = ''

  #state: State = State.size

  parse(buffer: Buffer) {
    let offset = 0
    while (buffer.length > offset) {
      switch (this.#state) {
        case State.size:
          const char = buffer.readUInt8(offset++)
          if (char === Parser.#dot) {
            this.#size = parseInt(String.fromCodePoint(...this.#sizeChars), 10)
            this.#sizeChars = []
            this.#state = State.data
          } else {
            this.#sizeChars.push(char)
          }
          break

        case State.data:
          const biteSize = Math.min(buffer.length, this.#size)
          this.#data += buffer.toString(undefined, offset, offset + biteSize)
          this.#size -= biteSize
          offset += biteSize

          if (buffer.length > offset) {
            switch (buffer.readUInt8(offset++)) {
              // we have a complete parameter
              case Parser.#comma:
                this.#args.push(this.#data)
                this.#data = ''
                break
              // we have a complete command
              case Parser.#semi:
                this.#args.push(this.#data)
                this.#data = ''
                this.#callback(this.#args)
                this.#args = []
                break
              default: throw `Unexpected: ${buffer.readUInt8(offset - 1)}`
            }

            // go back to reading a size
            this.#state = State.size
          }
          break
      }
    }
  }
}
