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

// NL city names commonly used in leadsite domains / generic brand names
const NL_CITIES = [
  "amsterdam","rotterdam","utrecht","den-haag","denhaag","the-hague","haag",
  "eindhoven","groningen","tilburg","almere","breda","nijmegen","apeldoorn",
  "haarlem","arnhem","enschede","zaanstad","amersfoort","zwolle","leiden",
  "maastricht","dordrecht","ede","alphen","alkmaar","delft","hilversum",
  "leeuwarden","gouda","hengelo","capelle","spijkenisse","hoofddorp","zoetermeer"
];
const GENERIC_TRADE_WORDS = [
  "loodgieter","dakdekker","elektricien","installateur","klusbedrijf",
  "aannemer","cv","warmtepomp","groepenkast","onderhoud","goedkope","goedkoop",
  "spoed","24uur","24-uurs","service"
];

function isDirectory(url: string | null): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return DIRECTORY_DOMAINS.some((d) => host === d || host.endsWith("." + d));
  } catch { return false; }
}

// Heuristic: domain or company name looks like a generic city+trade leadsite / SEO doorway.
function looksLikeLeadsite(url: string | null, companyName: string): { flag: boolean; reason: string } {
  const name = (companyName || "").toLowerCase();
  let host = "";
  let hostCore = "";
  let utm = false;
  if (url) {
    try {
      const u = new URL(url);
      host = u.hostname.replace(/^www\./, "").toLowerCase();
      hostCore = host.split(".")[0] ?? "";
      utm = Array.from(u.searchParams.keys()).some((k) => k.toLowerCase().startsWith("utm_"));
    } catch { /* ignore */ }
  }
  const cityInHost = NL_CITIES.some((c) => hostCore.includes(c));
  const tradeInHost = GENERIC_TRADE_WORDS.some((t) => hostCore.includes(t));
  const cityInName = NL_CITIES.some((c) => name.includes(c.replace("-", " ")));
  const tradeInName = GENERIC_TRADE_WORDS.some((t) => name.includes(t));
  const goedkoopInName = /goedkoop|goedkope|spoed|24\s?uur/.test(name);

  if (cityInHost && tradeInHost) return { flag: true, reason: "Domein combineert stad + branche (mogelijk leadsite)" };
  if (goedkoopInName) return { flag: true, reason: "Naam bevat 'goedkoop/spoed/24uur' (typische leadsite-signalen)" };
  if (cityInName && tradeInName && name.split(" ").length <= 3) return { flag: true, reason: "Zeer generieke bedrijfsnaam (stad + branche)" };
  if (utm) return { flag: true, reason: "Website-URL bevat UTM-parameters vanuit Google-profiel" };
  return { flag: false, reason: "" };
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

function rawOpportunityScore(p: {
  website_url: string | null;
  has_phone: boolean;
  rating: number | null;
  review_count: number;
  segment: string;
  address: string | null;
}) {
  let score = 0;
  if (p.website_url) score += 20;
  if (p.has_phone) score += 15;
  if (p.review_count >= 20) score += 20;
  else if (p.review_count >= 5) score += 10;
  else if (p.review_count > 0) score += 5;
  if ((p.rating ?? 0) >= 4.0) score += 10;
  if (PREMIUM_SEGMENTS.has((p.segment ?? "").toLowerCase())) score += 20;
  if (p.address && /nederland|netherlands|\b\d{4}\s?[A-Z]{2}\b/i.test(p.address)) score += 10;
  return Math.min(score, 100);
}

function extractCityFromAddress(addr: string | null): string | null {
  if (!addr) return null;
  const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^\d{4}\s?[A-Z]{2}\s+(.+)$/i);
    if (m) return m[1].trim();
  }
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 2];
    if (candidate && !/nederland|netherlands/i.test(candidate)) return candidate;
  }
  return null;
}

function normalizeCityName(c: string | null): string {
  return (c ?? "").toLowerCase().replace(/[\s\-']/g, "").trim();
}

function classifyLocationMatch(target: string | null, actual: string | null): string {
  if (!target || !actual) return "unknown";
  const t = normalizeCityName(target);
  const a = normalizeCityName(actual);
  if (!t || !a) return "unknown";
  if (t === a) return "exact_target_city";
  // Simple containment heuristic (e.g. "Den Haag" vs "'s-Gravenhage" not covered here)
  if (t.includes(a) || a.includes(t)) return "exact_target_city";
  // Without a curated regional map we default to nearby_city; caller can refine later.
  return "nearby_city";
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

    const targetCity = (typeof city === "string" && city.trim()) ? city.trim() : null;
    const targetSegment = (typeof segment === "string" && segment.trim()) ? segment.trim() : null;

    // Create search job with sourcing traceability
    const { data: job } = await supabase.from("search_jobs").insert({
      created_by: userId,
      region_id: region_id ?? null,
      segment: targetSegment,
      query,
      source_query: query,
      target_city: targetCity,
      target_segment: targetSegment,
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

      const businessStatus = pl.businessStatus ?? null;
      const inSegment = PREMIUM_SEGMENTS.has(seg.toLowerCase());
      const leadsite = looksLikeLeadsite(website, companyName);

      // Determine qualification_status (strict)
      let qualification_status: string;
      let exclusionReason: string | null = null;
      let recommendedAction: string;

      if (!website) {
        qualification_status = "rejected_missing_website";
        exclusionReason = "Geen eigen website gevonden via Google Places";
        recommendedAction = "Overslaan — geen eigen web-aanwezigheid";
      } else if (isDir) {
        qualification_status = "rejected_directory";
        exclusionReason = "Website is een directory/leadplatform";
        recommendedAction = "Overslaan — directory";
      } else if (!inSegment) {
        qualification_status = "rejected_outside_segment";
        exclusionReason = "Segment buiten scope";
        recommendedAction = "Overslaan — segment past niet";
      } else if (!phoneMain && !hasMobile) {
        qualification_status = "rejected_missing_contact";
        exclusionReason = "Geen zichtbaar telefoonnummer";
        recommendedAction = "Overslaan — geen contact";
      } else if (leadsite.flag) {
        qualification_status = "rejected_possible_leadsite";
        exclusionReason = leadsite.reason;
        recommendedAction = "Handmatig checken — mogelijk leadsite/SEO-doorway";
      } else if (businessStatus && businessStatus !== "OPERATIONAL") {
        qualification_status = "pending_manual_review";
        exclusionReason = `Business status: ${businessStatus}`;
        recommendedAction = "Handmatig verifiëren — status niet OPERATIONAL";
      } else {
        qualification_status = "pending_manual_review";
        recommendedAction = "Klaar voor handmatige review + website-audit";
      }

      const hardOk = qualification_status === "pending_manual_review" || qualification_status === "qualified_candidate";
      const rawScore = rawOpportunityScore({
        website_url: website,
        has_phone: !!phoneMain,
        rating: pl.rating ?? null,
        review_count: reviewCount,
        segment: seg,
        address: pl.formattedAddress ?? null,
      });

      // lead_score: 0 for rejected, null for pending, filled after manual review
      const leadScore: number | null =
        qualification_status.startsWith("rejected_") ? 0 :
        qualification_status === "pending_manual_review" ? null :
        rawScore;

      // fit stays pending until manually qualified
      const fit: string =
        qualification_status === "pending_manual_review" ? "pending" : "rejected";

      const actualCity = extractCityFromAddress(pl.formattedAddress ?? null);
      const locationMatch = classifyLocationMatch(targetCity, actualCity);

      const insertRow: Record<string, unknown> = {
        region_id: region_id ?? null,
        company_name: companyName,
        segment: seg || null,
        city: actualCity ?? targetCity ?? null,
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
        business_status: businessStatus,
        source_type: "google_places",
        is_directory_or_leadsite: isDir || leadsite.flag,
        has_own_website: !!website,
        has_visible_phone: !!phoneMain,
        has_mobile_or_whatsapp: hasMobile,
        raw_opportunity_score: rawScore,
        lead_score: leadScore,
        fit_category: fit,
        qualification_status,
        exclusion_reason: exclusionReason,
        reason_fit: hardOk
          ? `Segment ${seg}, ${hasMobile ? "mobiel zichtbaar" : "vaste lijn"}, ${reviewCount} reviews.`
          : null,
        last_verified_at: new Date().toISOString(),
        // Sourcing traceability
        search_job_id: job!.id,
        source_query: query,
        target_city: targetCity,
        target_segment: targetSegment,
        actual_city: actualCity,
        location_match: locationMatch,
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
        event_note: `Sourced via Google Places (query: ${query}) → ${qualification_status}`,
        created_by: userId,
      });

      const uiStatus =
        qualification_status === "rejected_missing_website" ? "missing_website" :
        qualification_status.startsWith("rejected_") ? "pending_review" :
        "created";

      results.push({
        status: uiStatus,
        company_name: companyName,
        address: pl.formattedAddress ?? null,
        phone: phoneMain,
        website,
        rating: pl.rating ?? null,
        review_count: reviewCount,
        prospect_id: inserted!.id,
        fit_category: fit,
        raw_opportunity_score: rawScore,
        lead_score: leadScore,
        clean_list_eligible: false,
        qualification_status,
        exclusion_reason: exclusionReason,
        recommended_action: recommendedAction,
      });

      if (qualification_status === "pending_manual_review") created += 1;
    }

    // Summary
    const summary = {
      total_results: results.length,
      qualified_candidates: results.filter(r => r.qualification_status === "qualified_candidate").length,
      pending_manual_review: results.filter(r => r.qualification_status === "pending_manual_review").length,
      rejected_missing_website: results.filter(r => r.qualification_status === "rejected_missing_website").length,
      rejected_possible_leadsite: results.filter(r => r.qualification_status === "rejected_possible_leadsite").length,
      rejected_other: results.filter(r =>
        r.qualification_status && r.qualification_status.startsWith("rejected_") &&
        r.qualification_status !== "rejected_missing_website" &&
        r.qualification_status !== "rejected_possible_leadsite"
      ).length,
      duplicates: results.filter(r => r.status === "duplicate").length,
    };

    await supabase.from("search_jobs").update({
      status: "completed",
      results_found: places.length,
      prospects_created: created,
      completed_at: new Date().toISOString(),
    }).eq("id", job!.id);

    return new Response(JSON.stringify({ job_id: job!.id, summary, results }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

