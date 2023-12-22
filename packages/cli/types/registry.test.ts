import { beforeAll, describe, it } from "vitest";

import { loadSync } from "@wolfpkgs/core/env";
import { Registry, createRegistry } from "./registry";
import { fetchSchema } from "./schema";

describe("registry", async () => {
  let env: Record<string, string> = {};
  beforeAll(async () => {
    env = loadSync();
  });

  it("should be able to serialize/deserialize schemas", async () => {
    const schema = await fetchSchema(
      {
        url: env.DIRECTUS_URL!,
        token: env.DIRECTUS_TOKEN!,
      },
      {
        cache: "./.directus/schema.json",
      },
    );

    const registry = createRegistry(schema);

    const serialized = registry.toJSON();

    const deserialized = Registry.fromJSON(serialized);

    return true;
  });
});
