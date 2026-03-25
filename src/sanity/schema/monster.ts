import { defineField, defineType } from "sanity";

export const MonsterSchema = defineType({
  name: "monster",
  title: "Monster",
  type: "document",
  fields: [
    // Index fields
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Monster Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),

    // Detail fields
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "monsterType",
      title: "Monster Type",
      type: "string",
      options: {
        list: [
          { title: "Melee", value: "Melee" },
          { title: "Ranged", value: "Ranged" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "collection",
      title: "Collection",
      type: "string",
      options: {
        list: [
          { title: "Normal", value: "Normal" },
          { title: "MiniBoss", value: "MiniBoss" },
          { title: "Boss", value: "Boss" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "spawnTime",
      title: "Spawn Time (seconds)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    // Arrays
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        {
          type: "object",
          name: "monsterStat",
          fields: [
            { name: "statName", type: "string", validation: (Rule) => Rule.required() },
            { name: "statValue", type: "number", validation: (Rule) => Rule.required() },
          ],
        },
      ],
    }),
    defineField({
      name: "abilities",
      title: "Abilities",
      type: "array",
      of: [
        {
          type: "object",
          name: "monsterAbility",
          fields: [
            { name: "name", type: "string", validation: (Rule) => Rule.required() },
            { name: "description", type: "string", validation: (Rule) => Rule.required() },
            { name: "videoSource", type: "url" },
          ],
        },
      ],
    }),
    defineField({
      name: "dropRateGems",
      title: "Drop Rate Gems",
      type: "array",
      of: [
        {
          type: "object",
          name: "gemDrop",
          fields: [
            {
              name: "gemColor",
              type: "string",
              options: {
                list: [
                  { title: "Blue", value: "blue" },
                  { title: "Green", value: "green" },
                  { title: "Red", value: "red" },
                  { title: "Purple", value: "purple" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            { name: "dropRate", type: "number", validation: (Rule) => Rule.required().min(0).max(100) },
          ],
        },
      ],
    }),
    defineField({
      name: "dropRateChests",
      title: "Drop Rate Chests",
      type: "array",
      of: [
        {
          type: "object",
          name: "chestDrop",
          fields: [
            { name: "chestName", type: "string", validation: (Rule) => Rule.required() },
            { name: "dropRate", type: "number", validation: (Rule) => Rule.required().min(0).max(100) },
          ],
        },
      ],
    }),
  ],
});
