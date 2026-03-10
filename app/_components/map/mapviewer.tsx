"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GlobeAmericasIcon, XMarkIcon } from "@heroicons/react/24/outline";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import InfoIcon from "../../../components/icons/infoicon";
import { Button } from "../../../components/ui/button";

const VECTOR_CHARTS_BASEMAP_NAME = "Vector Charts (US)";
const OSM_BASEMAP_NAME = "OpenStreetMap";
const NOAA_CSB_LAYER_NAME = "IHO CSB Data";
const USER_CSB_LAYER_NAME = "Your CSB Data";
const VIEW_STATE_STORAGE_KEY = "viewState";
const NOAA_CSB_SOURCE_ID = "noaa-csb-source";
const NOAA_CSB_LAYER_ID = "noaa-csb-layer";
const USER_CSB_SOURCE_ID = "user-csb-source";
const USER_CSB_LAYER_ID = "user-csb-layer";
const CSB_EXPORT_BASE_URL =
  "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/export?dpi=96&transparent=true&format=png32";

const basemapInfo = new Map<string, string>([
  [VECTOR_CHARTS_BASEMAP_NAME, "Vector nautical charts for US waters only."],
  [OSM_BASEMAP_NAME, "A simple global basemap from OpenStreetMap."],
]);

const overlayInfo = new Map<string, string>([
  [NOAA_CSB_LAYER_NAME, "Tracks from the DCDB Crowdsourced Bathymetry database."],
  [USER_CSB_LAYER_NAME, "Data contributed to the DCDB Crowdsourced Bathymetry database associated with the vessel or provider you selected."],
]);

const overlayDefaultVisibility = new Map<string, boolean>([
  [NOAA_CSB_LAYER_NAME, false],
  [USER_CSB_LAYER_NAME, true],
]);

const basemapAttribution = new Map<string, string>([
  [VECTOR_CHARTS_BASEMAP_NAME, "Vector Charts"],
  [OSM_BASEMAP_NAME, "© OpenStreetMap contributors"],
]);

const overlayAttribution = new Map<string, string>([
  [NOAA_CSB_LAYER_NAME, "NOAA/DCDB CSB Database"],
]);

const listFormatter = new Intl.ListFormat("en", {
  style: "short",
  type: "conjunction",
});

const INITIAL_VIEW_STATE = {
  longitude: -71.5,
  latitude: 41.5,
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW_STATE;
type BasemapId = typeof VECTOR_CHARTS_BASEMAP_NAME | typeof OSM_BASEMAP_NAME;
type OverlayId = typeof NOAA_CSB_LAYER_NAME | typeof USER_CSB_LAYER_NAME;
type OverlayVisibility = Record<OverlayId, boolean>;
type MapStyle = Exclude<Parameters<MapLibreMap["setStyle"]>[0], null>;
type OverlayConfig = {
  platformId?: string;
  providerId?: string;
  visibility: OverlayVisibility;
};

const OSM_STYLE: Exclude<MapStyle, string> = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

const BASEMAP_OPTIONS: BasemapId[] = [VECTOR_CHARTS_BASEMAP_NAME, OSM_BASEMAP_NAME];

function buildVectorChartsStyleUrl(token: string): string {
  const params = new URLSearchParams({
    token,
    theme: "day",
    depthUnits: "meters",
  });
  return `https://api.vectorcharts.com/api/v1/styles/base.json?${params.toString()}`;
}

function getMapStyle({
  basemapId,
  vectorChartsToken,
}: {
  basemapId: BasemapId;
  vectorChartsToken?: string;
}): MapStyle {
  if (basemapId === VECTOR_CHARTS_BASEMAP_NAME && vectorChartsToken) {
    return buildVectorChartsStyleUrl(vectorChartsToken);
  }
  return OSM_STYLE;
}

function getStoredViewState(): ViewState {
  if (typeof window === "undefined") {
    return INITIAL_VIEW_STATE;
  }

  const storedViewState = localStorage.getItem(VIEW_STATE_STORAGE_KEY);
  if (!storedViewState) {
    return INITIAL_VIEW_STATE;
  }

  try {
    const parsed = JSON.parse(storedViewState) as Partial<Record<keyof ViewState, unknown>>;
    const getFiniteNumber = (key: keyof ViewState): number => {
      const value = parsed[key];
      return typeof value === "number" && Number.isFinite(value) ? value : INITIAL_VIEW_STATE[key];
    };

    return {
      longitude: getFiniteNumber("longitude"),
      latitude: getFiniteNumber("latitude"),
      zoom: getFiniteNumber("zoom"),
      pitch: getFiniteNumber("pitch"),
      bearing: getFiniteNumber("bearing"),
    };
  } catch {
    return INITIAL_VIEW_STATE;
  }
}

function persistViewState(map: MapLibreMap) {
  const center = map.getCenter();
  const nextViewState: ViewState = {
    longitude: center.lng,
    latitude: center.lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };

  localStorage.setItem(VIEW_STATE_STORAGE_KEY, JSON.stringify(nextViewState));
}

function getLayerFilterString({
  platformId,
  providerId,
}: {
  platformId?: string;
  providerId?: string;
}): string {
  if (platformId) {
    return `UPPER(EXTERNAL_ID) LIKE '${platformId.toUpperCase()}'`;
  }
  if (providerId) {
    return `UPPER(PROVIDER) LIKE '${providerId.toUpperCase()}'`;
  }
  return "";
}

function buildCsbTileUrl(filterString?: string): string {
  const baseParts = [
    CSB_EXPORT_BASE_URL,
    "bbox={bbox-epsg-3857}",
    "bboxSR=3857",
    "imageSR=3857",
    "size=256,256",
    "f=image",
  ];

  if (!filterString) {
    return baseParts.join("&");
  }

  const layerDefs = encodeURIComponent(
    JSON.stringify({
      0: filterString,
      1: filterString,
    })
  );

  return [...baseParts, `layerDefs=${layerDefs}`].join("&");
}

function removeLayerIfPresent(map: MapLibreMap, layerId: string) {
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
}

function removeSourceIfPresent(map: MapLibreMap, sourceId: string) {
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}

function ensureRasterOverlay({
  map,
  sourceId,
  layerId,
  tileUrl,
}: {
  map: MapLibreMap;
  sourceId: string;
  layerId: string;
  tileUrl: string;
}) {
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: "raster",
      tiles: [tileUrl],
      tileSize: 256,
    });
  }

  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: "raster",
      source: sourceId,
      layout: {
        visibility: "visible",
      },
      paint: {
        "raster-opacity": 0.75,
      },
    });
  }
}

function syncOverlayLayers(map: MapLibreMap, { platformId, providerId, visibility }: OverlayConfig) {
  const styleLoaded = map.isStyleLoaded();

  if (visibility[NOAA_CSB_LAYER_NAME]) {
    if (styleLoaded) {
      ensureRasterOverlay({
        map,
        sourceId: NOAA_CSB_SOURCE_ID,
        layerId: NOAA_CSB_LAYER_ID,
        tileUrl: buildCsbTileUrl(),
      });
    }
  } else {
    removeLayerIfPresent(map, NOAA_CSB_LAYER_ID);
    removeSourceIfPresent(map, NOAA_CSB_SOURCE_ID);
  }

  const filterString = getLayerFilterString({
    platformId,
    providerId,
  });

  if (!filterString) {
    removeLayerIfPresent(map, USER_CSB_LAYER_ID);
    removeSourceIfPresent(map, USER_CSB_SOURCE_ID);
    return;
  }

  if (visibility[USER_CSB_LAYER_NAME]) {
    if (styleLoaded) {
      ensureRasterOverlay({
        map,
        sourceId: USER_CSB_SOURCE_ID,
        layerId: USER_CSB_LAYER_ID,
        tileUrl: buildCsbTileUrl(filterString),
      });
    }
  } else {
    removeLayerIfPresent(map, USER_CSB_LAYER_ID);
    removeSourceIfPresent(map, USER_CSB_SOURCE_ID);
  }

  map.triggerRepaint();
}

function LegendInfo({ text }: { text: string }) {
  return (
    <div className="group relative duration-300">
      <InfoIcon />
      <span className="absolute hidden group-hover:flex top-12 -left-64 -translate-y-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm">
        {text}
      </span>
    </div>
  );
}

function LayerLegend({
  basemapId,
  onBasemapChange,
  overlayVisibility,
  onToggleOverlay,
  showUserLayer,
  vectorChartsEnabled,
}: {
  basemapId: BasemapId;
  onBasemapChange: (basemapId: BasemapId) => void;
  overlayVisibility: OverlayVisibility;
  onToggleOverlay: (layerId: OverlayId) => void;
  showUserLayer: boolean;
  vectorChartsEnabled: boolean;
}) {
  const overlayEntries: OverlayId[] = showUserLayer
    ? [NOAA_CSB_LAYER_NAME, USER_CSB_LAYER_NAME]
    : [NOAA_CSB_LAYER_NAME];

  return (
    <div className="p-3 bg-white/90 border rounded-lg shadow-sm min-w-64">
      <p className="border-b px-1 pb-1 font-bold">Available Layers</p>
      <div className="pt-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-600">Basemap</p>
        {BASEMAP_OPTIONS.map((name) => {
          const disabled = name === VECTOR_CHARTS_BASEMAP_NAME && !vectorChartsEnabled;
          const label =
            name === VECTOR_CHARTS_BASEMAP_NAME ? (
              <span>
                <a
                  href="https://vectorcharts.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  Vector Charts
                </a>{" "}
                (US)
              </span>
            ) : (
              <span>{name}</span>
            );
          return (
            <label
              key={name}
              className={`flex items-center gap-2 px-1 py-1 ${disabled ? "cursor-not-allowed text-gray-400" : ""}`}
            >
              <input
                type="radio"
                name="basemap"
                checked={basemapId === name}
                disabled={disabled}
                onChange={() => onBasemapChange(name)}
              />
              {label}
              <LegendInfo text={basemapInfo.get(name) || ""} />
            </label>
          );
        })}
        {!vectorChartsEnabled ? (
          <p className="px-1 pt-1 text-xs text-amber-700">
            Set `NEXT_PUBLIC_VECTOR_CHARTS_TOKEN` to enable the Vector Charts basemap.
          </p>
        ) : null}
      </div>
      <div className="pt-3">
        <p className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-600">Overlays</p>
        {overlayEntries.map((layerId) => (
          <label key={layerId} className="flex items-center gap-2 px-1 py-1">
            <input
              type="checkbox"
              checked={overlayVisibility[layerId]}
              onChange={() => onToggleOverlay(layerId)}
            />
            <span>{layerId}</span>
            <LegendInfo text={overlayInfo.get(layerId) || ""} />
          </label>
        ))}
      </div>
    </div>
  );
}

export default function MapViewer({
  platformId,
  providerId,
}: {
  platformId?: string;
  providerId?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const vectorChartsToken = process.env.NEXT_PUBLIC_VECTOR_CHARTS_TOKEN?.trim();
  const vectorChartsEnabled = Boolean(vectorChartsToken);
  const showUserLayer = Boolean(platformId || providerId);
  const [legendVisible, setLegendVisible] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [basemapId, setBasemapId] = useState<BasemapId>(OSM_BASEMAP_NAME);
  const appliedBasemapRef = useRef<BasemapId | null>(null);
  const activeBasemapId =
    basemapId === VECTOR_CHARTS_BASEMAP_NAME && !vectorChartsEnabled ? OSM_BASEMAP_NAME : basemapId;
  const [overlayVisibility, setOverlayVisibility] = useState<OverlayVisibility>({
    [NOAA_CSB_LAYER_NAME]: overlayDefaultVisibility.get(NOAA_CSB_LAYER_NAME) ?? false,
    [USER_CSB_LAYER_NAME]: overlayDefaultVisibility.get(USER_CSB_LAYER_NAME) ?? true,
  });
  const overlayConfig = useMemo<OverlayConfig>(
    () => ({
      platformId,
      providerId,
      visibility: overlayVisibility,
    }),
    [overlayVisibility, platformId, providerId]
  );
  const latestOverlayConfigRef = useRef<OverlayConfig>(overlayConfig);
  latestOverlayConfigRef.current = overlayConfig;

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const element = containerRef.current;
    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setContainerSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || containerSize.width === 0 || containerSize.height === 0) {
      return;
    }

    const startingViewState = getStoredViewState();
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      attributionControl: false,
      style: getMapStyle({
        basemapId: activeBasemapId,
        vectorChartsToken,
      }),
      center: [startingViewState.longitude, startingViewState.latitude],
      zoom: startingViewState.zoom,
      bearing: startingViewState.bearing,
      pitch: startingViewState.pitch,
    });

    mapRef.current = map;
    appliedBasemapRef.current = activeBasemapId;

    const handleLoad = () => {
      syncOverlayLayers(map, latestOverlayConfigRef.current);
    };
    const handleMoveEnd = () => persistViewState(map);
    map.on("load", handleLoad);
    map.on("moveend", handleMoveEnd);

    return () => {
      map.off("load", handleLoad);
      map.off("moveend", handleMoveEnd);
      map.remove();
      mapRef.current = null;
    };
  }, [activeBasemapId, containerSize.height, containerSize.width, vectorChartsToken]);

  useEffect(() => {
    if (!mapRef.current || appliedBasemapRef.current === activeBasemapId) {
      return;
    }

    mapRef.current.once("styledata", () => {
      syncOverlayLayers(mapRef.current!, latestOverlayConfigRef.current);
    });
    mapRef.current.setStyle(
      getMapStyle({
        basemapId: activeBasemapId,
        vectorChartsToken,
      }),
      { diff: false }
    );
    appliedBasemapRef.current = activeBasemapId;
  }, [activeBasemapId, vectorChartsToken]);

  useEffect(() => {
    if (!mapRef.current || containerSize.width === 0 || containerSize.height === 0) {
      return;
    }

    mapRef.current.resize();
  }, [containerSize.height, containerSize.width]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current;
    syncOverlayLayers(map, latestOverlayConfigRef.current);

    if (map.isStyleLoaded()) {
      return;
    }

    const handleStyleData = () => {
      if (!map.isStyleLoaded()) {
        return;
      }

      syncOverlayLayers(map, latestOverlayConfigRef.current);
      map.off("styledata", handleStyleData);
    };

    map.on("styledata", handleStyleData);

    return () => {
      map.off("styledata", handleStyleData);
    };
  }, [overlayConfig]);

  const handleToggleOverlay = (layerId: OverlayId) => {
    setOverlayVisibility((previous) => ({
      ...previous,
      [layerId]: !previous[layerId],
    }));
  };

  const attributionParts = [
    basemapAttribution.get(activeBasemapId),
    ...(overlayVisibility[NOAA_CSB_LAYER_NAME] ? [overlayAttribution.get(NOAA_CSB_LAYER_NAME)] : []),
  ];

  return (
    <div ref={containerRef} className="relative w-full h-full min-w-0 min-h-0 overflow-hidden">
      <div
        ref={mapContainerRef}
        className="absolute inset-0"
        style={{
          width: containerSize.width ? `${containerSize.width}px` : "100%",
          height: containerSize.height ? `${containerSize.height}px` : "100%",
        }}
      />
      <Button
        variant="outline"
        className="absolute top-4 right-4 z-10 bg-white/60 visible md:hidden"
        onClick={() => setLegendVisible((current) => !current)}
        style={legendVisible ? { right: 280 } : {}}
      >
        {legendVisible ? (
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <GlobeAmericasIcon className="h-6 w-6 text-gray-600" />
        )}
      </Button>
      <div className={`absolute top-4 right-4 z-10 ${legendVisible ? "visible" : "invisible md:visible"}`}>
        <LayerLegend
          basemapId={basemapId}
          onBasemapChange={setBasemapId}
          overlayVisibility={overlayVisibility}
          onToggleOverlay={handleToggleOverlay}
          showUserLayer={showUserLayer}
          vectorChartsEnabled={vectorChartsEnabled}
        />
      </div>
      <div className="absolute bottom-2 right-2 z-10 text-xs bg-white/70 rounded px-2 py-1">
        {listFormatter.format(attributionParts.filter((part): part is string => Boolean(part)))}
      </div>
    </div>
  );
}
