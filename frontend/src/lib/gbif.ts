/**
 * GBIF Scientific Taxonomy Integration
 * Validates plant scientific names via the Global Biodiversity Information Facility (GBIF)
 */

export interface GbifTaxonResult {
  acceptedScientificName: string;
  matchedName: string;
  taxonKey: number | null;
  confidence: number;
  matchType: "EXACT" | "FUZZY" | "HIGHERRANK" | "NONE";
  status: string;
  family?: string;
  genus?: string;
  source: string;
  retrievedAt: string;
}

export async function matchScientificNameWithGbif(
  scientificName: string
): Promise<GbifTaxonResult | null> {
  if (!scientificName || scientificName.trim().length === 0) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast response

    const url = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(
      scientificName.trim()
    )}&verbose=false`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // cache for 24 hours
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`GBIF match returned non-200: ${res.status}`);
      return null;
    }

    const data = await res.json();

    if (data.matchType === "NONE" || !data.scientificName) {
      return {
        acceptedScientificName: scientificName,
        matchedName: scientificName,
        taxonKey: null,
        confidence: 0,
        matchType: "NONE",
        status: "UNMATCHED",
        source: "GBIF Backbone Taxonomy (No match found)",
        retrievedAt: new Date().toISOString(),
      };
    }

    return {
      acceptedScientificName: data.scientificName || scientificName,
      matchedName: data.canonicalName || scientificName,
      taxonKey: data.usageKey || null,
      confidence: data.confidence || 85,
      matchType: data.matchType || "EXACT",
      status: data.status || "ACCEPTED",
      family: data.family,
      genus: data.genus,
      source: "GBIF Backbone Taxonomy (api.gbif.org/v1/species/match)",
      retrievedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    console.warn("GBIF API query failed or timed out:", err);
    return null;
  }
}
