import type { TemplateContext } from "../../../types/template";

export function split(
  context: TemplateContext,
  value: string,
  splitter: string,
) {
  return `${value}`.split(splitter);
}
