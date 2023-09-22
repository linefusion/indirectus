import type { TemplateContext } from "../../../types/template";

export function falsey(
  context: TemplateContext,
  condition: boolean,
  falsey: any,
  truthy: any,
) {
  if (!condition) {
    return falsey;
  } else {
    if (typeof truthy != "undefined") {
      return truthy;
    }
  }
  return condition;
}
