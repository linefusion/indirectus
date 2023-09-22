import { Field } from "../../../types/registry";

import { contains } from "./contains";
import { json } from "./json";
import { quote, quoted } from "./quote";

import { match } from "ts-pattern";
import { lower_case, pascal_case, space_case } from "./string_cases";
import { drop_first } from "./drop_first";
import { split } from "./split";
import { regex_replace } from "./regex_replace";
import type { TemplateContext } from "../../../types/template";

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

  let db_type = match(field?.type?.database)
    .returnType<string | false>()
    .with("uuid", () => "UUID")
    .with("json", () => "UUID")
    .with("text", () => "string")
    .with("integer", () => "number")
    .with("decimal", () => "number")
    .with("numeric", () => "number")
    .with("bigint", () => "BigInt")
    .with("boolean", () => "boolean")
    .with("character varying", () => "string")
    .with("date", () => "Date")
    .with("time", () => "Date")
    .with("time with time zone", () => "Date")
    .with("time without time zone", () => "Date")
    .with("timestamp", () => "Date")
    .with("timestamp with time zone", () => "Date")
    .with("timestamp without time zone", () => "Date")
    .otherwise(() => false);

  if (db_type) {
    types.push(db_type);
  }

  let json_type: string | false = false;
  if (field.type.is_json) {
    if ("json_schema" in schema) {
      json_type = '"json_schema"';
    } else {
      json_type = "any";
    }
  }

  switch (meta.interface) {
    case "tags":
      types.unshift("string[]");
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
          to_collection_name(context, field.type.relationship.ref.collection),
        );
      }
      if (field.type.relationship?.type == "m2o") {
        types.push(
          to_collection_name(context, field.type.relationship.ref.collection),
        );
      }
      if (field.type.relationship?.type == "a2o") {
        field.type.relationship.refs.forEach((ref) => {
          types.push(to_collection_name(context, ref.collection));
        });
      }
    }
  }

  if (types.length <= 0) {
    let schemaStr = json(context, schema);
    let metaStr = json(context, meta);
    let unknown = `UnknownType<{ schema: ${schemaStr}, meta: ${metaStr} }>`;
    types.unshift(unknown);
  }

  let output = types.join(" | ");
  if (nullable) {
    output = `Optional<${output}>`;
  }

  return output;
}
