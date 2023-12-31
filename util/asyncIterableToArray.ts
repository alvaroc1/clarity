
export async function asyncIterableToArray<A>(iter: AsyncIterable<A>): Promise<A[]> {
  const as: A[] = []
  for await (const a of iter) {
    as.push(a)
  }
  return as
}
