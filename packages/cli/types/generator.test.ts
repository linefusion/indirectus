import { describe, it } from "vitest";

import { createGenerator } from "./generator";

describe("typegen", async () => {
  it("should generate types", async () => {
    const generator = await createGenerator({});
    await generator.generate();
    return true;
  });
});
