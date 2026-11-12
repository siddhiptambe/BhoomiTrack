import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import type { GeoJsonFeatureCollection } from "@/lib/gis";

/**
 * Given the actual click latlng and the full parcel feature collection,
 * return the `id` of the parcel whose polygon contains that point.
 *
 * This is needed because when parcels share a boundary edge, Leaflet
 * fires the click on whichever polygon was rendered last — which may
 * not be the parcel the user intended to select. Point-in-polygon lookup
 * against the DB geometries is the only reliable way to identify the
 * correct parcel regardless of rendering order.
 */
function resolveParcelIdByPoint(
  latlng: L.LatLng,
  parcels: GeoJsonFeatureCollection,
): string | null {
  const clickPoint = turf.point([latlng.lng, latlng.lat]);
  for (const feature of parcels.features) {
    try {
      const geom = feature.geometry as { type: string };
      if (geom.type !== "Polygon" && geom.type !== "MultiPolygon") continue;
      if (turf.booleanPointInPolygon(clickPoint, feature as never)) {
        const id = (feature.properties as Record<string, unknown>)["id"];
        return typeof id === "string" ? id : null;
      }
    } catch {
      // skip invalid geometry
    }
  }
  return null;
}

export type LayerVisibility = {
  engineerPoints: boolean;
  alignment: boolean;
  parcels: boolean;
  affected: boolean;
  corridor: boolean;
};

type Props = {
  alignment: GeoJsonFeatureCollection;
  engineerPoints: GeoJsonFeatureCollection;
  parcels: GeoJsonFeatureCollection;
  affectedParcels: GeoJsonFeatureCollection;
  corridor: GeoJsonFeatureCollection;
  layers: LayerVisibility;
  selectedParcelId: string | null;
  onSelectParcel: (id: string | null) => void;
};

const ALIGNMENT_STYLE: L.PathOptions = { color: "#2563eb", weight: 4, opacity: 1, lineCap: "round", lineJoin: "round" };
const PARCEL_STYLE: L.PathOptions = {
  color: "#64748b",
  weight: 1.5,
  fillColor: "#e2e8f0",
  fillOpacity: 0.35,
};
const AFFECTED_STYLE: L.PathOptions = {
  color: "#dc2626",
  weight: 2,
  fillColor: "#fca5a5",
  fillOpacity: 0.55,
};
const SELECTED_STYLE: L.PathOptions = {
  color: "#7c3aed",
  weight: 3,
  fillColor: "#c4b5fd",
  fillOpacity: 0.6,
};
const CORRIDOR_STYLE: L.PathOptions = {
  color: "#f59e0b",
  weight: 1,
  dashArray: "6 4",
  fillColor: "#fbbf24",
  fillOpacity: 0.12,
};
const ENGINEER_POINT_STYLE = {
  radius: 7,
  color: "#7f1d1d",
  fillColor: "#ef4444",
  fillOpacity: 0.95,
  weight: 2,
};

export function GisMap({
  alignment,
  engineerPoints,
  parcels,
  affectedParcels,
  corridor,
  layers,
  selectedParcelId,
  onSelectParcel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groupsRef = useRef<{
    alignment?: L.GeoJSON;
    engineerPoints?: L.GeoJSON;
    parcels?: L.GeoJSON;
    affectedParcels?: L.GeoJSON;
    corridor?: L.GeoJSON;
  }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    map.setView([18.55, 73.8], 11);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(groupsRef.current).forEach((layer) => layer?.removeFrom(map));

    const alignmentLayer = L.geoJSON(alignment as never, {
      style: () => ALIGNMENT_STYLE,
    });

    const engineerPointsLayer = L.geoJSON(engineerPoints as never, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, ENGINEER_POINT_STYLE),
    });

    const corridorLayer = L.geoJSON(corridor as never, {
      style: () => CORRIDOR_STYLE,
    });

    const affectedParcelLayer = L.geoJSON(affectedParcels as never, {
      style: () => AFFECTED_STYLE,
      onEachFeature: (_feature, layer) => {
        layer.on("click", (e: L.LeafletMouseEvent) => {
          // Use actual click coordinates for point-in-polygon resolution.
          // Leaflet fires the event on whichever polygon was rendered last
          // when parcels share a boundary — PIP lookup finds the true parcel.
          const id = resolveParcelIdByPoint(e.latlng, parcels);
          if (id !== null) {
            onSelectParcel(id === selectedParcelId ? null : id);
          }
        });
      },
    });

    const parcelLayer = L.geoJSON(parcels as never, {
      style: (feature) => {
        const props = (feature?.properties ?? {}) as Record<string, unknown>;
        const id = String(props["id"] ?? "");
        const isSelected = id === selectedParcelId;
        const isAffected = affectedParcels.features.some(
          (item) => String((item.properties?.["id"] as string | undefined) ?? "") === id,
        );
        return isSelected ? SELECTED_STYLE : isAffected ? AFFECTED_STYLE : PARCEL_STYLE;
      },
      onEachFeature: (feature, layer) => {
        layer.on("click", (e: L.LeafletMouseEvent) => {
          // Use actual click coordinates for point-in-polygon resolution.
          // Leaflet fires the event on whichever polygon was rendered last
          // when parcels share a boundary — PIP lookup finds the true parcel.
          const id = resolveParcelIdByPoint(e.latlng, parcels);
          if (id !== null) {
            onSelectParcel(id === selectedParcelId ? null : id);
          }
        });
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const parcelRef = typeof props["parcel_ref"] === "string" ? props["parcel_ref"] : "";
        const numMatch = parcelRef.match(/-(\d+)$/);
        const label = numMatch ? numMatch[1] : "";
        if (label) {
          (layer as any).bindTooltip(label, {
            permanent: true,
            direction: "center",
            className: "parcel-label",
            offset: [0, 0],
          });
        }
      },
    });

    if (layers.parcels) parcelLayer.addTo(map);
    if (layers.affected && affectedParcels.features.length) affectedParcelLayer.addTo(map);
    if (layers.corridor && corridor.features.length) {
      corridorLayer.addTo(map);
      corridorLayer.bringToFront();
    }
    if (layers.alignment && alignment.features.length) {
      alignmentLayer.addTo(map);
      alignmentLayer.bringToFront();
    }
    if (layers.engineerPoints && engineerPoints.features.length) {
      engineerPointsLayer.addTo(map);
      engineerPointsLayer.bringToFront();
    }

    if (map && parcelLayer) {
      const updateLabels = () => {
        const zoom = map.getZoom();
        parcelLayer.eachLayer((l: any) => {
          if (zoom >= 14) {
            l.openTooltip?.();
          } else {
            l.closeTooltip?.();
          }
        });
      };
      map.on("zoomend", updateLabels);
      updateLabels();
    }

    groupsRef.current = {
      alignment: alignmentLayer,
      engineerPoints: engineerPointsLayer,
      parcels: parcelLayer,
      affectedParcels: affectedParcelLayer,
      corridor: corridorLayer,
    };

    const bounds = L.latLngBounds([]);
    [alignmentLayer, engineerPointsLayer, corridorLayer, parcelLayer, affectedParcelLayer].forEach((layer) => {
      layer.eachLayer((child) => {
        const childBounds = (child as L.Layer & { getBounds?: () => L.LatLngBounds }).getBounds?.();
        if (childBounds?.isValid()) bounds.extend(childBounds);
      });
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [32, 32] });
    }
  }, [alignment, engineerPoints, parcels, affectedParcels, corridor, selectedParcelId, onSelectParcel, layers]);

  return (
    <div
      ref={containerRef}
      className="h-[520px] w-full overflow-hidden rounded-lg border border-border"
      aria-label="Officer GIS map"
    />
  );
}
