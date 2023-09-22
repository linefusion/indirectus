import type { TemplateContext } from "../../../types/template";

export function object_set(
  context: TemplateContext,
  obj: any,
  key: string,
  value: any,
) {
  obj[key] = value;
  return obj;
}
