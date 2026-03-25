import { defineField, defineType } from "sanity";

export const ItemSchema = defineType({
  name: "item",
  title: "Item",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "acquireThrough",
      title: "Acquire Through",
      type: "string",
      options: {
        list: [
          { title: "Chest", value: "Chest" },
          { title: "Store", value: "Store" },
          { title: "Event", value: "Event" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Item Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
  ],
});
