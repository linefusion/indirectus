import { Collection, Field } from "../../../types/registry";

import { json } from "./json";
import { quote, quoted } from "./quote";

import { match } from "ts-pattern";
import type { TemplateContext } from "../../../types/template";
import { drop_first } from "./drop_first";
import { regex_replace } from "./regex_replace";
import { split } from "./split";
import { lower_case, pascal_case, space_case } from "./string_cases";

export function to_collection_text(
  context: TemplateContext,
  value: string,
  prefix: string = "",
  suffix: string = "",
) {
  return `${prefix}${lower_case(context, space_case(context, value))}${suffix}`;
}

export function to_collection_string(context: TemplateContext, value: String) {
  return quoted(context, value);
}

export function to_collection_name(
  context: TemplateContext,
  value: string,
  partial = false,
) {
  value = `${value}`;
  const system = context.registry.collections.find((c) => c.name.raw == value)
    ?.is_system;
  let name = pascal_case(context, value);
  if (system) {
    if (partial) {
      name = regex_replace(
        context,
        pascal_case(context, drop_first(context, split(context, value, "_"))),
        "s$",
        "",
      );
      name = name == "Setting" ? "Settings" : name;
    } else {
      name = regex_replace(context, pascal_case(context, value), "s$", "");
      name = name == "DirectusSetting" ? "DirectusSettings" : name;
    }
  }
  return name;
}

export function to_ts_type(context: TemplateContext, field: Field) {
  if (!field.type.is_data) {
    return "never";
  }

  let types: string[] = [];
  let schema = field.type;
  let meta = field.type.raw.meta;
  let nullable = false;
  let isUnknown = true;

  const _push = types.push;
  types.push = (...args: string[]): number => {
    isUnknown = false;
    return _push.apply(
      types,
      args.filter((v) => v != "never"),
    );
  };

  let db_type = match(
    field?.type?.database?.split("(", 2)[0]!.toLowerCase().trim(),
  )
    .returnType<string | false>()
    .with("uuid", () => "Types.UUID")
    .with("json", () => "Types.JSON")
    .with("text", () => "Types.String")
    .with("integer", () => "Types.Integer")
    .with("decimal", () => "Types.Decimal")
    .with("numeric", () => "Types.Number")
    .with("bigint", () => "Types.BigInteger")
    .with("boolean", () => "Types.Boolean")
    .with("character varying", () => "Types.String")
    .with("date", () => "Types.Date")
    .with("time", () => "Types.DateTime")
    .with("time with time zone", () => "Types.DateTime")
    .with("time without time zone", () => "Types.DateTime")
    .with("timestamp", () => "Types.DateTime")
    .with("timestamp with time zone", () => "Types.DateTime")
    .with("timestamp without time zone", () => "Types.DateTime")

    // Shared
    .with("boolean", () => "Types.Boolean")
    .with("tinyint", () => "Types.Integer")
    .with("smallint", () => "Types.Integer")
    .with("mediumint", () => "Types.Integer")
    .with("int", () => "Types.Integer")
    .with("integer", () => "Types.Integer")
    .with("serial", () => "Types.Integer")
    .with("bigint", () => "Types.BigInteger")
    .with("bigserial", () => "Types.BigInteger")
    .with("clob", () => "Types.Text")
    .with("tinytext", () => "Types.Text")
    .with("mediumtext", () => "Types.Text")
    .with("longtext", () => "Types.Text")
    .with("text", () => "Types.Text")
    .with("varchar", () => "Types.String")
    .with("longvarchar", () => "Types.String")
    .with("varchar2", () => "Types.String")
    .with("nvarchar", () => "Types.String")
    .with("image", () => "Types.Binary")
    .with("ntext", () => "Types.Text")
    .with("char", () => "Types.String")
    .with("date", () => "Types.Date")
    .with("datetime", () => "Types.DateTime")
    .with("dateTime", () => "Types.DateTime")
    .with("timestamp", () => "Types.DateTime")
    .with("time", () => "Types.DateTime")
    .with("float", () => "Types.Float")
    .with("double", () => "Types.Float")
    .with("double precision", () => "Types.Float")
    .with("real", () => "Types.Float")
    .with("decimal", () => "Types.Decimal")
    .with("numeric", () => "Types.Integer")

    // Geometries
    .with("geometry", () => "Types.Geometry.Geometry")
    .with("point", () => "Types.Geometry.Point")
    .with("linestring", () => "Types.Geometry.LineString")
    .with("polygon", () => "Types.Geometry.Polygon")
    .with("multipoint", () => "Types.Geometry.MultiPoint")
    .with("multilinestring", () => "Types.Geometry.MultiLineString")
    .with("multipolygon", () => "Types.Geometry.MultiPolygon")

    // MySQL
    .with("string", () => "Types.Text")
    .with("year", () => "Types.Integer")
    .with("blob", () => "Types.Binary")
    .with("mediumblob", () => "Types.Binary")
    .with("int unsigned", () => "Types.Integer")
    .with("tinyint unsigned", () => "Types.Integer")
    .with("smallint unsigned", () => "Types.Integer")
    .with("mediumint unsigned", () => "Types.Integer")
    .with("bigint unsigned", () => "Types.Integer")

    // MS SQL
    .with("bit", () => "Types.Boolean")
    .with("smallmoney", () => "Types.Float")
    .with("money", () => "Types.Float")
    .with("datetimeoffset", () => "Types.DateTime")
    .with("datetime2", () => "Types.DateTime")
    .with("smalldatetime", () => "Types.DateTime")
    .with("nchar", () => "Types.Text")
    .with("binary", () => "Types.Binary")
    .with("varbinary", () => "Types.Binary")
    .with("uniqueidentifier", () => "Types.UUID")

    // Postgres
    .with("json", () => "Types.JSON")
    .with("jsonb", () => "Types.JSON")
    .with("uuid", () => "Types.UUID")
    .with("int2", () => "Types.Integer")
    .with("serial4", () => "Types.Integer")
    .with("int4", () => "Types.Integer")
    .with("serial8", () => "Types.Integer")
    .with("int8", () => "Types.Integer")
    .with("bool", () => "Types.Boolean")
    .with("character varying", () => "Types.String")
    .with("character", () => "Types.String")
    .with("interval", () => "Types.String")
    .with("_varchar", () => "Types.String")
    .with("bpchar", () => "Types.String")
    .with("timestamptz", () => "Types.DateTime")
    .with("timestamp with time zone", () => "Types.DateTime")
    .with("timestamp with local time zone", () => "Types.DateTime")
    .with("timestamp without time zone", () => "Types.Date")
    .with("timestamp without local time zone", () => "Types.Date")
    .with("timetz", () => "Types.DateTime")
    .with("time with time zone", () => "Types.DateTime")
    .with("time without time zone", () => "Types.DateTime")
    .with("float4", () => "Types.Float")
    .with("float8", () => "Types.Float")
    .with("citext", () => "Types.Text")

    // Oracle
    .with("number", () => "Types.Integer")
    .with("sdo_geometry", () => "Types.Geometry.Geometry")

    // SQLite
    .with("integerfirst", () => "Types.Integer")

    .otherwise(() => false);

  if (db_type) {
    types.push(db_type);
  }

  let json_type: string | false = false;
  if (field.type.is_json) {
    if ("json_schema" in schema) {
      json_type = "Types.JSONSchema";
    } else {
      json_type = "Types.JSON";
    }
  }

  switch (meta.interface) {
    case "tags":
      types.unshift("Types.String[]");
      break;
    case "select-dropdown":
      let values = (meta?.options?.choices || []).map((v: any) =>
        quote(context, v.value),
      );
      for (let value of values) {
        if (value == null) {
          nullable = true;
        } else {
          types.unshift(value);
        }
      }
      json_type = false;
      break;
  }

  if (schema.raw.schema?.is_nullable) {
    // types.push('null')
    nullable = true;
  }

  if (json_type != false) {
    types.unshift(json_type);
  }

  if (field.type.is_relationship) {
    if (
      field.type.is_special("user-created") ||
      field.type.is_special("user-updated")
    ) {
      types.push("Collections.DirectusUser");
    } else if (field.type.is_special("file")) {
      types.push("Collections.DirectusFile");
    } else if (field.type.is_special("files")) {
      types.push("Collections.DirectusFile[]");
    } else if (field.is_translations) {
      types.push(
        `${to_collection_name(context, field.translations_collection)}[]`,
      );
    } else {
      if (field.type.relationship?.type == "o2m") {
        types.push(
          "Collections." +
            to_collection_name(context, field.type.relationship.ref.collection),
        );
      }
      if (field.type.relationship?.type == "m2o") {
        types.push(
          "Collections." +
            to_collection_name(context, field.type.relationship.ref.collection),
        );
      }
      if (field.type.relationship?.type == "a2o") {
        field.type.relationship.refs.forEach((ref) => {
          "Collections." +
            types.push(to_collection_name(context, ref.collection));
        });
      }
    }
  }

  if (types.length <= 0) {
    let schemaStr = json(context, schema);
    let metaStr = json(context, meta);
    let unknown = `Types.UnknownType<{ schema: ${schemaStr}, meta: ${metaStr} }>`;
    types.unshift(unknown);
  }

  let output = types.join(" | ");
  if (nullable) {
    output = `Types.Optional<${output}>`;
  }

  return output;
}

export function only_system_fields(context: TemplateContext, fields: Field[]) {
  return fields.filter((field) => field.is_system);
}

export function only_custom_fields(context: TemplateContext, fields: Field[]) {
  return fields.filter((field) => !field.is_system);
}

export function only_with_custom_fields(
  context: TemplateContext,
  collections: Collection[],
) {
  return collections.filter(
    (field) => field.fields.filter((field) => !field.is_system).length > 0,
  );
}
