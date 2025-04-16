import { useEffect, useState } from "react";
import proj4 from "proj4";
import setupUTMProjection from "./setupUTMProjection";

const UTMGridComponent = ({ map }) => {
  const [latLines, setLatLines] = useState(100);
  const [lngLines, setLngLines] = useState(100);

  useEffect(() => {
    console.log("UTMGridComponent geladen", map);
  }, [map]);

  return null;

  // 1. Get Map-bounds
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNothEast();

  // UTM-Zone for the map center
  const center = map.getCenter();
  const { zone, hemisphere } = setupUTMProjection(center.lng, center.lat);

  // UTM-Projection for the current zone
  const utmProjection = `+proj=utm +zone=${zone} ${
    hemisphere === "S" ? "+south" : ""
  }`;

  // Convert corner points to UTM
  const swUTM = proj4(proj4.defs("WGS84"), utmProjection, [sw.lng, sw.lat]);
  const neUTM = proj4(proj4.defs("WGS84"), utmProjection, [ne.lng, ne.lat]);

  console.log("SW in UTM:", swUTM);
  console.log("NEin UTM:", neUTM);
};

export default UTMGridComponent;
