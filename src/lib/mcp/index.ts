// src/lib/mcp/index.ts
import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProspectsTool from "./tools/list-prospects";
import getProspectTool from "./tools/get-prospect";
import listRegionsTool from "./tools/list-regions";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "prospect-os-mcp",
  title: "Prospect OS",
  version: "0.1.0",
  instructions:
    "Tools for the Prospect OS scan platform. Use `list_prospects` to browse the prospect master, `get_prospect` for a single record, and `list_regions` for the configured sourcing regions. All tools run as the signed-in user via Supabase RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProspectsTool, getProspectTool, listRegionsTool],
});
