"use client";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";

const SINGLETONS = ["homePage", "siteSettings"];

export default defineConfig({
  name: "default",
  title: "Lace & Luxe",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "h8sdwy2z",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list().title("Content").items([
          S.listItem().title("Home page").id("homePage").child(S.document().schemaType("homePage").documentId("homePage")),
          S.listItem().title("Site settings").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
        ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },
  document: {
    actions: (input, { schemaType }) =>
      SINGLETONS.includes(schemaType) ? input.filter(({ action }) => action !== "duplicate" && action !== "delete") : input,
  },
});
