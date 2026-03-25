import { defineField, defineType } from "sanity";

export const AbilitySchema = defineType({
  name: "ability",
  title: "Ability",
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
      title: "Ability Icon",
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
      name: "abilityType",
      title: "Ability Type",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "Active" },
          { title: "Passive", value: "Passive" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subType",
      title: "Sub Type",
      type: "string",
      options: {
        list: [
          { title: "AoE", value: "AoE" },
          { title: "Single Target", value: "Single" },
          { title: "Buff", value: "Buff" },
          { title: "Debuff", value: "Debuff" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rarity",
      title: "Rarity",
      type: "string",
      options: {
        list: [
          { title: "Common", value: "Common" },
          { title: "Rare", value: "Rare" },
          { title: "Epic", value: "Epic" },
          { title: "Legendary", value: "Legendary" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "character",
      title: "Exclusive Character",
      type: "reference",
      to: [{ type: "character" }],
      description: "Optional: If this ability is exclusive to a specific character",
    }),

    // Stats & Upgrades
    defineField({
      name: "stats",
      title: "Stats & Upgrades",
      type: "array",
      of: [
        {
          type: "object",
          name: "statItem",
          fields: [
            { name: "statName", type: "string", validation: (Rule) => Rule.required() },
            { name: "statValue", type: "number", validation: (Rule) => Rule.required() },
            {
              name: "upgradeTable",
              type: "object",
              fields: [
                { name: "columns", type: "array", of: [{ type: "string" }] },
                { name: "values", type: "array", of: [{ type: "number" }] },
              ],
            },
          ],
        },
      ],
    }),

    // Media
    defineField({
      name: "audio",
      title: "Audio Effect",
      type: "object",
      fields: [
        { name: "audioName", type: "string", validation: (Rule) => Rule.required() },
        { name: "audioSource", type: "url", validation: (Rule) => Rule.required() },
      ],
    }),
    defineField({
      name: "inGameVideos",
      title: "In-Game Videos",
      type: "array",
      of: [
        {
          type: "object",
          name: "abilityVideo",
          fields: [
            { name: "videoSource", type: "url", validation: (Rule) => Rule.required() },
            { name: "videoThumb", type: "image", validation: (Rule) => Rule.required() },
          ],
        },
      ],
    }),
  ],
});
