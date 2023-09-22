import type { TemplateContext } from "../../../types/template";

export function json(context: TemplateContext, v: any) {
  if (typeof v == "undefined") {
    return "undefined";
  } else if (v === null) {
    return "null";
  }
  return JSON.stringify(v, null, 2);
}
