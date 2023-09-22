import { defineCommand } from "citty";

export default defineCommand({
  meta: {
    name: "sdk",
    description: "Commands for SDKs",
  },
  subCommands: {
    generate: () => require("./generate").default,
  },
});
