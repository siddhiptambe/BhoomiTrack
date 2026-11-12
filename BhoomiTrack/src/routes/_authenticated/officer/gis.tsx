import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { requireRole } from "@/lib/route-guards";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, Section, MetricCard } from "@/components/layout/PageHeader";
import { DataClassBadge } from "@/components/layout/DataClassBadge";
import { GisMap, type LayerVisibility } from "@/components/gis/GisMap";
import {
  buildAlignmentImpact,
  EMPTY_FEATURE_COLLECTION,
  fetchDemoProjectId,
  fetchProjectGisData,
  fetchParcelOwnership,
  formatArea,
  formatPercent,
  formatShare,
  calculateAffectedPercentage,
  getDefaultDemoGisData,
  validateEngineerGeoJson,
  type ParcelProperties,
} from "@/lib/gis";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/officer/gis")({
  beforeLoad: () => requireRole("officer"),
  head: () => ({
    meta: [
      { title: "Officer GIS — BhoomiTrack" },
      {
        name: "description",
        content:
          "Upload engineer GeoJSON alignment, inspect parcel impact and review all database-backed parcel boundaries in the officer GIS workspace.",
      },
      { property: "og:title", content: "Officer GIS — BhoomiTrack" },
      {
        property: "og:description",
        content:
          "Officer GIS view for uploading engineer alignment and calculating parcel intersections based on parcel geometry from the database.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfficerGisPage,
});

const DEFAULT_LAYERS: LayerVisibility = {
  engineerPoints: false,
  alignment: false,
  parcels: true,
  affected: false,
  corridor: false,
};

const DEFAULT_DEMO_GIS = getDefaultDemoGisData();
const DEFAULT_ENGINEER_GEOJSON = {
  type: "FeatureCollection",
  features: DEFAULT_DEMO_GIS.alignment.features[0].geometry.coordinates.map((coordinate, index) => ({
    type: "Feature",
    properties: { point_order: index + 1 },
    geometry: { type: "Point", coordinates: coordinate },
  })),
};

function OfficerGisPage() {
  const { department } = useAuth();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [engineerAlignment, setEngineerAlignment] = useState<ReturnType<typeof validateEngineerGeoJson> | null>(null);

  useEffect(() => {
    let active = true;
    void fetchDemoProjectId().then((id) => {
      if (active && id) setProjectId(id);
    });
    return () => {
      active = false;
    };
  }, []);

const {
  data: gis,
  isLoading,
  error,
} = useQuery({
  queryKey: ["officer-gis-parcels", projectId],
  queryFn: () => fetchProjectGisData(projectId as string),
  enabled: !!projectId,
  retry: false,
});

const projectRecord = gis?.project ?? null;
const parcelDataset = gis?.parcels ?? EMPTY_FEATURE_COLLECTION;

  const impact = useMemo(() => {
    if (!engineerAlignment || !parcelDataset.features.length) {
      return {
        affectedParcels: EMPTY_FEATURE_COLLECTION,
        corridor: EMPTY_FEATURE_COLLECTION,
        affectedIds: new Set<string>(),
        parcelAffectedAreaMap: new Map(),
        summary: { affectedCount: 0, totalAffectedAreaSqm: 0, totalParcelsDisplayed: 0 },
      };
    }
    return buildAlignmentImpact(parcelDataset, engineerAlignment.alignment);
  }, [engineerAlignment, parcelDataset]);

  const selectedParcel = useMemo<ParcelProperties | null>(() => {
    if (!parcelDataset || !selectedParcelId) return null;
    const feature = parcelDataset.features.find(
      (f) => String(f.properties["id"] ?? "") === selectedParcelId,
    );
    return feature ? (feature.properties as unknown as ParcelProperties) : null;
  }, [parcelDataset, selectedParcelId]);

  const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedParcelId(null);
    if (!file) {
      setSelectedFileName("");
      setFileError("No file selected.");
      setFileSuccess(null);
      setEngineerAlignment(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".geojson")) {
      setSelectedFileName(file.name);
      setFileError("Only .geojson files are accepted.");
      setFileSuccess(null);
      setEngineerAlignment(null);
      return;
    }

    const text = await file.text();
    try {
      const parsed = JSON.parse(text) as unknown;
      const validated = validateEngineerGeoJson(parsed);
      setSelectedFileName(file.name);
      setFileError(null);
      setFileSuccess(`Loaded ${validated.points.length} engineer points. Ready to generate alignment.`);
      setEngineerAlignment(validated);
      setLayers((prev) => ({
        ...prev,
        engineerPoints: true,
        alignment: true,
        affected: true,
      }));
    } catch (error) {
      setSelectedFileName(file.name);
      setFileError(error instanceof Error ? error.message : "Invalid GeoJSON file.");
      setFileSuccess(null);
      setEngineerAlignment(null);
      setLayers((prev) => ({ ...prev, engineerPoints: false, alignment: false, affected: false }));
    }
  };

  const handleGenerateAlignment = () => {
    if (!engineerAlignment) {
      setFileError("Please upload a valid .geojson file first.");
      setFileSuccess(null);
      return;
    }
    setLayers((prev) => ({
      ...prev,
      engineerPoints: true,
      alignment: true,
      affected: true,
    }));
    setFileSuccess("Engineer alignment generated successfully. Parcel impact recalculated from the uploaded geometry.");
    setFileError(null);
  };

  return (
    <AppShell portal="officer">
      <PageHeader
        eyebrow="Officer / Admin · GIS"
        title="Officer GIS"
        description="Upload an engineer alignment GeoJSON, verify the exact route, and identify which existing database parcels intersect the proposed highway corridor."
        actions={<DataClassBadge dataClass="synthetic" />}
      />

      {isLoading ? (
        <Section title="Loading parcel dataset">
          <p className="surface-panel p-4 text-sm text-muted-foreground">
            Loading current parcel geometry from the authoritative database…
          </p>
        </Section>
      ) : error ? (
        <Section title="GIS data unavailable">
          <p className="surface-panel p-4 text-sm text-destructive">
            {(error as Error).message}
          </p>
        </Section>
      ) : !projectRecord ? (
        <Section title="No project data found">
          <p className="surface-panel p-4 text-sm text-muted-foreground">
            No project parcel dataset is available. Please confirm the project exists in the database.
          </p>
        </Section>
      ) : (
        <>
          {department === "project_authority_gis" ? (
            <Section
              title="Proposed Alignment Upload"
              description="Use the engineer-provided GeoJSON as the only source of the proposed route. Parcel data remains from the database."
            >
              <div className="surface-panel grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Upload Proposed Alignment GeoJSON
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".geojson,application/geo+json,application/json"
                    onChange={handleFileSelection}
                    className="block w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                  />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Selected file:</span>{" "}
                    {selectedFileName || "No file selected"}
                  </div>
                  {engineerAlignment ? (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Number of points:</span>{" "}
                      {engineerAlignment.points.length}
                    </div>
                  ) : null}
                </div>

                <Button type="button" onClick={handleGenerateAlignment} disabled={!engineerAlignment}>
                  Generate Alignment
                </Button>
              </div>

              {(fileError || fileSuccess) ? (
                <div className={`mt-4 rounded-md border px-3 py-2 text-sm ${
                  fileError
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                }`}>
                  {fileError || fileSuccess}
                </div>
              ) : null}
            </Section>
          ) : null}

          <Section
            title={projectRecord.project_name}
            description={`${projectRecord.project_code} · ${projectRecord.state} · ${projectRecord.districts.join(", ")}`}
            aside={<DataClassBadge dataClass="synthetic" />}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Engineer Points"
                value={String(engineerAlignment ? engineerAlignment.points.length : 0)}
                note="Uploaded from GeoJSON"
              />
              <MetricCard
                label="Alignment Length"
                value={engineerAlignment ? `${engineerAlignment.lengthKm.toFixed(2)} km` : "0.00 km"}
                note="GeoJSON route length"
              />
              <MetricCard
                label="Total Parcels Displayed"
                value={String(impact.summary.totalParcelsDisplayed)}
                note="All available parcel records"
              />
              <MetricCard
                label="Affected Parcel Count"
                value={String(impact.summary.affectedCount)}
                note="Intersected by corridor"
              />
              <MetricCard
                label="Analysis Corridor Buffer"
                value="120 m"
                note="Distance on each side of alignment"
              />
              <MetricCard
                label="Total Affected Area"
                value={formatArea(impact.summary.totalAffectedAreaSqm)}
                note="Derived from the uploaded alignment corridor"
              />
            </div>
          </Section>

          <Section
            title="GIS Map"
            description="The uploaded engineer GeoJSON generates the current highway alignment. Parcel boundaries stay as stored in the database, and only intersected parcels are highlighted."
          >
            <div className="surface-panel p-4">
              <div className="mb-3 flex flex-wrap items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={layers.engineerPoints}
                    onChange={(e) =>
                      setLayers((v) => ({ ...v, engineerPoints: e.target.checked }))
                    }
                  />
                  <span className="inline-block size-2.5 rounded-full bg-orange-500" />
                  Engineer Points
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={layers.alignment}
                    onChange={(e) =>
                      setLayers((v) => ({ ...v, alignment: e.target.checked }))
                    }
                  />
                  <span className="inline-block size-2.5 rounded-full bg-blue-600" />
                  Proposed Highway Alignment
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={layers.parcels}
                    onChange={(e) =>
                      setLayers((v) => ({ ...v, parcels: e.target.checked }))
                    }
                  />
                  <span className="inline-block size-2.5 rounded-sm border border-slate-500 bg-slate-200" />
                  Parcel Boundaries
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={layers.affected}
                    onChange={(e) =>
                      setLayers((v) => ({ ...v, affected: e.target.checked }))
                    }
                  />
                  <span className="inline-block size-2.5 rounded-sm border border-red-600 bg-red-300" />
                  Affected Parcels
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={layers.corridor}
                    onChange={(e) =>
                      setLayers((v) => ({ ...v, corridor: e.target.checked }))
                    }
                  />
                  <span className="inline-block size-2.5 rounded-sm border border-amber-500 bg-amber-200" />
                  Analysis Corridor
                </label>
              </div>

              <GisMap
                alignment={engineerAlignment?.alignment ?? EMPTY_FEATURE_COLLECTION}
                engineerPoints={engineerAlignment?.engineerPoints ?? EMPTY_FEATURE_COLLECTION}
                parcels={parcelDataset}
                affectedParcels={impact.affectedParcels}
                corridor={engineerAlignment?.corridor ?? EMPTY_FEATURE_COLLECTION}
                layers={layers}
                selectedParcelId={selectedParcelId}
                onSelectParcel={setSelectedParcelId}
              />
            </div>
          </Section>

          <Section
            title="Selected parcel"
            description={selectedParcel ? "This parcel record comes directly from the database; only the highlighted status is derived from the uploaded alignment." : "Click a parcel on the map to inspect its original database record."}
          >
            {selectedParcel ? (
              <>
                <dl className="surface-panel grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Parcel ID
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{selectedParcel.parcel_ref}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Survey / Gat / Khasra
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {[selectedParcel.survey_no, selectedParcel.gat_no, selectedParcel.khasra_no]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Village · District
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {selectedParcel.village} · {selectedParcel.district}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Recorded Total Area
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{formatArea(selectedParcel.total_area_sqm)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Affected Area (Calculated)
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {formatArea(
                        impact.parcelAffectedAreaMap.get(selectedParcelId ?? "") ?? 0
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Affected Percentage
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {formatPercent(
                        calculateAffectedPercentage(
                          impact.parcelAffectedAreaMap.get(selectedParcelId ?? "") ?? 0,
                          selectedParcel.total_area_sqm
                        )
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Community / State
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {selectedParcel.state}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Geometry Status
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {impact.affectedIds.has(selectedParcelId ?? "") ? "Intersected by uploaded alignment" : "Unaffected"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-8">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Land Ownership
                  </h3>
                  <ParcelOwnershipSection parcelId={selectedParcel.id} />
                </div>
              </>
            ) : (
              <p className="surface-panel p-4 text-sm text-muted-foreground">
                No parcel selected.
              </p>
            )}
          </Section>

          <Section title="GIS Data Provenance">
            <div className="surface-panel space-y-2 p-4 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Parcel geometry remains authoritative.</span>{" "}
                It is read from the database and never replaced by the uploaded alignment file.
              </p>
              <p>
                <span className="font-semibold text-foreground">The uploaded GeoJSON is the only route source.</span>{" "}
                It is validated, ordered by point_order or feature order, and drawn exactly as supplied.
              </p>
              <p>
                <span className="font-semibold text-foreground">Only intersected parcels are highlighted.</span>{" "}
                Unaffected parcels remain visible with their normal parcel-boundary styling.
              </p>
            </div>
          </Section>
        </>
      )}
    </AppShell>
  );
}

function ParcelOwnershipSection({ parcelId }: { parcelId: string }) {
  const { data: ownership, isLoading, error } = useQuery({
    queryKey: ["parcel-ownership", parcelId],
    queryFn: () => fetchParcelOwnership(parcelId),
    enabled: !!parcelId,
  });

  if (isLoading) {
    return (
      <div className="surface-panel p-4 text-sm text-muted-foreground">
        Loading ownership records...
      </div>
    );
  }

  if (error) {
    return (
      <div className="surface-panel p-4 text-sm text-destructive">
        Error loading ownership: {(error as Error).message}
      </div>
    );
  }

  if (!ownership || ownership.length === 0) {
    return (
      <div className="surface-panel p-4 text-sm text-muted-foreground">
        No ownership records found for this parcel.
      </div>
    );
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/50 bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">Owner</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Interest Type</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Ownership</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Verification</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Land Record</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {ownership.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 font-medium">
                  {record.party.display_name}
                  <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                    {record.party.party_ref}
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{record.interest_type.replace("_", "-")}</td>
                <td className="px-4 py-3 font-medium">
                  {formatShare(record.share_numerator, record.share_denominator)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      record.verification.toLowerCase() === "verified"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {record.verification}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{record.record_ref || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
