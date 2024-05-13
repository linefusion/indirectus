# Indirectus

## Overview

Just some Directus stuff.

## Type Generator

So, this is my take on the code generation for Directus, releasing it to catch some early bugs that might happen.

### Overview

Right now it's pretty simple and it's just going to output some types and utility functions that are compatible with the current Directus SDK, but it was designed to support custom outputs (because I use Directus in several different languages). Right now I won't expand (or document) on the templating side, because I still need to get to the final data model and make it stable to export to the template engine.

### Execution

```sh
npx indirectus sdk generate --url http://localhost:8055 --token <some-static-token-with-admin-privileges>
```

### Output

A local `.directus` folder will be created containing schema cache + the generated client output.

The `.directus/generated/client.ts` exports:

- Readable code.
- A `Schema` type with all your schema mappings (use it while creating the client with the SDK's `createDirectus<Schema>` method.)
- Several functions to pass to `client.request(fn)` to make data fetching cleaner.
- It's smart enough to dig into some commonly used interfaces in order to fetch their possible values (you'll see them as an union), but unfortunatle the SDK at the moment will strip them out (SDK bug?)

## Links

- https://github.com/linefusion/indirectus/
- https://www.npmjs.com/package/indirectus

# Contributing

Easiest way to develop, build and test is:

- Make sure to `pnpm install`
- Keep a terminal running `pnpm dev`
- Test CLI commands with `pnpm indirectus`, for example `pnpm indirectus sdk generate`
  - To make it easier, create a `.env` file on the workspace root containing your server settings
    - `DIRECTUS_URL=http://....`
    - `DIRECTUS_TOKEN=.....`
