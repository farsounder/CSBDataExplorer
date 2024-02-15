"use client";
import React, { useRef } from "react";
import { useState } from "react";
import proj4 from "proj4";
import DeckGL from "@deck.gl/react/typed";
import { TileLayer, MVTLayer, GeoBoundingBox } from "@deck.gl/geo-layers/typed";
import { BitmapLayer } from "@deck.gl/layers/typed";
import { Layer, PickingInfo } from "@deck.gl/core/typed";
import type { TooltipContent } from "@deck.gl/core/typed/lib/tooltip";
import InfoIcon from "../../../../components/icons/infoicon";
import { GlobeAmericasIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../../components/ui/button";

const NOAA_CSB_LAYER_NAME = "CSB Data";
const NOAA_S57_LAYER_NAME = "US S57";
const OSM_BASE_LAYER_NAME = "OSM Base";
const FS_BATHY_HS_LAYER_NAME = "FS Bathy (hs)";
const FS_BATHY_LAYER_NAME = "FS Bathy";

const mapLayerIdToInfo = new Map<string, string>([
  [OSM_BASE_LAYER_NAME, "A simple baselayer from OpenStreetMap."],
  [
    NOAA_S57_LAYER_NAME,
    "NOAA S57 ENC data as raster tiles, for US waters only.",
  ],
  [FS_BATHY_HS_LAYER_NAME, "A PNG of hillshaded data bathymetry data."],
  [FS_BATHY_LAYER_NAME, "A PNG of colorized bathymetry data."],
  [
    NOAA_CSB_LAYER_NAME,
    "Tracks from the DCDB Crowdsourced Bathymetry database.",
  ],
]);

// Type to represent vector grids
interface GridData {
  properties: {
    depth_meters: number;
    row_updated_time: string;
    grid_product_id: number;
    number_of_points: number;
  };
}

interface DepthSounderData {
  properties: {
    depth_meters: number;
    sent_to_dcdb: boolean;
    user_id: number;
  };
}

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -71.5,
  latitude: 41.5,
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

const getTooltip = (info: PickingInfo): TooltipContent => {
  return null;
};

type TypeToggleLayerHandler = (layerId: string) => void;

const LayerVisibilityControl = ({
  layers,
  handler,
}: {
  layers: Layer[];
  handler: TypeToggleLayerHandler;
}) => {
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
            {layer.id}
          </label>
          <div className="group relative duration-300">
            <InfoIcon />
            <span className="absolute hidden group-hover:flex top-12 -left-64 -translate-y-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm">
              {mapLayerIdToInfo.get(layer.id)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const mapDepthToColor = (depth: number | undefined): number[] => {
  // TODO(Heath): this is where we can implement a color scale
  return [230, 0, 0];
};

export default function MapViewer() {
  const [layers, setLayers] = useState<Layer[]>(getDefaultLayers());
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

  const handleToggleLegendVisible = () => {
    if (legendRef.current) {
      legendRef.current.classList.toggle("invisible");
      setLegendVisible(!legendVisible);
    }
  };

  return (
    <div className="relative h-full">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getTooltip={getTooltip}
      />
      <Button
        variant="outline"
        className="absolute top-4 right-4 bg-white/60 visbile md:hidden"
        onClick={handleToggleLegendVisible}
        style={legendVisible ? { right: 200 } : {}}
      >
        {legendVisible ? (
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <GlobeAmericasIcon className="h-6 w-6 text-gray-600" />
        )}
      </Button>
      <div
        ref={legendRef}
        className="absolute invisible md:visible top-4 right-4 "
      >
        <LayerVisibilityControl
          layers={layers}
          handler={handleToggleLayerVisibility}
        />
      </div>
    </div>
  );
}

// Moved into this function to make the main MapViewer component more readable
const getDefaultLayers = (): Layer[] => {
  return [
    new TileLayer({
      id: OSM_BASE_LAYER_NAME,
      data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
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
      getTileData: (tile) => {
        const bbox = tile.bbox as GeoBoundingBox;
        const [west, south] = proj4("EPSG:4326", "EPSG:3857", [
          bbox.west,
          bbox.south,
        ]);
        const [east, north] = proj4("EPSG:4326", "EPSG:3857", [
          bbox.east,
          bbox.north,
        ]);
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
    new BitmapLayer({
      id: FS_BATHY_HS_LAYER_NAME,
      bounds: [
        [-71.457633569, 41.383995775],
        [-71.457633569, 41.671457779],
        [-71.288330215, 41.671457779],
        [-71.288330215, 41.383995775],
      ],
      image: "/all_the_grids_rasterized_3000x5000hillshade_2.png",
    }),
    new BitmapLayer({
      id: FS_BATHY_LAYER_NAME,
      bounds: [
        [-71.457633569, 41.383995775],
        [-71.457633569, 41.671457779],
        [-71.288330215, 41.671457779],
        [-71.288330215, 41.383995775],
      ],
      image: "/all_the_grids_rasterized_3000x5000color_3.png",
      opacity: 0.7,
    }),
    new MVTLayer({
      id: NOAA_CSB_LAYER_NAME,
      data: "https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/csb_vector_tiles/VectorTileServer/tile/{z}/{y}/{x}",
      lineWidthUnits: "pixels",
      getLineWidth: 1,
      getLineColor: [10, 10, 10],
      pickable: false,
      opacity: 0.5,
    }),
  ];
};
