import type { SchemaTypeDefinition } from "sanity";
import { blockTypes } from "./blocks";
import { homePage, siteSettings } from "./documents";

export const schemaTypes: SchemaTypeDefinition[] = [homePage, siteSettings, ...blockTypes];
