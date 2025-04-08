import React, { useEffect } from "react";

const GridComponent = () => {
  useEffect(() => {
    console.log("GridComponent: Component has been loaded");
  }, []);

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
      Grid Component Loaded
    </div>
  );
};

export default GridComponent;
