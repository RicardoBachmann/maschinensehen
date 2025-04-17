import proj4 from "proj4";

export const getUTMZone = (longitude) => {
  return Math.floor((longitude + 180) / 6) + 1;
};

const setupUTMProjection = (longitude, latitude) => {
  const zone = getUTMZone(longitude);
  const hemisphere = latitude >= 0 ? "N" : "S";

  //Log to get the users Zone
  console.log(`UTM Zone: ${zone} ${hemisphere}`);

  //Define the UTM-Projection für the user Zone
  proj4.defs(
    `EPSG:326${zone}`,
    `+proj=utm +zone=${zone} ${
      hemisphere === "S" ? "+south" : ""
    } +datum=WGS84 +units=m +no_defs`
  );
  return { zone, hemisphere };
};

export default setupUTMProjection;
