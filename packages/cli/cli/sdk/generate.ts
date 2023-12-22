import { defineCommand } from "citty";
import console from "../console";

import { Options } from "@wolfpkgs/core/options";
import { argsToOptions } from "@wolfpkgs/core/arguments";
import {
  Generator,
  GeneratorOptions,
  createGenerator,
} from "../../types/generator";
import path from "node:path";

(async function main() {
  try {
  } catch (e) {
    console.error(Options.getErrorMessage(e));
    console.error(e);
    process.exit(1);
  }
})();

export default defineCommand({
  meta: {
    name: "generate",
    description: "Generates an SDK for a given schema",
  },
  args: {
    url: {
      type: "string",
      required: true,
      description: "The URL of the Directus instance to generate an SDK for",
      default: process.env.DIRECTUS_URL ?? "http://localhost:8055",
      valueHint: process.env.DIRECTUS_URL ?? "http://localhost:8055",
    },
    token: {
      type: "string",
      required: true,
      description: "An static token with admin role assigned.",
      default: process.env.DIRECTUS_TOKEN ?? undefined,
      valueHint: "static-token",
    },
    dir: {
      type: "string",
      required: false,
      description: "Set a custom directory instead of '.directus'",
      default: "./.directus/",
      valueHint: "./.directus/",
    },
    outputDir: {
      type: "string",
      required: false,
      description: "Set a custom directory instead of '.directus'",
      default: "./.directus/generated",
      valueHint: "./.directus/generated",
    },
    fetch: {
      type: "boolean",
      required: false,
      description: "Whether to force fetch the schema from the server.",
      default: false,
    },
  },

  async run(context) {
    const options = await GeneratorOptions.get({
      url: context.args.url,
      token: context.args.token,
      config: context.args.dir,
      output:
        context.args.outputDir ?? path.join(context.args.dir, "generated"),
      template: "default",
      fetch: context.args.fetch,
    });

    const generator = new Generator(options);

    generator.on("schema.begin", async () => console.start("Fetching schema"));
    generator.on("schema.success", async () =>
      console.success("Schema fetched"),
    );
    generator.on("schema.failure", async (err) => {
      console.fail("Error fetching schema");
      console.error(err);
    });

    generator.on("file.format.error", async (file, err) => {
      console.error("Error formatting file", err);
    });

    generator.on("generation.begin", async () =>
      console.start("Starting generation"),
    );

    generator.on("generation.success", async () =>
      console.success("Generation finished"),
    );

    generator.on("generation.failure", async (err) => {
      console.fail("Generation errror", err);
      console.error(err);
    });

    await generator.initialize();
    await generator.generate();
  },
});
