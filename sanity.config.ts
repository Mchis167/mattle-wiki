import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./src/sanity/schema";

export default defineConfig({
  basePath: "/studio",
  name: "default",
  title: "MattleWiki CMS",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "FILL_ME",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schema.types,
  },
});
