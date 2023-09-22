#!/usr/bin/env node

import { loadSync } from "@wolfpkgs/core/env";
import { createMain, defineCommand } from "citty";

const env = loadSync(process.cwd(), {});
process.env = {
  ...process.env,
  ...env,
};

export const command = defineCommand({
  meta: {
    name: "indirectus",
    description: "Indirectus CLI",
    version: require("../package.json").version,
  },
  subCommands: {
    sdk: () => require("./sdk").default,
  },
});

export default command;

if (require.main === module) {
  createMain(command)();
}
