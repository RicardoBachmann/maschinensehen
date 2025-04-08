import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

const GridComponent = ({ map }) => {
  const [status, setStatus] = useState("initializing");

  useEffect(() => {
    console.log("GridComponent: Component has been loaded");
    console.log("GridComponent: Receive map prop", map);

    if (!map) {
      setStatus("no map received");
      return;
    }
    setStatus("map recevied");

    // Add test-marker
    try {
      console.log("GridComponent: Try to add marker");
      const center = map.getCenter();
      console.log("GridComponent: Center of the map", center);

      const marker = new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat(center)
        .addTo(map);

      console.log("GridComponent: Marker successfully added");
      setStatus(
        "marker added at" + center.lng.toFixed(4) + ", " + center.lat.toFixed(4)
      );
    } catch (error) {
      console.error("GridComponent: Error to add marker:", error);
      setStatus("marker error: " + error.message);
    }
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
