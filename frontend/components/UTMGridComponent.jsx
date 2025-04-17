import { useEffect, useState } from "react";
import proj4 from "proj4";
import setupUTMProjection from "./setupUTMProjection";

const UTMGridComponent = ({ map }) => {
  const [latLines, setLatLines] = useState(100);
  const [lngLines, setLngLines] = useState(100);
  console.log("UTMGridComponent wird gerendert");
  useEffect(() => {
    console.log("UTMGridComponent useEffect ausgeführt");
    if (!map || !map.loaded()) {
      console.log("Map not loaded");
      console.log("Map ist null oder undefined");
      return;
    }
    console.log("UTMGridComponent geladen", map);
    console.log("Map-Objekt ist vorhanden:", map);

    try {
      // 1. Get Map-bounds
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const loaded = map.loaded();
      console.log("Map loaded Status:", loaded);

      if (!loaded) {
        console.log("Map ist noch nicht geladen");
        return;
      }
      console.log("Maps ist geladen und versucht bonds zu bekommen");

      // UTM-Zone for the map center
      const center = map.getCenter();
      const { zone, hemisphere } = setupUTMProjection(center.lng, center.lat);
      console.log("Map Center:", center);

      // UTM-Projection for the current zone
      const utmProjection = `+proj=utm +zone=${zone} ${
        hemisphere === "S" ? "+south" : ""
      } +datum=WGS84 +units=m +no_defs`;

      // Convert corner points to UTM
      const swUTM = proj4(proj4.defs("WGS84"), utmProjection, [sw.lng, sw.lat]);
      const neUTM = proj4(proj4.defs("WGS84"), utmProjection, [ne.lng, ne.lat]);

      console.log("SW in UTM:", swUTM);
      console.log("NEin UTM:", neUTM);

      if (
        Array.isArray(swUTM) &&
        swUTM.length === 2 &&
        Array.isArray(neUTM) &&
        neUTM.length === 2
      ) {
        console.log("UTM conversion works:", {
          swUTM: { easting: swUTM[0], northing: swUTM[1] },
          neUTM: { easting: neUTM[0], northing: neUTM[1] },
        });
      } else {
        // 5. error handling for invalid coordinate formats
        console.error("Converting error: UTM coordinates not generated");
      }
    } catch (error) {
      // 6. general error handling for errors during conversion
      console.error("Error in UTM conversion:", error);
      console.error("Fehler bei Map-Zugriff", error);
    }
  }, [map]);

  return null;
};
export default UTMGridComponent;
