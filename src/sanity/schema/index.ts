import { type SchemaTypeDefinition } from "sanity";
import { CharacterSchema } from "./character";
import { AbilitySchema } from "./ability";
import { ItemSchema } from "./item";
import { MonsterSchema } from "./monster";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [CharacterSchema, AbilitySchema, ItemSchema, MonsterSchema],
};
