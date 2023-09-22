import type { TemplateContext } from "../../../types/template";

export function to_ts_identifier(context: TemplateContext, identifier: string) {
  identifier = `${identifier}`;
  if (/^[_a-z]\w*$/i.test(identifier)) {
    return identifier;
  } else {
    return `["${identifier.replace('"', '\\"')}"]`;
  }
}
