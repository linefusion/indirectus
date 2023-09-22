export function push(arr: Array<any>, value: any) {
  if (Array.isArray(value)) {
    arr.push(...value);
  } else {
    arr.push(value);
  }
  return arr;
}
