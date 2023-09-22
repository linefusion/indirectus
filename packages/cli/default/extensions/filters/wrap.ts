import type { TemplateContext } from "../../../types/template";

export function wrap(
  context: TemplateContext,
  value: any,
  prefix: string,
  suffix: string,
) {
  return `${prefix}${value}${suffix}`;
}
