import { DirectusCollection, DirectusField, Schema } from "./schema";

export class Context {
  constructor() {}
}

export function createContext(schema: Schema): Context {
  return new Context();
}

export function contextFromSchema(schema: Schema): Context {
  return createContext(schema);
}

export function contextToJson(context: Context): string {
  return JSON.stringify(context);
}

export function contextFromJson(json: string): Context {
  return JSON.parse(json);
}
