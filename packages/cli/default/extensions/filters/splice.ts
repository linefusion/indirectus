export function splice(
  arr: Array<any>,
  start: number,
  count: number | undefined = undefined,
) {
  if (Array.isArray(arr)) {
    return arr.splice(start, count);
  }
  return arr;
}
