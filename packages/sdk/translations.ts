import { Any, Test, Object, Union } from "ts-toolbelt";

/*
import { AssertTrue as Assert } from "conditional-type-checks";
export type LanguagesCode = string;

export type TranslationFields<
  Translation,
  LanguagesCode extends string = "languages_code"
> = {};

export type Translatable<
  Translation,
  Collection,
  TranslationsField extends string = "translations",
  LanguagesCode extends string = "languages_code"
> = {
  [field in TranslationsField]: TranslationFields<Translation, LanguagesCode>[];
} & {
  [Field in keyof Collection]: Collection[Field];
};

export type PostTranslation = {
  title: string;
  content: string;
  languages_code: LanguagesCode;
};

export type Post = {
  id: number;
  translations: PostTranslation[];
};
*/

//
// Languages
//

export declare const LanguageKey: unique symbol;
export type LanguageTag = { readonly [LanguageKey]: "language" };
export type Language = string & LanguageTag;
export type IsLanguage<T> = Any.Is<T, LanguageTag>;
export type NonLanguageKeys<Type extends object> = Object.FilterKeys<
  Type,
  LanguageTag
>;
export type LanguageKeys<Type extends object> = Union.Exclude<
  keyof Type,
  NonLanguageKeys<Type>
>;

//
// Translatable Fields
//

export declare const TranslatableKey: unique symbol;
export type TranslatableTag = { readonly [TranslatableKey]: "translatable" };
export type Translatable<T> = T & TranslatableTag;
export type IsTranslatable<T> = Any.Is<T, TranslatableTag>;
export type NonTranslatableKeys<Type extends object> = Object.FilterKeys<
  Type,
  TranslatableTag
>;
export type TranslatableKeys<Type extends object> = Union.Exclude<
  keyof Type,
  NonTranslatableKeys<Type>
>;

//
// Helper functions
//

export function translate<T>(value: T): Translatable<T> {
  return value as Translatable<T>;
}

//
// Collection
//

export declare const TranslationKey: unique symbol;
export type TranslationTag = { readonly [TranslationKey]: "Translation" };
export type Translation<T> = T & TranslationTag;
export type IsTranslation<T> = Any.Is<T, TranslationTag>;
export type NonTranslationKeys<Type extends object> = Object.FilterKeys<
  Type,
  TranslationTag
>;
export type TranslationKeys<Type extends object> = Union.Exclude<
  keyof Type,
  NonTranslationKeys<Type>
>;

export type Translated<Type extends object> = {
  [Field in keyof Type]: Type[Field];
};

//

////////////////////////////////////////////////////////

type TString = Translatable<string>;

// @ts-check
Test.checks([
  Test.check<Any.Is<TString, Translatable<string>>, 1, Test.Pass>(),
  Test.check<Any.Is<TString, TranslatableTag>, 1, Test.Pass>(),
]);

export type PostTranslation = {
  languages_code: Language;
  title: string;
  content: string;
};

export type Post = {
  id: number;
  slug: string;
  translations: Translation<PostTranslation>;
};

export type PostTranslationField = TranslationKeys<Post>;
export type PostTranslationLanguageField = LanguageKeys<
  Post[PostTranslationField]
>;

export type TranslatedPost = Translated<Post>;

export {};
