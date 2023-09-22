import type { TemplateContext } from "../../../types/template";

export function quote(context: TemplateContext, value: any) {
  value = `${value}`;
  if (typeof value == "string") {
    return JSON.stringify(value);
  } else if (Array.isArray(value)) {
    return value.map((e) => {
      if (typeof e == "string") {
        return JSON.stringify(e);
      } else {
        return e;
      }
    });
  }
  return value;
}

export const quoted = quote;
