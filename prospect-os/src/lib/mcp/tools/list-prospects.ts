// src/lib/mcp/tools/list-prospects.ts
import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_prospects",
  title: "List prospects",
  description:
    "List prospects from the Prospect Master. Supports filtering by region, segment, fit category, city, and qualification status. Returns basic fields for each prospect.",
  inputSchema: {
    region_id: z.string().uuid().optional().describe("Filter by region UUID."),
    segment: z.string().optional().describe("Filter by segment slug."),
    fit_category: z
      .enum(["A", "B", "C", "rejected"])
      .optional()
      .describe("Filter by lead fit category."),
    city: z.string().optional().describe("Filter by actual city name (case-insensitive contains)."),
    qualification_status: z
      .string()
      .optional()
      .describe("Filter by qualification_status equal match."),
    limit: z.number().int().min(1).max(200).default(50).describe("Max rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (
    { region_id, segment, fit_category, city, qualification_status, limit },
    ctx,
  ) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = supabaseForUser(ctx)
      .from("prospects")
      .select(
        "id, company_name, actual_city, target_city, segment, region_id, fit_category, lead_score, qualification_status, website_url, phone, has_mobile_or_whatsapp",
      )
      .limit(limit ?? 50);
    if (region_id) q = q.eq("region_id", region_id);
    if (segment) q = q.eq("segment", segment);
    if (fit_category) q = q.eq("fit_category", fit_category);
    if (qualification_status) q = q.eq("qualification_status", qualification_status);
    if (city) q = q.ilike("actual_city", `%${city}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { count: data?.length ?? 0, rows: data ?? [] },
    };
  },
});
