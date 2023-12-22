import { DirectusField, DirectusRelation } from "./schema";

export type RelationshipReference = {
  collection: string;
  pk: string;
};

export type OneToMany = {
  type: "o2m";
  collection: string;
  field: string;
  many: true;
  ref: RelationshipReference;
};

export type ManyToOne = {
  type: "m2o";
  collection: string;
  field: string;
  many: false;
  ref: RelationshipReference;
};

export type AnyToOne = {
  type: "a2o";
  collection: string;
  field: string;
  refs: RelationshipReference[];
};

export type Unmapped = {
  type: "unmapped";
  collection: string;
};

export type Relationship = Unmapped | OneToMany | ManyToOne | AnyToOne | null;

export class UnmappedRelationship extends Error {
  public constructor(public readonly collection: string) {
    super("Can't find primary key for collection " + collection);
  }
}

export function isRelationship(
  relationship?: Relationship,
): relationship is Exclude<Relationship, null> {
  return !!relationship;
}

export function isOneToMany(
  relationship?: Relationship,
): relationship is OneToMany {
  return relationship?.type === "o2m";
}

export function isUnmapped(
  relationship?: Relationship,
): relationship is Unmapped {
  return relationship?.type === "unmapped";
}

export function isManyToOne(
  relationship?: Relationship,
): relationship is ManyToOne {
  return relationship?.type === "m2o";
}

export function isAnyToOne(
  relationship?: Relationship,
): relationship is AnyToOne {
  return relationship?.type === "a2o";
}

export function getRelationship(
  fields: DirectusField[],
  relations: DirectusRelation[],
  context: {
    collection: string;
    field: string;
  },
): Relationship {
  const { collection, field } = context;
  const relationship = relations.find(
    (relation) =>
      (relation.collection == collection && relation.field === field) ||
      (relation.related_collection === collection &&
        relation.meta?.one_field === field),
  );

  if (!relationship) {
    return null;
  }

  const parseCollections = (
    collections: string | string[],
  ): RelationshipReference[] => {
    if (!Array.isArray(collections)) {
      collections = collections.split(",");
    }

    return collections
      .map((collection) => collection.trim())
      .map((collection) => ({
        collection: collection,
        pk: findPrimaryKey(collection),
      }));
  };

  const findPrimaryKey = (collection: string) => {
    const field = fields.find(
      (candidate) =>
        candidate.collection == collection && candidate.schema?.is_primary_key,
    );
    if (!field) {
      throw new UnmappedRelationship(collection);
    }
    return field.field;
  };

  const meta: typeof relationship.meta | null = relationship.meta as any;

  try {
    if (meta) {
      if (
        relationship.collection === collection &&
        relationship.field === field &&
        meta.one_collection_field &&
        meta.one_allowed_collections
      ) {
        return {
          type: "a2o",
          collection,
          field,
          refs: parseCollections(meta.one_allowed_collections),
        };
      }

      if (
        relationship.collection === collection &&
        relationship.field === field &&
        meta.one_collection
      ) {
        return {
          type: "m2o",
          many: false,
          collection,
          field,
          ref: {
            collection: meta.one_collection,
            pk: findPrimaryKey(meta.one_collection),
          },
        };
      }

      if (
        relationship.related_collection === collection &&
        meta.one_field === field
      ) {
        return {
          type: "o2m",
          many: true,
          collection,
          field,
          ref: {
            collection: meta.many_collection!,
            pk: findPrimaryKey(meta.many_collection!),
          },
        };
      }
    } else {
      return {
        type: "m2o",
        many: false,
        collection,
        field,
        ref: {
          collection: relationship.related_collection,
          pk: findPrimaryKey(relationship.related_collection),
        },
      };
    }
  } catch (e) {
    if (e instanceof UnmappedRelationship) {
      return {
        type: "unmapped",
        collection: e.collection,
      };
    }
  }

  return null;
}
