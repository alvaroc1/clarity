import { asyncIterableToArray } from '../util/asyncIterableToArray';
import { Parser } from './Parser'

async function* gen <A>(...arr: A[]): AsyncIterable<A> {
  for await (const a of arr) {
    yield a;
  }
}

test('async parser', async () => {
  const data = gen(
    Buffer.from("4.size,1.0,4.1024,3.768;6.select,3.vnc"),
    Buffer.from(";4.size")
  )

  const result = await asyncIterableToArray(Parser.parse(data));

  expect(result).toEqual([
    ["size", "0", "1024", "768"],
    ["select", "vnc"]
  ])
})
