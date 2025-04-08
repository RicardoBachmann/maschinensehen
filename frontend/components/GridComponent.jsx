import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

const GridComponent = ({ map }) => {
  const [status, setStatus] = useState("initializing");

  // Function to create grid-geoJSON
  const createGridGeoJSON = () => {
    console.log("GridComponent: Erstelle Grid GeoJSON");

    // Current map-bounds
    const bounds = map.getBounds();
    console.log("GridComponent: Map-Bounds:", bounds);

    // Extension of the bounds for the grid
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Calculate the size for each grid cell (10x10 grid)
    const lngDelta = (ne.lng - sw.lng) / 10;
    const latDelta = (ne.lat - sw.lat) / 10;

    console.log("Grid Component: Grid-Size:", { lngDelta, latDelta });

    // Create features for GeoJSON
    const features = [];

    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const lat = sw.lat + i * latDelta;
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [sw.lng, lat],
            [ne.lng, lat],
          ],
        },
      });
    }

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const lng = sw.lng + i * lngDelta;
      features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [lng, sw.lat],
            [lng, ne.lat],
          ],
        },
      });
    }
    console.log("GridComponent: Number of grid lines:", features.length);

    return {
      type: "FeatureCollection",
      features: features,
    };
  };

  //  Function for adding the grid to the map
  const addGridToMap = () => {
    console.log("GridComponent: Add Grid to the map");

    try {
      // Check whether the grid already exists and remove it if necessary
      if (map.getSource("grid-source")) {
        map.removeLayer("grid-layer");
        map.removeSource("grid-source");
        console.log("GridComponent: Existing grid removed");
      }

      // Create Grid-GeoJSON
      const gridData = createGridGeoJSON();

      // Add Grid as source
      map.addSource("grid-source", {
        type: "geojson",
        data: gridData,
      });

      // Add Grid-Layer
      map.addLayer({
        id: "grid-layer",
        type: "line",
        source: "grid-source",
        layout: {},
        paint: {
          "line-color": "#ffffff",
          "line-opacity": 0.6,
          "line-width": 1,
        },
      });

      console.log("GridComponent: Grid successfully added");
      setStatus("grid added");
    } catch (error) {
      console.error("GridComponent: Error adding the grid:", error);
      setStatus("grid error:" + error.message);
    }
  };

  useEffect(() => {
    console.log("GridComponent: Component has been loaded");
    console.log("GridComponent: Receive map prop", map);

    if (!map) {
      setStatus("no map received");
      return;
    }
    setStatus("map recevied");

    if (!map.loaded()) {
      console.log("GridComponent: Wait for map-load event");
      map.on("load", () => {
        console.log("GridComponent: Map load event triggered");
        addGridToMap();
      });
    } else {
      console.log("GridComponent: Map already loaded");
      addGridToMap();
    }

    // Refresh the grid when the map is moved
    map.on("moveend", () => {
      console.log("GridComponent: Map move event triggered");
      addGridToMap();
    });

    // Cleanup
    return () => {
      console.log("GridComponent: Cleanup");
      if (map && map.getLayer("grid-layer")) {
        map.removeLayer("grid-layer");
      }
      if (map && map.getSource("grid-source")) {
        map.removeSource("grid-source");
      }
    };
  }, [map]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50px",
        left: "10px",
        background: "white",
        padding: "5px",
        zIndex: 999,
      }}
    >
      Grid Status: {status}
    </div>
  );
};

export default GridComponent;
