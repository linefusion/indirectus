import type { TemplateContext } from "../../../types/template";

export function contains(context: TemplateContext, arr: any, value: any) {
  if (!Array.isArray(arr)) {
    return false;
  }
  return typeof arr.find((v) => v == value) != "undefined";
}
