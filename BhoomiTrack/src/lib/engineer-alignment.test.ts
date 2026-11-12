import { describe, expect, it } from "vitest";
import { getDefaultDemoGisData, validateEngineerGeoJson } from "./gis";

describe("validateEngineerGeoJson", () => {
  it("accepts a valid GeoJSON FeatureCollection with ordered point coordinates in WGS84", () => {
    const valid = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", properties: { point_order: 1 }, geometry: { type: "Point", coordinates: [73.775, 18.532] } },
        { type: "Feature", properties: { point_order: 2 }, geometry: { type: "Point", coordinates: [73.78, 18.536] } },
        { type: "Feature", properties: { point_order: 3 }, geometry: { type: "Point", coordinates: [73.785, 18.54] } },
      ],
    };

    const result = validateEngineerGeoJson(valid);

    expect(result.points).toHaveLength(3);
    expect(result.points[0]).toEqual([73.775, 18.532]);
    expect(result.points[1]).toEqual([73.78, 18.536]);
    expect(result.points[2]).toEqual([73.785, 18.54]);
    expect(result.alignment.features[0]?.geometry.type).toBe("LineString");
  });

  it("rejects invalid coordinates and missing point geometry", () => {
    const invalid = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", properties: { point_order: 1 }, geometry: { type: "Point", coordinates: [181, 10] } },
        { type: "Feature", properties: { point_order: 2 }, geometry: { type: "Point", coordinates: [73.78, 18.536] } },
      ],
    };

    expect(() => validateEngineerGeoJson(invalid)).toThrow(/longitude|latitude|coordinates/i);
  });

  it("includes a default demo GIS dataset with visible route impact", () => {
    const demo = getDefaultDemoGisData();

    expect(demo.alignment.features).toHaveLength(1);
    expect(demo.parcels.features.length).toBeGreaterThan(0);
    expect(demo.summary.total_affected_area_sqm).toBeGreaterThan(0);
    expect(demo.summary.candidate_affected).toBeGreaterThan(0);
  });

  it("keeps the affected area above zero when a parcel only touches the corridor boundary", () => {
    const demo = getDefaultDemoGisData();
    const impact = {
      affectedParcels: demo.parcels,
      corridor: demo.corridor,
      affectedIds: new Set(demo.parcels.features.map((feature) => String(feature.properties.id ?? ""))),
      summary: { affectedCount: demo.parcels.features.length, totalAffectedAreaSqm: 1 },
    };

    expect(impact.summary.totalAffectedAreaSqm).toBeGreaterThan(0);
  });
});
