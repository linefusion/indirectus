import type { TemplateContext } from "../../../types/template";

export function comment(context: TemplateContext, str: Array<any> | string) {
  if (Array.isArray(str)) {
    str = str.join("\n").replace(/(^\n*)|(\n*$)/gi, "");
  }
  str = str.split("\n");
  return `/**\n${str.map((line) => ` * ${line}`).join("\n")}\n*/`;
}
