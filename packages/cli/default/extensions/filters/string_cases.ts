import * as cc from "@wolfpkgs/core/strings";
import type { TemplateContext } from "../../../types/template";

function stringifyFirst(fn: (...args: any[]) => any) {
  return (context: TemplateContext, first: any, ...args: any[]) => {
    return fn(`${first}`, ...args).toString();
  };
}

export const ada_case = stringifyFirst(cc.toAda);
export const camel_case = stringifyFirst(cc.toCamel);
export const cobol_case = stringifyFirst(cc.toCobol);
export const const_case = stringifyFirst(cc.toConst);
export const cpp_case = stringifyFirst(cc.toCpp);
export const dot_case = stringifyFirst(cc.toDot);
export const kebab_case = stringifyFirst(cc.toKebab);
export const lower_case = stringifyFirst(cc.toLower);
export const lower_first_case = stringifyFirst(cc.toLowerFirst);
export const pascal_case = stringifyFirst(cc.toPascal);
export const path_case = stringifyFirst(cc.toPath);
export const sentence_case = stringifyFirst(cc.toSentence);
export const snake_case = stringifyFirst(cc.toSnake);
export const space_case = stringifyFirst(cc.toSpace);
export const train_case = stringifyFirst(cc.toTrain);
export const upper_case = stringifyFirst(cc.toUpper);
export const upper_first_case = stringifyFirst(cc.toUpperFirst);
export const words_case = stringifyFirst(cc.toWords);
