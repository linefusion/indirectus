import { describe, it } from "vitest";

import { fetchSchema } from "./schema";
import { loadSync } from "@wolfpkgs/core/env";
import { beforeAll } from "vitest";
import { getRelationship } from "./relationships";

describe("relationships", async () => {
  let env: Record<string, string> = {};
  beforeAll(async () => {
    env = loadSync();
  });

  it("should detect relationships", async () => {
    const schema = await fetchSchema(
      {
        url: env.DIRECTUS_URL,
        token: env.DIRECTUS_TOKEN,
      },
      {
        cache: "./.directus/schema.json",
      },
    );

    const relations: any[] = [];

    relations.push(
      getRelationship(schema.fields, schema.relations, {
        collection: "col1",
        field: "col2_id",
      }),
    );

    relations.push(
      getRelationship(schema.fields, schema.relations, {
        collection: "col2",
        field: "col1_id",
      }),
    );

    relations.push(
      getRelationship(schema.fields, schema.relations, {
        collection: "col1",
        field: "col2_list",
      }),
    );

    relations.push(
      getRelationship(schema.fields, schema.relations, {
        collection: "col2",
        field: "col1_list",
      }),
    );

    relations.push(
      getRelationship(schema.fields, schema.relations, {
        collection: "col1_list_any",
        field: "other_id",
      }),
    );
  });
});
