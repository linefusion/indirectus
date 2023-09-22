import type { TemplateContext } from "../../../types/template";

export function unshift(context: TemplateContext, arr: Array<any>, value: any) {
  if (Array.isArray(value)) {
    arr.unshift(...value);
  } else {
    arr.unshift(value);
  }
  return arr;
}
