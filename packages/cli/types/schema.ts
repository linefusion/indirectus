import type * as Directus from "@directus/sdk";
import * as fs from "node:fs";

import {
  createDirectus,
  readCollections,
  readFields,
  readRelations,
  rest,
  staticToken,
} from "@directus/sdk";
import path from "node:path";

export type DirectusExtras = {
  directus_collections: {
    system?: boolean;
    sort?: number;
  };
};

export type DirectusCollection = Directus.DirectusCollection<DirectusExtras>;
export type DirectusField = Directus.DirectusField<DirectusExtras>;
export type DirectusRelation = Directus.DirectusRelation<DirectusExtras>;

export type Schema = {
  version: number;
  directus: string;
  vendor: string;
  collections: DirectusCollection[];
  fields: DirectusField[];
  relations: DirectusRelation[];
};

const ignoredCollections = ["directus_migrations", "directus_sessions"];

export async function fetchSchema(
  directus: { url: string; token: string },
  options: {
    cache?: string;
    fetch?: boolean;
  } = {
    fetch: false,
  },
) {
  const cache = options?.cache || process.env.DIRECTUS_SCHEMA_CACHE;
  const forceFetch = options?.fetch || false;

  let raw: Schema | null = null;

  if (cache) {
    const cacheDir = path.dirname(cache);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    if (fs.existsSync(cache)) {
      if (!fs.statSync(cache).isFile()) {
        throw new Error("Cache path is not a file");
      }
      if (!forceFetch) {
        raw = JSON.parse(fs.readFileSync(cache, "utf-8")) as any;
      }
    }
  }

  if (!raw) {
    const client = createDirectus<{}>(directus.url)
      .with(rest())
      .with(staticToken(directus.token));

    const collections = await client.request(readCollections());
    const fields = await client.request(readFields());
    const relations = await client.request(readRelations());

    // Patch for https://github.com/directus/directus/issues/20475
    const favicon = relations.find(
      (r) => r.collection == "directus_settings" && r.field == "public_favicon",
    );
    if (favicon && favicon.meta == null) {
      favicon.meta = {
        system: true,
        many_collection: "directus_settings",
        many_field: "public_favicon",
        one_collection: "directus_files",
        one_field: null,
        one_allowed_collections: null,
        one_collection_field: null,
        one_deselect_action: "nullify",
        junction_field: null,
        sort_field: null,
      } as any;
    }

    const url = new URL(directus.url);
    url.pathname = "/schema/snapshot";
    url.searchParams.set("export", "json");
    url.searchParams.set("access_token", directus.token);

    const schema = await fetch(url);
    const schemaJson = await schema.json();

    raw = {
      ...schemaJson,
      fields,
      collections,
      relations,
    };
  }

  if (cache) {
    fs.writeFileSync(cache, JSON.stringify(raw, null, 2));
  }

  const result = {
    ...raw,
    fields: raw!.fields.filter(
      (field) => ignoredCollections.indexOf(field.collection) < 0,
    ),
    collections: raw!.collections.filter(
      (col) =>
        ignoredCollections.indexOf(col.collection) < 0 && col.schema !== null,
    ),
    relations: raw!.relations,
  };

  return result as Schema;
}
