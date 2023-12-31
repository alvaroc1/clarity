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

const dot = '.'.charCodeAt(0)
const comma = ','.charCodeAt(0)
const semi = ';'.charCodeAt(0)

export class Parser {

  static async *parse(buffers: AsyncIterable<Buffer>): AsyncIterable<string[]> {
    let args: string[] = []
    let size = 0
    let sizeChars: number[] = []
    let data = ''
    let state: State = State.size

    for await (const buffer of buffers) {
      let offset = 0
      while (buffer.length > offset) {
        switch (state) {
          case State.size: {
            const char = buffer.readUInt8(offset++)
            if (char === dot) {
              size = parseInt(String.fromCodePoint(...sizeChars), 10)
              sizeChars = []
              state = State.data
            } else {
              sizeChars.push(char)
            }
            break
          }

          case State.data: {
            const biteSize = Math.min(buffer.length, size)
            data += buffer.toString(undefined, offset, offset + biteSize)
            size -= biteSize
            offset += biteSize

            if (buffer.length > offset) {
              switch (buffer.readUInt8(offset++)) {
                // we have a complete parameter
                case comma:
                  args.push(data)
                  data = ''
                  break
                // we have a complete command
                case semi: {
                  args.push(data)
                  data = ''
                  const instruction = [...args]
                  args = []
                  yield instruction
                  break
                }
                default: throw `Unexpected: ${buffer.readUInt8(offset - 1)}`
              }

              // go back to reading a size
              state = State.size
            }
            break
          }
        }
      }
    }
  }
}
