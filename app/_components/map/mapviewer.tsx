"use client";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import proj4 from "proj4";
import { MapView } from "@deck.gl/core/typed";
import DeckGL from "@deck.gl/react/typed";
import { TileLayer, MVTLayer, GeoBoundingBox } from "@deck.gl/geo-layers/typed";
import { BitmapLayer } from "@deck.gl/layers/typed";
import { Layer, PickingInfo } from "@deck.gl/core/typed";
import type { TooltipContent } from "@deck.gl/core/typed/lib/tooltip";
import InfoIcon from "../../../components/icons/infoicon";
import { GlobeAmericasIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../components/ui/button";

/* Constants, magic strings, types, etc */
const NOAA_CSB_LAYER_NAME = "IHO CSB Data";
const NOAA_S57_LAYER_NAME = "US S57 ENCs";
const OSM_BASE_LAYER_NAME = "Base Map";
const USER_CSB_LAYER_NAME = "Your CSB Data";

const mapLayerIdToInfo = new Map<string, string>([
  [OSM_BASE_LAYER_NAME, "A simple baselayer from OpenStreetMap."],
  [NOAA_S57_LAYER_NAME, "NOAA S57 ENC data as raster tiles, for US waters only."],
  [NOAA_CSB_LAYER_NAME, "Tracks from the DCDB Crowdsourced Bathymetry database."],
]);

const mapLayerIdToDefaultVisibility = new Map<string, boolean>([
  [OSM_BASE_LAYER_NAME, true],
  [NOAA_S57_LAYER_NAME, false],
  [NOAA_CSB_LAYER_NAME, false],
]);

const mapLayerIdToAttribution = new Map<string, string>([
  [OSM_BASE_LAYER_NAME, "© OpenStreetMap contributors"],
  [NOAA_S57_LAYER_NAME, "NOAA ENC S57 Data"],
  [NOAA_CSB_LAYER_NAME, "NOAA/DCDB CSB Database"],
]);

const CSB_INFO_TEXT =
  "Data contributed to the DCDB Crowdsourced Bathymetry database associated with the vessel you selected.";

const listFormatter = new Intl.ListFormat("en", {
  style: "short",
  type: "conjunction",
});

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -71.5,
  latitude: 41.5,
  zoom: 10,
  pitch: 0,
  bearing: 0,
};
type ViewState = typeof INITIAL_VIEW_STATE;
type TypeToggleLayerHandler = (layerId: string) => void;

/* Helpers for components - getting default / specific layers, etc */
const getTooltip = (info: PickingInfo): TooltipContent => {
  return null;
};

const getLayerFilterString = ({
  platformId,
  providerId,
}: {
  platformId?: string;
  providerId?: string;
}): string => {
  if (platformId) {
    return `UPPER(EXTERNAL_ID) LIKE '${platformId.toUpperCase()}'`;
  }
  if (providerId) {
    return `UPPER(PROVIDER) LIKE '${providerId.toUpperCase()}'`;
  }
  return "";
};

const getCSBLayer = ({
  platformId,
  providerId,
}: {
  platformId?: string;
  providerId?: string;
}): TileLayer | null => {
  const baseUrl =
    "https://gis.ngdc.noaa.gov/arcgis/rest/services/csb/MapServer/export?dpi=96&transparent=true&format=png32";

  const layer = new TileLayer({
    id: platformId || providerId,
    getTileData: (tile) => {
      const bbox = tile.bbox as GeoBoundingBox;
      const [west, south] = proj4("EPSG:4326", "EPSG:3857", [bbox.west, bbox.south]);
      const [east, north] = proj4("EPSG:4326", "EPSG:3857", [bbox.east, bbox.north]);
      const bboxString = `bbox=${west},${south},${east},${north}`;
      const sizeString = "size=256,256";
      // this filters the data to only show the users data
      const filterStr = getLayerFilterString({
        platformId,
        providerId,
      });
      const layerDefs = `layerDefs={"0": "${filterStr}", "1": "${filterStr}"}`;
      return `${baseUrl}&${bboxString}&bboxSR=3857&imageSR=3857&${sizeString}&f=image&${layerDefs}`;
    },
    renderSubLayers: (props) => {
      const {
        boundingBox: [[west, south], [east, north]],
      } = props.tile;
      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });
  return layer;
};

const getDefaultLayers = (): TileLayer[] => {
  return [
    new TileLayer({
      id: OSM_BASE_LAYER_NAME,
      data: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      visible: mapLayerIdToDefaultVisibility.get(OSM_BASE_LAYER_NAME) || false,
      renderSubLayers: (props) => {
        const {
          boundingBox: [[west, south], [east, north]],
        } = props.tile;
        return new BitmapLayer(props, {
          data: undefined,
          image: props.data,
          bounds: [west, south, east, north],
        });
      },
    }),
    new TileLayer({
      id: NOAA_S57_LAYER_NAME,
      visible: mapLayerIdToDefaultVisibility.get(NOAA_S57_LAYER_NAME) || false,
      getTileData: (tile) => {
        const bbox = tile.bbox as GeoBoundingBox;
        const [west, south] = proj4("EPSG:4326", "EPSG:3857", [bbox.west, bbox.south]);
        const [east, north] = proj4("EPSG:4326", "EPSG:3857", [bbox.east, bbox.north]);
        const url =
          "https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/WMSServer?service=WMS&request=GetMap&layers=&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&&width=256&height=256&srs=EPSG%3A3857";
        const layers = `layer=${"0,1,2,3,4,5,6,7"}`;
        const bboxString = `bbox=${west},${south},${east},${north}`;
        return url + "&" + layers + "&" + bboxString;
      },
      renderSubLayers: (props) => {
        const {
          boundingBox: [[west, south], [east, north]],
        } = props.tile;
        return new BitmapLayer(props, {
          data: undefined,
          image: props.data,
          bounds: [west, south, east, north],
        });
      },
    }),
    new MVTLayer({
      id: NOAA_CSB_LAYER_NAME,
      visible: mapLayerIdToDefaultVisibility.get(NOAA_CSB_LAYER_NAME) || false,
      data: "https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/csb_vector_tiles/VectorTileServer/tile/{z}/{y}/{x}",
      lineWidthUnits: "pixels",
      getLineWidth: 1,
      getLineColor: [10, 10, 10],
      pickable: false,
      opacity: 0.5,
    }),
  ];
};

function LayerLegend({ layers, handler }: { layers: Layer[]; handler: TypeToggleLayerHandler }) {
  return (
    <div className="p-2 bg-white opacity-90 border rounded-lg">
      <p className="border-b px-1 font-bold">Available Layers</p>
      {layers.map((layer, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            type="checkbox"
            id={layer.id}
            value={layer.id}
            checked={layer.props.visible}
            onChange={() => handler(layer.id)}
          />
          <label className="pl-2" htmlFor={layer.id}>
            {mapLayerIdToInfo.has(layer.id) ? (
              <span>{layer.id}</span>
            ) : (
              <span>{USER_CSB_LAYER_NAME}</span>
            )}
          </label>
          <div className="group relative duration-300">
            <InfoIcon />
            <span className="absolute hidden group-hover:flex top-12 -left-64 -translate-y-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm">
              {mapLayerIdToInfo.get(layer.id) || CSB_INFO_TEXT}
            </span>
          </div>
        </div>
      ))}
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
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);

  const [layers, setLayers] = useState<TileLayer[]>(getDefaultLayers());
  const [legendVisible, setLegendVisible] = useState(false);
  const legendRef = useRef<HTMLDivElement>(null);

  const handleToggleLayerVisibility = (layerId: string) => {
    const newLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        return layer.clone({ visible: !layer.props.visible });
      }
      return layer;
    });
    setLayers(newLayers);
  };

  // Load view state from local storage for ux (keeps map position on reload)
  useEffect(() => {
    const storedViewState = localStorage.getItem("viewState");
    if (storedViewState) {
      setViewState(JSON.parse(storedViewState));
    }
  }, []);

  // Add data layer for CSB from this user when auth state changes or they
  // add the information to their account
  useEffect(() => {
    if (platformId) {
      const userCSBLayer = getCSBLayer({ platformId: platformId });
      if (userCSBLayer) {
        setLayers([...getDefaultLayers(), userCSBLayer]);
      }
      return;
    }
    setLayers(getDefaultLayers());
  }, [platformId]);

  useEffect(() => {
    if (providerId) {
      const userCSBLayer = getCSBLayer({ providerId: providerId });
      if (userCSBLayer) {
        setLayers([...getDefaultLayers(), userCSBLayer]);
      }
    }
  }, [providerId]);

  const handleToggleLegendVisible = () => {
    if (legendRef.current) {
      legendRef.current.classList.toggle("invisible");
      setLegendVisible(!legendVisible);
    }
  };

  return (
    <div className="relative h-full">
      <DeckGL
        initialViewState={viewState}
        views={new MapView({
          repeat: true,
        })}
        controller={true}
        layers={layers}
        getTooltip={getTooltip}
        onViewStateChange={(e) => {
          const { viewState } = e;
          if (!viewState) {
            return;
          }
          localStorage.setItem("viewState", JSON.stringify(viewState));
        }}
      />
      <Button
        variant="outline"
        className="absolute top-4 right-4 bg-white/60 visible md:hidden"
        onClick={handleToggleLegendVisible}
        style={legendVisible ? { right: 180 } : {}}
      >
        {legendVisible ? (
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <GlobeAmericasIcon className="h-6 w-6 text-gray-600" />
        )}
      </Button>
      <div ref={legendRef} className="absolute invisible md:visible top-4 right-4 ">
        <LayerLegend layers={layers} handler={handleToggleLayerVisibility} />
      </div>
      {/* Attribution for each third party layer */}
      <div className="absolute bottom-2 right-2 text-xs">
        {layers &&
          layers.length > 0 &&
          listFormatter.format(
            layers
              .map((layer) => {
                if (layer.props.visible) {
                  return mapLayerIdToAttribution.get(layer.id);
                }
              })
              .filter((attr) => attr !== undefined) as string[]
          )}
      </div>
    </div>
  );
}
