import * as cc from "@wolfpkgs/core/strings";

import { contains } from "../default/extensions/filters/contains";

import { Relationship, getRelationship, isUnmapped } from "./relationships";
import {
  DirectusCollection,
  DirectusField,
  DirectusRelation,
  Schema,
} from "./schema";

export class Type {
  constructor(
    public readonly raw: Partial<DirectusField> | null,
    public readonly raw_relation: Relationship | null,
  ) {}

  public get directus() {
    return this.raw?.type ?? "unknown";
  }

  public get database() {
    return this.raw?.schema?.data_type ?? "unknown";
  }

  public get is_json() {
    return this.database == "json" || this.is_special("cast-json");
  }

  public is_special(flag: string) {
    return contains(null as any, this.raw?.meta?.special ?? [], flag);
  }

  public get is_data() {
    return !this.is_special("no-data");
  }

  public get is_relationship() {
    return this.raw_relation !== null && this.raw_relation !== undefined;
  }

  public get is_unmapped() {
    return (
      this.raw_relation !== null &&
      this.raw_relation !== undefined &&
      isUnmapped(this.raw_relation)
    );
  }

  public get relationship() {
    if (!this.raw_relation) {
      return undefined;
    }
    return this.raw_relation;
  }

  public get is_system() {
    return "system" in (this.raw?.meta ?? {}) && !!this.raw?.meta?.system;
  }
}

export class Identifier {
  constructor(public readonly raw: string) {}

  public get pascal() {
    return cc.toPascal(this.raw);
  }

  public get camel() {
    return cc.toCamel(this.raw);
  }

  public toString(): string {
    return this.raw;
  }
}

export class Field {
  public readonly name: Identifier;

  constructor(
    name: string,
    public readonly type: Type,
  ) {
    this.name = new Identifier(name);
  }

  public get is_system() {
    return this.type.is_system;
  }

  public get is_translations() {
    return contains(
      null as any,
      this.type.raw?.meta?.special ?? [],
      "translations",
    );
  }

  public get is_data() {
    return !contains(
      null as any,
      this.type.raw?.meta?.special ?? [],
      "no-data",
    );
  }

  public get is_alias() {
    return contains(null as any, this.type.raw?.meta?.special ?? [], "alias");
  }

  public get translations_collection() {
    return (this.type.relationship as any)?.ref?.collection;
  }
}

export class Collection {
  public readonly name: Identifier;
  public readonly fields: Field[] = [];

  constructor(public readonly raw: DirectusCollection) {
    this.name = new Identifier(raw.collection);
  }

  public get is_system() {
    return this.raw.meta?.system ?? false;
  }

  public get is_singleton() {
    return this.raw.meta?.singleton ?? false;
  }
}

export type RegistryData = {
  collections: Record<string, Collection>;
};

export class Registry {
  public readonly collections: Collection[] = [];

  constructor(public readonly schema: Schema) {
    const data: Record<
      string,
      {
        collection: Collection;
        fields: DirectusField[];
        relations: DirectusRelation[];
      }
    > = {};

    for (const $ of schema.collections) {
      const collectionInstance = new Collection($);
      this.collections.push(collectionInstance);
      data[$.collection] = {
        collection: collectionInstance,
        fields: schema.fields.filter(
          (field) => field.collection == $.collection,
        ),
        relations: schema.relations.filter(
          (field) => field.collection == $.collection,
        ),
      };
    }

    for (const $ of Object.values(data)) {
      for (const field of $.fields) {
        const newField = new Field(
          field.field,
          new Type(
            field,
            getRelationship(this.schema.fields, this.schema.relations, {
              collection: $.collection.name.raw,
              field: field.field,
            }),
          ),
        );
        $.collection.fields.push(newField);
      }

      // Sort by system then sort index
      $.collection.fields.sort((a, b) => {
        if (a.is_system && !b.is_system) {
          return -1;
        } else if (!a.is_system && b.is_system) {
          return 1;
        }
        return (a.type.raw?.meta?.sort ?? 0) - (b.type.raw?.meta?.sort ?? 0);
      });

      for (const relation of $.relations) {
        relation.collection = $.collection.name.raw;
      }
    }
  }

  public collection(name: string): Collection | undefined {
    return this.collections.find((collection) => collection.name.raw == name);
  }

  public toJSON(): Schema {
    return this.schema;
  }

  public static fromJSON(json: object): Registry {
    return new Registry(json as Schema);
  }
}

export function createRegistry(schema: Schema): Registry {
  return new Registry(schema);
}
