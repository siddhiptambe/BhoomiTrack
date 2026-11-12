/**
 * SIH26016 — Shared Case Store
 *
 * The SINGLE source of truth for SharedCaseContract objects consumed by:
 *   Officer, Citizen, Ministry, Survey, Revenue/LAO, Treasury, R&R
 *
 * Architecture:
 *   VERIFIED SUPABASE CORE (acquisition_cases ⋈ projects ⋈ parcels ⋈ land_interests ⋈ parties)
 *           +
 *   ADAPTER FIXTURE FIELDS (case-fixtures.ts — no verified Supabase source yet)
 *           ↓
 *   SharedCaseContract
 *           ↓
 *   UI route/page
 *
 * Rules:
 *   - Core fields (project, parcel, landType, ownership, currentStage) come from Supabase.
 *   - Adapter fields (impact, readiness, objections, hearing, valuation, award,
 *     payment, rr, possession, landRecord, fieldEvidence) come from case-fixtures.ts.
 *   - Fixture values NEVER overwrite verified DB values.
 *   - Person 1 can replace `impact` and `readiness` by updating the merge logic
 *     in `assembleCaseContract` below without touching any UI page.
 *
 * Missing canonical DB records:
 *   If P-001/P-018/P-024/P-030 do not yet exist in acquisition_cases, the query
 *   returns null and `getCaseById` returns null. The store DOES NOT create DB records,
 *   weaken RLS, or fall back silently to fixture-only data for core fields.
 *   Callers must handle the null case explicitly.
 *
 * DO NOT import React components here.
 * DO NOT invent database columns here.
 */

import { supabase } from "@/integrations/supabase/client";
import type { SharedCaseContract, OwnershipRecord } from "./case-contract";
import {
  CASE_ADAPTER_FIXTURES,
  CANONICAL_CASE_IDS,
  type CanonicalCaseId,
} from "./case-fixtures";

// ---------------------------------------------------------------------------
// Raw DB row types inferred from the generated types
// ---------------------------------------------------------------------------
type AcquisitionCaseRow = {
  id: string;
  case_no: string;
  current_stage: SharedCaseContract["currentStage"];
  method: string;
  project_id: string;
  parcel_id: string;
  project: {
    id: string;
    project_code: string;
    project_name: string;
  } | null;
  parcel: {
    id: string;
    parcel_ref: string;
    village: string;
    district: string;
    total_area_sqm: number | null;
    land_use: string | null;
    land_interests: {
      interest_type: string;
      share_numerator: number | null;
      share_denominator: number | null;
      party: {
        id: string;
        display_name: string;
      } | null;
    }[];
  } | null;
};

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Fetches a single acquisition case by its canonical case_no (e.g. "P-001")
 * including its related project, parcel, and ownership (land_interests → parties).
 *
 * Returns null if the row does not exist — callers must handle null.
 * RLS is respected: the calling user's session determines visibility.
 */
async function fetchCaseByNo(caseNo: string): Promise<AcquisitionCaseRow | null> {
  const { data, error } = await supabase
    .from("acquisition_cases")
    .select(`
      id,
      case_no,
      current_stage,
      method,
      project_id,
      parcel_id,
      project:projects(id, project_code, project_name),
      parcel:parcels(
        id,
        parcel_ref,
        village,
        district,
        total_area_sqm,
        land_use,
        land_interests(
          interest_type,
          share_numerator,
          share_denominator,
          party:parties(id, display_name)
        )
      )
    `)
    .eq("case_no", caseNo)
    .maybeSingle();

  if (error) {
    console.error(`[case-store] fetchCaseByNo("${caseNo}") error:`, error.message);
    return null;
  }

  return data as AcquisitionCaseRow | null;
}

/**
 * Fetches all acquisition_cases whose case_no is one of the four canonical IDs.
 * Order is stable: matches CANONICAL_CASE_IDS order.
 */
async function fetchAllCanonicalCases(): Promise<AcquisitionCaseRow[]> {
  const { data, error } = await supabase
    .from("acquisition_cases")
    .select(`
      id,
      case_no,
      current_stage,
      method,
      project_id,
      parcel_id,
      project:projects(id, project_code, project_name),
      parcel:parcels(
        id,
        parcel_ref,
        village,
        district,
        total_area_sqm,
        land_use,
        land_interests(
          interest_type,
          share_numerator,
          share_denominator,
          party:parties(id, display_name)
        )
      )
    `)
    .in("case_no", [...CANONICAL_CASE_IDS]);

  if (error) {
    console.error("[case-store] fetchAllCanonicalCases error:", error.message);
    return [];
  }

  // Preserve canonical ordering
  const rowByNo = new Map<string, AcquisitionCaseRow>(
    (data as AcquisitionCaseRow[]).map((r) => [r.case_no, r]),
  );
  return CANONICAL_CASE_IDS.flatMap((id) => {
    const row = rowByNo.get(id);
    return row ? [row] : [];
  });
}

// ---------------------------------------------------------------------------
// Assembly — merge DB core + fixture adapter fields → SharedCaseContract
// ---------------------------------------------------------------------------

/**
 * Merges a verified Supabase DB row with the adapter fixture fields.
 *
 * MERGE RULE:
 *   - DB values always win for the verified core fields.
 *   - Fixture values fill adapter-backed fields only.
 *   - Impact and readiness are placed behind the adapter boundary so
 *     Person 1 can replace them without touching any page component.
 */
function assembleCaseContract(
  row: AcquisitionCaseRow,
  caseNo: CanonicalCaseId,
): SharedCaseContract {
  const fixture = CASE_ADAPTER_FIXTURES[caseNo];

  // --- Verified core: project ---
  const project: SharedCaseContract["project"] = {
    id: row.project?.id ?? row.project_id,
    projectCode: row.project?.project_code ?? "",
    projectName: row.project?.project_name ?? "",
  };

  // --- Verified core: parcel ---
  const parcel: SharedCaseContract["parcel"] = {
    id: row.parcel?.id ?? row.parcel_id,
    parcelRef: row.parcel?.parcel_ref ?? "",
    village: row.parcel?.village ?? "",
    district: row.parcel?.district ?? "",
    totalAreaSqm: row.parcel?.total_area_sqm ?? null,
    affectedAreaSqm: null, // sourced from project_parcels.affected_area_sqm in Phase 4
  };

  // --- Verified core: landType (from parcel.land_use) ---
  const landType = row.parcel?.land_use ?? "Unknown";

  // --- Verified core: ownership (land_interests → parties) ---
  const ownership: OwnershipRecord[] =
    row.parcel?.land_interests?.map((li) => ({
      partyId: li.party?.id ?? "",
      displayName: li.party?.display_name ?? "Unknown",
      interestType: li.interest_type,
      shareNumerator: li.share_numerator,
      shareDenominator: li.share_denominator,
    })) ?? [];

  // --- Verified core: currentStage ---
  const currentStage = row.current_stage;

  // --- Adapter-backed fields (fixture) ---
  // Person 1 integration point: replace fixture.impact and fixture.readiness
  // here with real GIS/readiness data when available. No page changes required.
  const {
    impact,
    readiness,
    fieldEvidence,
    objections,
    hearing,
    valuation,
    award,
    payment,
    rr,
    possession,
    landRecord,
  } = fixture;

  return {
    id: row.case_no,
    project,
    parcel,
    landType,
    impact,       // ← Person 1 integration boundary
    ownership,
    fieldEvidence,
    readiness,    // ← Person 1 integration boundary
    currentStage,
    objections,
    hearing,
    valuation,
    award,
    payment,
    rr,
    possession,
    landRecord,
  };
}

// ---------------------------------------------------------------------------
// Public store API
// ---------------------------------------------------------------------------

/**
 * Query key factory for TanStack Query.
 * Use these to avoid string typos and enable precise cache invalidation.
 */
export const caseQueryKeys = {
  all: ["shared-cases"] as const,
  list: () => [...caseQueryKeys.all, "list"] as const,
  detail: (caseNo: string) => [...caseQueryKeys.all, "detail", caseNo] as const,
};

/**
 * Fetch and assemble all four canonical shared cases.
 *
 * Usage (in a route or component):
 *   const { data } = useQuery({ queryKey: caseQueryKeys.list(), queryFn: listSharedCases });
 *
 * Cases whose DB row does not yet exist in acquisition_cases are silently
 * omitted from the result. The caller receives only assembled, complete
 * SharedCaseContract objects.
 */
export async function listSharedCases(): Promise<SharedCaseContract[]> {
  const rows = await fetchAllCanonicalCases();
  return rows.flatMap((row) => {
    const id = row.case_no as CanonicalCaseId;
    if (!CANONICAL_CASE_IDS.includes(id)) return [];
    return [assembleCaseContract(row, id)];
  });
}

/**
 * Fetch and assemble a single shared case by canonical case ID.
 *
 * Returns null when:
 *   - The case_no does not exist in acquisition_cases (no DB record yet), OR
 *   - RLS denies the calling user access to the row.
 *
 * The caller must handle null — do not display a partial contract.
 *
 * Usage:
 *   const { data } = useQuery({
 *     queryKey: caseQueryKeys.detail("P-001"),
 *     queryFn: () => getCaseById("P-001"),
 *   });
 */
export async function getCaseById(caseNo: string): Promise<SharedCaseContract | null> {
  if (!CANONICAL_CASE_IDS.includes(caseNo as CanonicalCaseId)) {
    console.warn(`[case-store] getCaseById called with non-canonical ID: "${caseNo}"`);
    return null;
  }
  const row = await fetchCaseByNo(caseNo);
  if (!row) return null;
  return assembleCaseContract(row, caseNo as CanonicalCaseId);
}
