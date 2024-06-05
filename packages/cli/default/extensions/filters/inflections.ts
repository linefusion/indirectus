import type { TemplateContext } from "../../../types/template";

import $ from "pluralize";

export function to_singular(context: TemplateContext, value: any) {
  if (typeof value !== "string") {
    console.warn(`WARNING: trying to singularize a non-string value: ${JSON.stringify(value)}`);
    return value;
  }
  return `${$.singular(`${value}`)}`;
}

export const singularize = to_singular;
export const singular = to_singular;

export function to_plural(context: TemplateContext, value: any) {
  if (typeof value !== "string") {
    console.warn(`WARNING: trying to pluralize a non-string value: ${JSON.stringify(value)}`);
    return value;
  }
  return `${$.plural(value)}`;
}

export const pluralize = to_plural;
export const plural = to_plural;
