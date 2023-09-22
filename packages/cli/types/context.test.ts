import { describe, it } from "vitest";

import { Schema } from "./schema";
import { contextFromJson, contextFromSchema, contextToJson } from "./context";

const schema: Schema = {
  collections: [
    {
      collection: "posts",
      meta: {
        system: false,
      },
    },
  ],
  fields: [
    {
      collection: "posts",
    },
  ],
  relations: [],
} as any;

describe("contexts", async () => {
  it("should create context from schema", async () => {
    contextFromSchema(schema);
  });

  it("should serialize context", async () => {
    const context = contextFromSchema(schema);
    const json = contextToJson(context);
  });

  it("should deserialize context", async () => {
    const context = contextFromSchema(schema);
    const json = contextToJson(context);
    const context2 = contextFromJson(json);
  });
});
