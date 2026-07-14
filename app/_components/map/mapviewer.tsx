"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GlobeAmericasIcon, XMarkIcon } from "@heroicons/react/24/outline";
import maplibregl, { Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl";
import InfoIcon from "../../../components/icons/infoicon";
import { Button } from "../../../components/ui/button";

const OSM_BASEMAP_NAME = "OpenStreetMap";
const VECTOR_CHARTS_BASEMAP_NAME = "Vector Charts (US)";
const CHS_ENC_BASEMAP_NAME = "CHS ENC (Canada)";
const SATELLITE_BASEMAP_NAME = "Satellite";
const CHS_ENC_WMS_BASE_URL =
  "https://egisp.dfo-mpo.gc.ca/arcgis/rest/services/chs/ENC_MaritimeChartService/MapServer/exts/MaritimeChartService/WMSServer";
const CHS_ENC_WMS_LAYERS = "0,1,2,3,4,5,6,7,8,9,10,11,12";
const BASEMAP_OPTIONS = [
  OSM_BASEMAP_NAME,
  VECTOR_CHARTS_BASEMAP_NAME,
  CHS_ENC_BASEMAP_NAME,
  SATELLITE_BASEMAP_NAME,
] as const;
const NOAA_CSB_LAYER_NAME = "IHO CSB Data";
const USER_CSB_LAYER_NAME = "Your CSB Data";
const OBSERVATIONS_LAYER_NAME = "Observations";
const VIEW_STATE_STORAGE_KEY = "viewState";
const NOAA_CSB_SOURCE_ID = "noaa-csb-source";
const NOAA_CSB_LAYER_ID = "noaa-csb-layer";
const USER_CSB_SOURCE_ID = "user-csb-source";
const USER_CSB_LAYER_ID = "user-csb-layer";
const OBSERVATIONS_SOURCE_ID = "observations-source";
const OBSERVATIONS_LAYER_ID = "observations-layer";
const OBSERVATIONS_GEOJSON_URL =
  "https://storage.googleapis.com/farsounder-public-bucket/observations/observations.geojson";
const OBSERVATION_ICONS = [
  { id: "observation-whale", url: "/observations/whale.svg" },
  { id: "observation-trash", url: "/observations/trash.svg" },
  { id: "observation-hazard", url: "/observations/hazard.svg" },
] as const;
const CSB_EXPORT_BASE_URL =
  "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/export?dpi=96&transparent=true&format=png32";

const basemapInfo = new Map<string, string>([
  [OSM_BASEMAP_NAME, "A simple global basemap from OpenStreetMap."],
  [VECTOR_CHARTS_BASEMAP_NAME, "Vector nautical charts for US waters only."],
  [
    CHS_ENC_BASEMAP_NAME,
    "Canadian Hydrographic Service ENC charts as raster tiles, for Canadian waters only.",
  ],
  [SATELLITE_BASEMAP_NAME, "Esri World Imagery satellite basemap."],
]);

const overlayInfo = new Map<string, string>([
  [NOAA_CSB_LAYER_NAME, "Tracks from the DCDB Crowdsourced Bathymetry database."],
  [
    USER_CSB_LAYER_NAME,
    "Data contributed to the DCDB Crowdsourced Bathymetry database associated with the vessel or provider you selected.",
  ],
  [OBSERVATIONS_LAYER_NAME, "Reported whales, trash, and navigation hazards."],
]);

const overlayDefaultVisibility = new Map<string, boolean>([
  [NOAA_CSB_LAYER_NAME, false],
  [USER_CSB_LAYER_NAME, true],
  [OBSERVATIONS_LAYER_NAME, true],
]);

const basemapAttribution = new Map<string, string>([
  [OSM_BASEMAP_NAME, "© OpenStreetMap contributors"],
  [VECTOR_CHARTS_BASEMAP_NAME, "Vector Charts"],
  [CHS_ENC_BASEMAP_NAME, "© Canadian Hydrographic Service"],
  [SATELLITE_BASEMAP_NAME, "Esri, Maxar, Earthstar Geographics, and the GIS User Community"],
]);

const overlayAttribution = new Map<string, string>([
  [NOAA_CSB_LAYER_NAME, "NOAA/DCDB CSB Database"],
  [OBSERVATIONS_LAYER_NAME, "FarSounder Observations"],
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
type BasemapId = (typeof BASEMAP_OPTIONS)[number];
type OverlayId =
  | typeof NOAA_CSB_LAYER_NAME
  | typeof USER_CSB_LAYER_NAME
  | typeof OBSERVATIONS_LAYER_NAME;
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

const ESRI_IMAGERY_STYLE: Exclude<MapStyle, string> = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },
  layers: [
    {
      id: "esri",
      type: "raster",
      source: "esri",
    },
  ],
};

const CHS_ENC_STYLE: Exclude<MapStyle, string> = {
  version: 8,
  sources: {
    chs_enc: {
      type: "raster",
      tiles: [
        `${CHS_ENC_WMS_BASE_URL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${CHS_ENC_WMS_LAYERS}&STYLES=&FORMAT=image/png&TRANSPARENT=true&HEIGHT=256&WIDTH=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}`,
      ],
      tileSize: 256,
      attribution: "© Canadian Hydrographic Service",
    },
  },
  layers: [
    {
      id: "chs-enc",
      type: "raster",
      source: "chs_enc",
    },
  ],
};

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
  if (basemapId === SATELLITE_BASEMAP_NAME) {
    return ESRI_IMAGERY_STYLE;
  }
  if (basemapId === CHS_ENC_BASEMAP_NAME) {
    return CHS_ENC_STYLE;
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

const observationImagePromises = new Map<string, Promise<ImageData>>();
const observationVisibility = new WeakMap<MapLibreMap, boolean>();

type ObservationInteractionState = {
  hoverPopup: maplibregl.Popup | null;
  pinnedPopup: maplibregl.Popup | null;
  handleMouseMove: (event: MapLayerMouseEvent) => void;
  handleMouseLeave: () => void;
  handleClick: (event: MapLayerMouseEvent) => void;
};

const observationInteractions = new WeakMap<MapLibreMap, ObservationInteractionState>();

function loadObservationImage(url: string): Promise<ImageData> {
  const existingPromise = observationImagePromises.get(url);
  if (existingPromise) {
    return existingPromise;
  }

  const imagePromise = new Promise<ImageData>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error(`Could not prepare observation icon: ${url}`));
        return;
      }

      context.drawImage(image, 0, 0, 32, 32);
      resolve(context.getImageData(0, 0, 32, 32));
    };
    image.onerror = () => reject(new Error(`Could not load observation icon: ${url}`));
    image.src = url;
  });

  observationImagePromises.set(url, imagePromise);
  return imagePromise;
}

function formatObservationPropertyName(name: string): string {
  const words = name.replaceAll("_", " ").trim();
  return words ? words[0].toUpperCase() + words.slice(1) : name;
}

function formatObservationPropertyValue(name: string, value: unknown): string {
  if (name === "timestamp" && typeof value === "string") {
    const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}(?:\.\d+)?)Z$/);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }
  }

  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function buildObservationPopupContent(properties: Record<string, unknown>): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "min-w-48 max-w-72";

  const title = document.createElement("p");
  title.className = "mb-2 font-bold";
  title.textContent =
    typeof properties.observation_type === "string" ? properties.observation_type : "Observation";
  container.appendChild(title);

  for (const [name, value] of Object.entries(properties)) {
    const row = document.createElement("div");
    row.className = "grid grid-cols-[auto_1fr] gap-x-2 text-sm";

    const label = document.createElement("span");
    label.className = "font-semibold";
    label.textContent = `${formatObservationPropertyName(name)}:`;

    const displayedValue = document.createElement("span");
    displayedValue.className = "break-words";
    displayedValue.textContent = formatObservationPropertyValue(name, value);

    row.append(label, displayedValue);
    container.appendChild(row);
  }

  return container;
}

function getObservationProperties(event: MapLayerMouseEvent): Record<string, unknown> | null {
  const properties = event.features?.[0]?.properties;
  return properties ? (properties as Record<string, unknown>) : null;
}

function removeObservationInteractions(map: MapLibreMap) {
  const interactions = observationInteractions.get(map);
  if (!interactions) {
    return;
  }

  map.off("mousemove", OBSERVATIONS_LAYER_ID, interactions.handleMouseMove);
  map.off("mouseleave", OBSERVATIONS_LAYER_ID, interactions.handleMouseLeave);
  map.off("click", OBSERVATIONS_LAYER_ID, interactions.handleClick);
  interactions.hoverPopup?.remove();
  interactions.pinnedPopup?.remove();
  map.getCanvas().style.cursor = "";
  observationInteractions.delete(map);
}

function ensureObservationInteractions(map: MapLibreMap) {
  if (observationInteractions.has(map)) {
    return;
  }

  const interactions: ObservationInteractionState = {
    hoverPopup: null,
    pinnedPopup: null,
    handleMouseMove: () => {},
    handleMouseLeave: () => {},
    handleClick: () => {},
  };

  interactions.handleMouseMove = (event) => {
    map.getCanvas().style.cursor = "pointer";
    if (interactions.pinnedPopup) {
      return;
    }

    const properties = getObservationProperties(event);
    if (!properties) {
      return;
    }

    interactions.hoverPopup?.remove();
    interactions.hoverPopup = new maplibregl.Popup({
      anchor: "top",
      closeButton: false,
      closeOnClick: false,
      offset: 18,
    })
      .setLngLat(event.lngLat)
      .setDOMContent(buildObservationPopupContent(properties))
      .addTo(map);
  };

  interactions.handleMouseLeave = () => {
    map.getCanvas().style.cursor = "";
    interactions.hoverPopup?.remove();
    interactions.hoverPopup = null;
  };

  interactions.handleClick = (event) => {
    const properties = getObservationProperties(event);
    if (!properties) {
      return;
    }

    interactions.hoverPopup?.remove();
    interactions.hoverPopup = null;
    interactions.pinnedPopup?.remove();

    const popup = new maplibregl.Popup({
      anchor: "top",
      closeButton: true,
      closeOnClick: true,
      offset: 18,
    })
      .setLngLat(event.lngLat)
      .setDOMContent(buildObservationPopupContent(properties))
      .addTo(map);
    interactions.pinnedPopup = popup;
    popup.once("close", () => {
      if (interactions.pinnedPopup === popup) {
        interactions.pinnedPopup = null;
      }
    });
  };

  map.on("mousemove", OBSERVATIONS_LAYER_ID, interactions.handleMouseMove);
  map.on("mouseleave", OBSERVATIONS_LAYER_ID, interactions.handleMouseLeave);
  map.on("click", OBSERVATIONS_LAYER_ID, interactions.handleClick);
  observationInteractions.set(map, interactions);
}

function removeObservationsOverlay(map: MapLibreMap) {
  removeObservationInteractions(map);
  removeLayerIfPresent(map, OBSERVATIONS_LAYER_ID);
  removeSourceIfPresent(map, OBSERVATIONS_SOURCE_ID);
}

async function ensureObservationsOverlay(map: MapLibreMap) {
  if (!observationVisibility.get(map) || !map.isStyleLoaded()) {
    return;
  }

  if (!map.getSource(OBSERVATIONS_SOURCE_ID)) {
    map.addSource(OBSERVATIONS_SOURCE_ID, {
      type: "geojson",
      data: OBSERVATIONS_GEOJSON_URL,
    });
  }

  if (!map.getLayer(OBSERVATIONS_LAYER_ID)) {
    map.addLayer({
      id: OBSERVATIONS_LAYER_ID,
      type: "symbol",
      source: OBSERVATIONS_SOURCE_ID,
      layout: {
        "icon-image": [
          "match",
          ["get", "observation_type"],
          ["Whale", "whale"],
          "observation-whale",
          ["Trash", "trash"],
          "observation-trash",
          "observation-hazard",
        ],
        "icon-size": 1,
        "icon-allow-overlap": true,
      },
    });
  }

  ensureObservationInteractions(map);

  const icons = await Promise.all(
    OBSERVATION_ICONS.map(async ({ id, url }) => ({
      id,
      image: await loadObservationImage(url),
    }))
  );

  if (!observationVisibility.get(map) || !map.getLayer(OBSERVATIONS_LAYER_ID)) {
    return;
  }

  for (const { id, image } of icons) {
    if (!map.hasImage(id)) {
      map.addImage(id, image, { pixelRatio: 1 });
    }
  }
}

function syncOverlayLayers(
  map: MapLibreMap,
  { platformId, providerId, visibility }: OverlayConfig
) {
  const styleLoaded = map.isStyleLoaded();
  observationVisibility.set(map, visibility[OBSERVATIONS_LAYER_NAME]);

  if (visibility[OBSERVATIONS_LAYER_NAME]) {
    if (styleLoaded) {
      void ensureObservationsOverlay(map);
    }
  } else {
    removeObservationsOverlay(map);
  }

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
    ? [NOAA_CSB_LAYER_NAME, USER_CSB_LAYER_NAME, OBSERVATIONS_LAYER_NAME]
    : [NOAA_CSB_LAYER_NAME, OBSERVATIONS_LAYER_NAME];

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
    [OBSERVATIONS_LAYER_NAME]: overlayDefaultVisibility.get(OBSERVATIONS_LAYER_NAME) ?? true,
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
    if (
      !mapContainerRef.current ||
      mapRef.current ||
      containerSize.width === 0 ||
      containerSize.height === 0
    ) {
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
      observationVisibility.set(map, false);
      removeObservationInteractions(map);
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
    removeObservationInteractions(mapRef.current);
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
    ...(overlayVisibility[NOAA_CSB_LAYER_NAME]
      ? [overlayAttribution.get(NOAA_CSB_LAYER_NAME)]
      : []),
    ...(overlayVisibility[OBSERVATIONS_LAYER_NAME]
      ? [overlayAttribution.get(OBSERVATIONS_LAYER_NAME)]
      : []),
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
      <div
        className={`absolute top-4 right-4 z-10 ${legendVisible ? "visible" : "invisible md:visible"}`}
      >
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
