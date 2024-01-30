export const assertUnreachable = (c: never): void => {
  throw ('UNREACHABLE: ' + c)
}