import type { TemplateContext } from "../../../types/template";

export function push(context: TemplateContext, arr: Array<any>, value: any) {
  if (Array.isArray(value)) {
    arr.push(...value);
  } else {
    arr.push(value);
  }
  return arr;
}
