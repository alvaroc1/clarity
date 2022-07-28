import { Parser } from './Parser'

test('check empty', () => {
  const commands: string[][] = []

  const parser = new Parser(command => commands.push(command))

  // parse from 2 chunks
  parser.parse(
    Buffer.from("4.size,1.0,4.1024,3.768;6.select,3.vnc")
  )
  parser.parse(
    Buffer.from(";4.size")
  )

  expect(commands).toEqual([
    ["size", "0", "1024", "768"],
    ["select", "vnc"]
  ])
})
