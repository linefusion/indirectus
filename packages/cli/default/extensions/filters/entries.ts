import type { TemplateContext } from "../../../types/template";

export function entries(
  context: TemplateContext,
  obj: any,
  keyName?: string,
  valueName?: string,
) {
  return Object.entries(obj).map(([key, value]) => ({
    [keyName ?? "key"]: key,
    [valueName ?? "value"]: value,
  }));
}
