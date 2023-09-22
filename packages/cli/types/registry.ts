import * as Shared from "@directus/shared/types";
import * as cc from "@wolfpkgs/core/strings";

import { contains } from "../default/extensions/filters/contains";

import {
  DirectusCollection,
  DirectusField,
  DirectusRelation,
  Schema,
} from "./schema";
import { Relationship, getRelationship } from "./relationships";

export class Type {
  constructor(
    public readonly raw: DirectusField,
    public readonly raw_relation: Relationship | null,
  ) {}

  public get directus() {
    return this.raw.type;
  }

  public get database() {
    return this.raw.schema?.data_type;
  }

  public get typescript() {
    return Type.to_typescript(this.raw);
  }

  public get is_data() {
    return !Type.is_special(this.raw, "no-data");
  }

  public get is_relationship() {
    return this.raw_relation !== null && this.raw_relation !== undefined;
  }

  public get relationship() {
    if (!this.raw_relation) {
      return undefined;
    }
    return this.raw_relation;
  }

  public get is_system() {
    return "system" in this.raw.meta && this.raw.meta.system;
  }

  public static is_special(field: DirectusField, tag: string) {
    const index = field.meta.special?.indexOf(tag);
    if (typeof index == "undefined") {
      return false;
    }
    return index >= 0;
  }

  public static to_typescript(field: DirectusField) {
    const types: Record<Shared.Type, string> = {
      alias: "string",
      boolean: "boolean",
      date: "Date",
      float: "number",
      geometry: "Geometry",
      integer: "number",
      json: "any",
      string: "string",
      text: "string",
      time: "Date",
      uuid: "string",
      "geometry.LineString": "LineString",
      "geometry.MultiLineString": "MultiLineString",
      "geometry.MultiPoint": "MultiPoint",
      "geometry.MultiPolygon": "MultiPolygon",
      "geometry.Point": "Point",
      "geometry.Polygon": "Polygon",
      bigInteger: "number",
      binary: "string",
      csv: "string",
      dateTime: "Date",
      decimal: "number",
      hash: "string",
      timestamp: "Date",
      unknown: "unknown",
    };

    const type = field.type as keyof typeof types;

    return type in types ? types[type] : "never";
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
    return contains(this.type.raw.meta?.special || [], "translations");
  }

  public get translations_collection() {
    return "TranslationsCollection";
  }
}

export class Collection {
  public readonly name: Identifier;
  public readonly fields: Field[] = [];

  constructor(public readonly raw: DirectusCollection) {
    this.name = new Identifier(raw.collection);
  }

  public get is_system() {
    return this.raw.meta.system || false;
  }

  public get is_singleton() {
    return this.raw.meta.singleton;
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
        return (a.type.raw.meta?.sort || 0) - (b.type.raw.meta?.sort || 0);
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
