export function drop_first(arr: Array<any>) {
  if (Array.isArray(arr)) {
    arr.shift();
  }
  return arr;
}
