export function entries(obj: any, keyName?: string, valueName?: string) {
  return Object.entries(obj).map(([key, value]) => ({
    [keyName || "key"]: key,
    [valueName || "value"]: value,
  }));
}
