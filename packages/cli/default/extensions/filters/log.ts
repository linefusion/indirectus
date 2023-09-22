import type { TemplateContext } from "../../../types/template";

export function log(context: TemplateContext, ...values: any[]) {
  console.log(JSON.stringify({ values }));
}
