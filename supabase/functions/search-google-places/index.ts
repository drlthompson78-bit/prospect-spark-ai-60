// Edge function: search-google-places
// Calls Google Places Text Search (New) server-side and stores prospects.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const DIRECTORY_DOMAINS = [
  "werkspot.nl","mijndomein.nl","bouwmaat.nl","zoofy.nl","homedeal.nl",
  "offerteadviseur.nl","offertevergelijker.nl","homerun.nl","stratech.nl",
  "vindingrijk.nu","klussenwijzer.nl","offertes.nl","alleklussen.nl",
  "trustoo.nl","installatiepartner.nl","kliksafe.nl","yelp.com","facebook.com",
  "linkedin.com","instagram.com","google.com","goudengids.nl","telefoonboek.nl"
];

function isDirectory(url: string | null): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return DIRECTORY_DOMAINS.some((d) => host === d || host.endsWith("." + d));
  } catch { return false; }
}

function normalizeNL(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return "+" + digits.slice(2);
  if (digits.startsWith("0")) return "+31" + digits.slice(1);
  return digits;
}

function isMobileNL(e164: string | null): boolean {
  if (!e164) return false;
  return e164.startsWith("+316") || e164.startsWith("+31 6");
}

const PREMIUM_SEGMENTS = new Set([
  "loodgieter","installatiebedrijf","dakdekker","elektricien",
  "aannemer","onderhoudsbedrijf","cv installateur","warmtepomp installateur"
]);

function scoreProspect(p: {
  website_url: string | null;
  has_mobile_or_whatsapp: boolean;
  is_directory: boolean;
  segment: string;
  review_count: number;
  has_phone: boolean;
}) {
  let score = 0;
  // Outdated website heuristic: no website = strong signal; else default modest
  if (!p.website_url) score += 25;
  else score += 10; // placeholder — later replaced by real analysis
  if (p.has_mobile_or_whatsapp) score += 20;
  if (!p.is_directory && p.website_url) score += 20;
  if (PREMIUM_SEGMENTS.has(p.segment.toLowerCase())) score += 15;
  if (p.review_count >= 5) score += 10;
  if (p.website_url) score += 10; // weak CTA placeholder
  if (p.website_url) score += 10; // mobile matig placeholder
  if (p.has_phone && p.review_count < 50) score += 10;
  return Math.min(score, 120);
}

function fitCategory(score: number, hardOk: boolean): string {
  if (!hardOk) return "rejected";
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 70) return "C";
  return "rejected";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const userId = claims.claims.sub;

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GOOGLE_PLACES_API_KEY is not configured. Add it in Project Settings → Secrets." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const body = await req.json();
    const { query, region_id, segment, city, max_results } = body ?? {};
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const maxResults = Math.min(Math.max(Number(max_results) || 20, 1), 20);

    // Create search job
    const { data: job } = await supabase.from("search_jobs").insert({
      created_by: userId,
      region_id: region_id ?? null,
      segment: segment ?? null,
      query,
      status: "running",
    }).select().single();

    const fieldMask = [
      "places.id","places.displayName","places.formattedAddress",
      "places.nationalPhoneNumber","places.internationalPhoneNumber",
      "places.websiteUri","places.rating","places.userRatingCount",
      "places.location","places.businessStatus","places.types"
    ].join(",");

    const gRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: maxResults, languageCode: "nl", regionCode: "NL" }),
    });

    if (!gRes.ok) {
      const errText = await gRes.text();
      await supabase.from("search_jobs").update({
        status: "failed", error_message: errText.slice(0, 500), completed_at: new Date().toISOString(),
      }).eq("id", job!.id);
      return new Response(JSON.stringify({ error: "Google Places error", detail: errText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const gData = await gRes.json();
    const places = (gData.places ?? []) as any[];
    const results: any[] = [];
    let created = 0;

    for (const pl of places) {
      const placeId = pl.id as string;
      const website = pl.websiteUri as string | null ?? null;
      const phoneMain = pl.internationalPhoneNumber ?? pl.nationalPhoneNumber ?? null;
      const phoneE164 = normalizeNL(pl.nationalPhoneNumber ?? pl.internationalPhoneNumber ?? null);
      const hasMobile = isMobileNL(phoneE164);
      const isDir = isDirectory(website);
      const reviewCount = pl.userRatingCount ?? 0;
      const seg = segment ?? "";
      const companyName = pl.displayName?.text ?? "Onbekend";

      // Dedup on google_place_id
      const { data: existing } = await supabase.from("prospects")
        .select("id").eq("google_place_id", placeId).maybeSingle();
      if (existing) {
        results.push({ status: "duplicate", company_name: companyName, prospect_id: existing.id });
        continue;
      }

      const hardOk =
        !!website &&
        !isDir &&
        (!!phoneMain || hasMobile) &&
        PREMIUM_SEGMENTS.has(seg.toLowerCase());

      const score = scoreProspect({
        website_url: website,
        has_mobile_or_whatsapp: hasMobile,
        is_directory: isDir,
        segment: seg,
        review_count: reviewCount,
        has_phone: !!phoneMain,
      });
      const fit = fitCategory(score, hardOk);

      let exclusionReason: string | null = null;
      if (!hardOk) {
        if (!website) exclusionReason = "Geen eigen website";
        else if (isDir) exclusionReason = "Directory/leadsite";
        else if (!phoneMain && !hasMobile) exclusionReason = "Geen zichtbaar telefoonnummer";
        else if (!PREMIUM_SEGMENTS.has(seg.toLowerCase())) exclusionReason = "Segment buiten scope";
      }

      const insertRow = {
        region_id: region_id ?? null,
        company_name: companyName,
        segment: seg || null,
        city: city ?? null,
        address: pl.formattedAddress ?? null,
        latitude: pl.location?.latitude ?? null,
        longitude: pl.location?.longitude ?? null,
        google_place_id: placeId,
        website_url: website,
        phone_main: phoneMain,
        phone_mobile_e164: hasMobile ? phoneE164 : null,
        whatsapp_visible: hasMobile,
        google_rating: pl.rating ?? null,
        google_review_count: reviewCount,
        business_status: pl.businessStatus ?? null,
        source_type: "google_places",
        is_directory_or_leadsite: isDir,
        has_own_website: !!website,
        has_visible_phone: !!phoneMain,
        has_mobile_or_whatsapp: hasMobile,
        lead_score: score,
        fit_category: fit,
        exclusion_reason: exclusionReason,
        reason_fit: hardOk
          ? `Segment ${seg}, ${hasMobile ? "mobiel zichtbaar" : "vaste lijn"}, ${reviewCount} reviews.`
          : null,
        last_verified_at: new Date().toISOString(),
      };

      const { data: inserted, error: insErr } = await supabase.from("prospects")
        .insert(insertRow).select("id").single();

      if (insErr) {
        results.push({ status: "duplicate", company_name: companyName, error: insErr.message });
        continue;
      }

      await supabase.from("prospect_events").insert({
        prospect_id: inserted!.id,
        event_type: "sourced",
        event_note: `Sourced via Google Places (query: ${query})`,
        created_by: userId,
      });

      results.push({
        status: fit === "rejected" ? "rejected" : "created",
        company_name: companyName,
        prospect_id: inserted!.id,
        fit_category: fit,
        lead_score: score,
      });
      created += 1;
    }

    await supabase.from("search_jobs").update({
      status: "completed",
      results_found: places.length,
      prospects_created: created,
      completed_at: new Date().toISOString(),
    }).eq("id", job!.id);

    return new Response(JSON.stringify({ job_id: job!.id, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
