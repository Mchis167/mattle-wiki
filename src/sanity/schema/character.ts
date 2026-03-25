import { defineField, defineType } from "sanity";

export const CharacterSchema = defineType({
  name: "character",
  title: "Character",
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
      title: "Main Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "energyCons",
      title: "Energy Consumption",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),

    // Detail fields
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "health",
      title: "Health",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "armor",
      title: "Armor",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "speed",
      title: "Speed",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "luck",
      title: "Luck",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "weapon",
      title: "Weapon",
      type: "reference",
      to: [{ type: "ability" }], // Ability schema will be created in next issue
    }),
    defineField({
      name: "skinImages",
      title: "Skin Carousel Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),

    // Dynamic fields
    defineField({
      name: "howToUnlock",
      title: "How to Unlock",
      type: "array",
      of: [
        {
          type: "object",
          name: "unlockMethod",
          fields: [
            { name: "title", type: "string", validation: (Rule) => Rule.required() },
            { name: "description", type: "string", validation: (Rule) => Rule.required() },
            { name: "badgeLabel", type: "string" },
            { name: "externalLink", type: "url" },
          ],
        },
      ],
    }),
    defineField({
      name: "specialSkins",
      title: "Special Skins",
      type: "array",
      of: [
        {
          type: "object",
          name: "specialSkin",
          fields: [
            { name: "skinName", type: "string", validation: (Rule) => Rule.required() },
            { name: "skinImage", type: "image", validation: (Rule) => Rule.required() },
            { name: "description", type: "string" },
            { name: "externalLink", type: "url" },
          ],
        },
      ],
    }),
    defineField({
      name: "inGameVideos",
      title: "In-Game Videos",
      type: "array",
      of: [
        {
          type: "object",
          name: "inGameVideo",
          fields: [
            { name: "videoSource", type: "url", title: "Video URL / Source" },
            { name: "videoThumb", type: "image", validation: (Rule) => Rule.required() },
          ],
        },
      ],
    }),
  ],
});
