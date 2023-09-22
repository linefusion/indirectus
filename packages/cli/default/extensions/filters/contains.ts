export function contains(arr: Array<any>, value: any) {
  if (!Array.isArray(arr)) {
    return false;
  }
  return typeof arr.find((v) => v == value) != "undefined";
}
