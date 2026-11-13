import { defineArrayMember, defineField, defineType } from "sanity";
import { blockTypes } from "./blocks";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "blocks",
      title: "Sections, top to bottom",
      description: "Drag to reorder. Switch a section off or schedule it with 'Show from' and 'Hide after'. Remember to press Publish.",
      type: "array",
      of: blockTypes.map((t) => defineArrayMember({ type: t.name })),
    }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "announcementEnabled", title: "Show the top bar", type: "boolean", initialValue: true }),
    defineField({ name: "announcement", title: "Top bar text", type: "string", description: "The thin bar above the menu, on every page." }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
