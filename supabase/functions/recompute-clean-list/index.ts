// Admin-only: recompute clean_list_eligible for all prospects using current criteria.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
    authHeader.replace("Bearer ", ""),
  );
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const uid = claims.claims.sub as string;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: uid, _role: "admin" });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Recompute for every prospect via one SQL round trip.
  // Eligible = fit A/B/C AND lead_score>=70 AND redesign_score>=70
  //          AND website_review_status='reviewed'
  //          AND qualification_status NOT LIKE 'rejected%'
  //          AND is_test_record = false.
  const { data: eligibleRows, error: selErr } = await admin
    .from("prospects")
    .select("id")
    .eq("is_test_record", false)
    .eq("website_review_status", "reviewed")
    .in("fit_category", ["A", "B", "C"])
    .gte("lead_score", 70)
    .gte("redesign_score", 70)
    .not("qualification_status", "like", "rejected%");
  if (selErr) {
    return new Response(JSON.stringify({ error: selErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const eligibleIds = (eligibleRows ?? []).map((r) => r.id);

  // Set everything to false first.
  const { error: falseErr, count: falseCount } = await admin
    .from("prospects")
    .update({ clean_list_eligible: false }, { count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (falseErr) {
    return new Response(JSON.stringify({ error: falseErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let trueCount = 0;
  if (eligibleIds.length) {
    const { error: trueErr, count } = await admin
      .from("prospects")
      .update({ clean_list_eligible: true }, { count: "exact" })
      .in("id", eligibleIds);
    if (trueErr) {
      return new Response(JSON.stringify({ error: trueErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    trueCount = count ?? eligibleIds.length;
  }

  return new Response(JSON.stringify({
    status: "success",
    scanned: falseCount ?? 0,
    clean_list_eligible_true: trueCount,
    clean_list_eligible_false: (falseCount ?? 0) - trueCount,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
