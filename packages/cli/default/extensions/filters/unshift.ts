export function unshift(arr: Array<any>, value: any) {
  if (Array.isArray(value)) {
    arr.unshift(...value);
  } else {
    arr.unshift(value);
  }
  return arr;
}
