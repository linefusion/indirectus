import type { TemplateContext } from "../../../types/template";

export function drop_first(context: TemplateContext, arr: Array<any>) {
  if (Array.isArray(arr)) {
    arr.shift();
  }
  return arr;
}
