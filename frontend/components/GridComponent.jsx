import React, { useEffect, useState } from "react";

const GridComponent = ({ map }) => {
  const [status, setStatus] = useState("initializing");

  useEffect(() => {
    console.log("GridComponent: Component has been loaded");
    console.log("GridComponent: Receive map prop", map);

    if (map) {
      setStatus("map received");
    } else {
      setStatus("no map received");
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
