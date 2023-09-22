import type { TemplateContext } from "../../../types/template";

export function regex_replace(
  context: TemplateContext,
  value: string,
  regex: string,
  replacement: string,
) {
  return value.replace(new RegExp(regex, "g"), replacement);
}
