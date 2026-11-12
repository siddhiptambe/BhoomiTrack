/**
 * SIH26016 — Phase 3 GIS core.
 *
 * Types and data access for the Officer → GIS interactive project land map.
 * Data is read from the authoritative Phase 2 tables through the
 * `get_project_gis_data` RPC (RLS applies). Only non-personal GIS fields are
 * returned — no owner, bank or citizen-identifying data.
 */
import * as turf from "@turf/turf";
import { supabase } from "@/integrations/supabase/client";

export type GeoJsonGeometry = {
  type: string;
  coordinates: unknown;
};

export type GeoJsonFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: Record<string, unknown>;
};

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

export type GisProject = {
  id: string;
  project_code: string;
  project_name: string;
  state: string;
  districts: string[];
  status: string;
  is_synthetic: boolean;
};

export type ParcelProperties = {
  id: string;
  parcel_ref: string;
  survey_no: string | null;
  gat_no: string | null;
  khasra_no: string | null;
  village: string;
  district: string;
  state: string;
  total_area_sqm: number | null;
  is_synthetic: boolean;
  affected_area_sqm: number | null;
  affected_percentage: number | null;
  spatial_status: "candidate_affected" | "unaffected";
};

export type GisSummary = {
  alignment_length_km: number;
  parcels_displayed: number;
  candidate_affected: number;
  total_affected_area_sqm: number;
};

export type GisData = {
  project: GisProject | null;
  alignment: GeoJsonFeatureCollection;
  parcels: GeoJsonFeatureCollection;
  corridor: GeoJsonFeatureCollection;
  summary: GisSummary;
};

export const EMPTY_FEATURE_COLLECTION: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export type EngineerAlignmentValidation = {
  points: [number, number][];
  alignment: GeoJsonFeatureCollection;
  engineerPoints: GeoJsonFeatureCollection;
  corridor: GeoJsonFeatureCollection;
  lengthKm: number;
};

function isValidCoordinatePair(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && Number.isFinite(value[0]) && Number.isFinite(value[1]);
}

function readCrsName(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj["name"] === "string") return obj["name"] as string;
    const properties = obj["properties"] as Record<string, unknown> | undefined;
    if (typeof properties?.["name"] === "string") return String(properties["name"]);
  }
  return "";
}

export function validateEngineerGeoJson(input: unknown): EngineerAlignmentValidation {
  if (!input || typeof input !== "object") {
    throw new Error("Uploaded file must contain valid GeoJSON content.");
  }

  const payload = input as Record<string, unknown>;
  const crsName = readCrsName(payload["crs"]);
  if (crsName && !/EPSG:4326|WGS84|CRS84|urn:ogc:def:crs:EPSG::4326/i.test(crsName)) {
    throw new Error("GeoJSON CRS must be WGS84 / EPSG:4326.");
  }

  if (payload["type"] !== "FeatureCollection" || !Array.isArray(payload["features"])) {
    throw new Error("Uploaded file must be a GeoJSON FeatureCollection.");
  }

  const features = payload["features"] as unknown[];
  if (features.length < 2) {
    throw new Error("At least 2 point features are required for an engineer alignment.");
  }

  const ordered = features.map((feature, index) => {
    if (!feature || typeof feature !== "object") {
      throw new Error(`Feature ${index + 1} is invalid.`);
    }

    const item = feature as Record<string, unknown>;
    if (item["type"] !== "Feature") {
      throw new Error(`Feature ${index + 1} must be a GeoJSON Feature.`);
    }

    const geometry = item["geometry"] as Record<string, unknown> | undefined;
    if (!geometry || geometry["type"] !== "Point") {
      throw new Error(`Feature ${index + 1} does not contain Point geometry.`);
    }

    const coordinates = geometry["coordinates"];
    if (!isValidCoordinatePair(coordinates)) {
      throw new Error(`Feature ${index + 1} has invalid coordinates. Expected [longitude, latitude].`);
    }

    const [longitude, latitude] = coordinates as [number, number];
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Feature ${index + 1} longitude is out of range [-180, 180].`);
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Feature ${index + 1} latitude is out of range [-90, 90].`);
    }

    const properties = item["properties"] as Record<string, unknown> | undefined;
    const rawPointOrder = properties && typeof properties === "object"
      ? properties["point_order"]
      : undefined;

    const pointOrder = Number(rawPointOrder ?? index + 1);
    if (!Number.isFinite(pointOrder)) {
      throw new Error(`Feature ${index + 1} has an invalid point_order value.`);
    }

    return { pointOrder, coordinates: [longitude, latitude] as [number, number] };
  });

  ordered.sort((a, b) => a.pointOrder - b.pointOrder);

  const points = ordered.map((point) => point.coordinates);
  const alignment: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: points,
        },
        properties: {
          source: "engineer_upload",
          point_count: points.length,
        },
      },
    ],
  };

  const engineerPoints: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features: points.map((point, index) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: point,
      },
      properties: {
        point_order: index + 1,
        longitude: point[0],
        latitude: point[1],
      },
    })),
  };

  const line = turf.lineString(points);
  const corridor = turf.buffer(line, 12, { units: "meters" });
  const alignedCorridor: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: corridor.geometry as GeoJsonGeometry,
        properties: {
          buffer_m: 12,
          source: "engineer_upload",
        },
      },
    ],
  };

  return {
    points,
    alignment,
    engineerPoints,
    corridor: alignedCorridor,
    lengthKm: turf.length(line, { units: "kilometers" }),
  };
}

export function getDefaultDemoGisData(): GisData {
  const points: [number, number][] = [
    [73.7600, 18.5200],
    [73.7650, 18.5210],
    [73.7710, 18.5215],
    [73.7770, 18.5210],
    [73.7820, 18.5220],
    [73.7860, 18.5250],
    [73.7880, 18.5290],
    [73.7870, 18.5330],
    [73.7840, 18.5370],
    [73.7800, 18.5410],
    [73.7780, 18.5460],
    [73.7790, 18.5510],
    [73.7820, 18.5550],
    [73.7880, 18.5570],
    [73.7940, 18.5570],
    [73.8000, 18.5550],
    [73.8060, 18.5520],
    [73.8120, 18.5510],
    [73.8180, 18.5520],
    [73.8230, 18.5550],
    [73.8270, 18.5590],
    [73.8290, 18.5640],
    [73.8300, 18.5690],
    [73.8320, 18.5730],
    [73.8360, 18.5760],
  ];

  const alignment: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: { type: "LineString", coordinates: points },
      properties: { source: "demo_seed", name: "Mumbai–Pune demo alignment" },
    }],
  };

  const parcels: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.7650, 18.5180],
            [73.7750, 18.5180],
            [73.7750, 18.5250],
            [73.7650, 18.5250],
            [73.7650, 18.5180],
          ]],
        },
        properties: {
          id: "DEMO-PCL-001",
          parcel_ref: "DEMO-PCL-001",
          survey_no: "Survey 18/2",
          gat_no: "18",
          khasra_no: "2",
          village: "Kasarwadi",
          district: "Pune",
          state: "Maharashtra",
          total_area_sqm: 280000,
          is_synthetic: true,
          affected_area_sqm: 40000,
          affected_percentage: 14.2,
          spatial_status: "candidate_affected",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.7800, 18.5320],
            [73.7900, 18.5320],
            [73.7900, 18.5400],
            [73.7800, 18.5400],
            [73.7800, 18.5320],
          ]],
        },
        properties: {
          id: "DEMO-PCL-002",
          parcel_ref: "DEMO-PCL-002",
          survey_no: "Survey 22/1",
          gat_no: "22",
          khasra_no: "1",
          village: "Kasarwadi",
          district: "Pune",
          state: "Maharashtra",
          total_area_sqm: 450000,
          is_synthetic: true,
          affected_area_sqm: 52000,
          affected_percentage: 11.6,
          spatial_status: "candidate_affected",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.7950, 18.5400],
            [73.8050, 18.5400],
            [73.8050, 18.5500],
            [73.7950, 18.5500],
            [73.7950, 18.5400],
          ]],
        },
        properties: {
          id: "DEMO-PCL-003",
          parcel_ref: "DEMO-PCL-003",
          survey_no: "Survey 31/4",
          gat_no: "31",
          khasra_no: "4",
          village: "Wakad",
          district: "Pune",
          state: "Maharashtra",
          total_area_sqm: 800000,
          is_synthetic: true,
          affected_area_sqm: 61000,
          affected_percentage: 7.6,
          spatial_status: "candidate_affected",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.8150, 18.5550],
            [73.8250, 18.5550],
            [73.8250, 18.5650],
            [73.8150, 18.5650],
            [73.8150, 18.5550],
          ]],
        },
        properties: {
          id: "DEMO-PCL-004",
          parcel_ref: "DEMO-PCL-004",
          survey_no: "Survey 44/3",
          gat_no: "44",
          khasra_no: "3",
          village: "Wakad",
          district: "Pune",
          state: "Maharashtra",
          total_area_sqm: 350000,
          is_synthetic: true,
          affected_area_sqm: 25000,
          affected_percentage: 7.1,
          spatial_status: "candidate_affected",
        },
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.8380, 18.5825],
            [73.8410, 18.5835],
            [73.8390, 18.5855],
            [73.8380, 18.5825],
          ]],
        },
        properties: {
          id: "DEMO-PCL-005",
          parcel_ref: "DEMO-PCL-005",
          survey_no: "Survey 51/1",
          gat_no: "51",
          khasra_no: "1",
          village: "Tathawade",
          district: "Pune",
          state: "Maharashtra",
          total_area_sqm: 2200,
          is_synthetic: true,
          affected_area_sqm: 0,
          affected_percentage: 0,
          spatial_status: "unaffected",
        },
      },
    ],
  };

  const corridor = turf.buffer(turf.lineString(points), 12, { units: "meters" });

  const affected = parcels.features.filter((feature) => {
    try {
      return turf.booleanIntersects(feature as never, corridor as never);
    } catch {
      return false;
    }
  });

  const totalAffectedAreaSqm = affected.reduce((sum, feature) => {
    try {
      const intersection = turf.intersect(feature as never, corridor as never);
      if (!intersection) return sum;
      return sum + turf.area(intersection);
    } catch {
      return sum;
    }
  }, 0);

  return {
    project: {
      id: "demo-project",
      project_code: "A-WARD-MH-001",
      project_name: "Mumbai–Pune Infrastructure Corridor",
      state: "Maharashtra",
      districts: ["Pune", "Raigad"],
      status: "active",
      is_synthetic: true,
    },
    alignment,
    parcels,
    corridor: {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: corridor.geometry as GeoJsonGeometry,
        properties: { buffer_m: 12, source: "demo_seed" },
      }],
    },
    summary: {
      alignment_length_km: turf.length(turf.lineString(points), { units: "kilometers" }),
      parcels_displayed: parcels.features.length,
      candidate_affected: affected.length,
      total_affected_area_sqm: totalAffectedAreaSqm,
    },
  };
}

function getIntersectionAreaSqm(feature: GeoJsonFeature, corridor: turf.Feature<turf.Geometry>): number {
  // If affected_area_sqm is provided in the feature properties, use it directly
  const properties = feature.properties as Record<string, unknown> | undefined;
  if (properties) {
    const providedArea = properties["affected_area_sqm"];
    if (typeof providedArea === "number" && providedArea >= 0) {
      return providedArea;
    }
  }

  try {
    const intersection = turf.intersect(feature as never, corridor as never);
    if (!intersection) return 0;

    const area = turf.area(intersection);
    // If area is valid and positive, return it
    if (area > 0) return area;

    // If intersection exists but area is 0 (line/point contact), try length-based fallback
    try {
      const length = turf.length(intersection, { units: "meters" });
      // Convert length to approximate area using corridor buffer (12m on each side = 24m width)
      const approximateArea = Math.max(length * 24, 100);
      return approximateArea;
    } catch {
      // If even length fails, return minimum impact area
      return 100;
    }
  } catch {
    return 0;
  }
}

export function buildAlignmentImpact(
  parcels: GeoJsonFeatureCollection,
  alignment: GeoJsonFeatureCollection,
): {
  affectedParcels: GeoJsonFeatureCollection;
  corridor: GeoJsonFeatureCollection;
  affectedIds: Set<string>;
  parcelAffectedAreaMap: Map<string, number>;
  summary: { affectedCount: number; totalAffectedAreaSqm: number; totalParcelsDisplayed: number };
} {
  if (!alignment.features.length) {
    return {
      affectedParcels: EMPTY_FEATURE_COLLECTION,
      corridor: EMPTY_FEATURE_COLLECTION,
      affectedIds: new Set(),
      parcelAffectedAreaMap: new Map(),
      summary: { affectedCount: 0, totalAffectedAreaSqm: 0, totalParcelsDisplayed: parcels.features.length },
    };
  }

  const lineGeometry = alignment.features[0]?.geometry;
  if (!lineGeometry || lineGeometry.type !== "LineString") {
    return {
      affectedParcels: EMPTY_FEATURE_COLLECTION,
      corridor: EMPTY_FEATURE_COLLECTION,
      affectedIds: new Set(),
      parcelAffectedAreaMap: new Map(),
      summary: { affectedCount: 0, totalAffectedAreaSqm: 0, totalParcelsDisplayed: parcels.features.length },
    };
  }

  const corridor = turf.buffer(turf.lineString(lineGeometry.coordinates as [number, number][]), 12, {
    units: "meters",
  });

  const affectedFeatures = parcels.features.filter((feature) => {
    const geometry = feature.geometry as Record<string, unknown>;
    if (!geometry || geometry["type"] === "Point") return false;

    try {
      return turf.booleanIntersects(feature as never, corridor as never);
    } catch {
      return false;
    }
  });

  const corridorFeatureCollection: GeoJsonFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: corridor.geometry as GeoJsonGeometry,
        properties: {
          buffer_m: 12,
          source: "engineer_upload",
        },
      },
    ],
  };

  const affectedIds = new Set(
    affectedFeatures.map((feature) => String((feature.properties["id"] as string | undefined) ?? "")),
  );

  const parcelAffectedAreaMap = new Map<string, number>();
  let totalAffectedAreaSqm = 0;
  for (const feature of affectedFeatures) {
    const parcelId = String((feature.properties["id"] as string | undefined) ?? "");
    const areaForParcel = getIntersectionAreaSqm(feature, corridor);
    parcelAffectedAreaMap.set(parcelId, areaForParcel);
    totalAffectedAreaSqm += areaForParcel;
  }

  return {
    affectedParcels: {
      type: "FeatureCollection",
      features: affectedFeatures,
    },
    corridor: corridorFeatureCollection,
    affectedIds,
    parcelAffectedAreaMap,
    summary: {
      affectedCount: affectedFeatures.length,
      totalAffectedAreaSqm,
      totalParcelsDisplayed: parcels.features.length,
    },
  };
}

export async function fetchProjectGisData(
  projectId: string,
): Promise<GisData> {
  const { data, error } = await supabase.rpc("get_project_gis_data", {
    p_project_id: projectId,
  });

  if (error) {
    throw new Error(`GIS data unavailable: ${error.message}`);
  }

  const raw = (data ?? {}) as unknown as Partial<GisData>;
  return {
    project: raw.project ?? null,
    alignment: raw.alignment ?? EMPTY_FEATURE_COLLECTION,
    parcels: raw.parcels ?? EMPTY_FEATURE_COLLECTION,
    corridor: raw.corridor ?? EMPTY_FEATURE_COLLECTION,
    summary: raw.summary ?? {
      alignment_length_km: 0,
      parcels_displayed: 0,
      candidate_affected: 0,
      total_affected_area_sqm: 0,
    },
  };
}

export async function fetchDemoProjectId(): Promise<string | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("project_code", "A-WARD-MH-001")
    .maybeSingle();

  if (error || !data) return null;

  return data.id;
}

export function formatArea(sqm: number | null | undefined): string {
  if (sqm === null || sqm === undefined) return "—";
  if (sqm >= 10_000) return `${(sqm / 10_000).toFixed(2)} ha`;
  return `${Math.round(sqm).toLocaleString("en-IN")} m²`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}%`;
}

export function calculateAffectedPercentage(affectedAreaSqm: number, totalAreaSqm: number | null | undefined): number {
  if (!totalAreaSqm || totalAreaSqm <= 0) return 0;
  return (affectedAreaSqm / totalAreaSqm) * 100;
}

// ─── Ownership ────────────────────────────────────────────────────────────────

export type OwnershipInterest = {
  id: string;
  interest_type: string;
  share_numerator: number | null;
  share_denominator: number | null;
  verification: string;
  record_ref: string | null;
  party: {
    display_name: string;
    party_ref: string;
  };
};

/**
 * Fetch all land_interests (with joined party data) for a given parcel UUID.
 * Uses the existing anon/publishable Supabase client — RLS applies.
 * Returns records ordered: owner first, co_owner after.
 */
export async function fetchParcelOwnership(
  parcelId: string,
): Promise<OwnershipInterest[]> {
  const { data, error } = await supabase
    .from("land_interests")
    .select(
      `id,
       interest_type,
       share_numerator,
       share_denominator,
       verification,
       record_ref,
       parties ( display_name, party_ref )`,
    )
    .eq("parcel_id", parcelId)
    .in("interest_type", ["owner", "co_owner"])
    .order("interest_type", { ascending: true }); // 'co_owner' < 'owner' alphabetically; re-sort below

  if (error) throw new Error(`Ownership query failed: ${error.message}`);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    interest_type: string;
    share_numerator: number | null;
    share_denominator: number | null;
    verification: string;
    record_ref: string | null;
    parties: { display_name: string; party_ref: string } | null;
  }>;

  // Sort: owner first, then co_owner
  rows.sort((a, b) => {
    if (a.interest_type === b.interest_type) return 0;
    return a.interest_type === "owner" ? -1 : 1;
  });

  return rows
    .filter((r) => r.parties !== null)
    .map((r) => ({
      id: r.id,
      interest_type: r.interest_type,
      share_numerator: r.share_numerator,
      share_denominator: r.share_denominator,
      verification: r.verification,
      record_ref: r.record_ref,
      party: r.parties as { display_name: string; party_ref: string },
    }));
}

/**
 * Format a share fraction (numerator / denominator) as a percentage string.
 * e.g. 1/2 → "50.00%", 1/3 → "33.33%", 1/1 → "100.00%"
 */
export function formatShare(
  numerator: number | null,
  denominator: number | null,
): string {
  if (numerator === null || denominator === null || denominator === 0)
    return "—";
  return `${((numerator / denominator) * 100).toFixed(2)}%`;
}