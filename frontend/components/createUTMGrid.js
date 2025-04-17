import proj4 from "proj4";

/**
 * Erstellt ein UTM-Gitter basierend auf UTM-Koordinaten
 * @param {Array} swUTM - Südwestliche Ecke in UTM [easting, northing]
 * @param {Array} neUTM - Nordöstliche Ecke in UTM [easting, northing]
 * @param {String} utmProjection - proj4-Projektionsstring für die aktuelle UTM-Zone
 * @param {Number} gridStep - Abstand zwischen Gitterlinien in Metern (Standard: 100000m = 100km)
 * @returns {Object} GeoJSON FeatureCollection mit Gitterlinien
 */

const createUTMGrid = (swUTM, neUTM, utmProjection, gridStep = 100000) => {
  const features = [];

  // Round to next grid value down/up
  const startX = Math.floor(swUTM[0] / gridStep) * gridStep;
  const startY = Math.floor(swUTM[1] / gridStep) * gridStep;
  const endX = Math.ceil(neUTM[0] / gridStep) * gridStep;
  const endY = Math.ceil(neUTM[1] / gridStep) * gridStep;

  console.log("Grid Area(UTM)", { startX, startY, endX, endY });

  // vertical lines(north-south)
  for (let x = startX; x <= endX; x += gridStep) {
    const line = [];

    // More points
    for (let y = startY; y <= endY; y += gridStep / 10) {
      const wgs84Point = proj4(utmProjection, proj4.defs("WGS84"), [x, y]);
      line.push(wgs84Point);
    }
    features.push({
      type: "Feature",
      properties: {
        type: "gridline",
        direction: "vertical",
        value: x,
      },
      geometry: {
        type: "LineString",
        coordinates: line,
      },
    });
  }
  // horizontal lines
  for (let y = startY; y <= endY; y += gridStep) {
    const line = [];

    // Mehrere Punkte für glattere Linien
    for (let x = startX; x <= endX; x += gridStep / 10) {
      const wgs84Point = proj4(utmProjection, proj4.defs("WGS84"), [x, y]);
      line.push(wgs84Point);
    }

    features.push({
      type: "Feature",
      properties: {
        type: "gridline",
        direction: "horizontal",
        value: y,
      },
      geometry: {
        type: "LineString",
        coordinates: line,
      },
    });
  }
  // create geoJSON FeatureCollection
  return {
    type: "FeatureCollection",
    features: features,
  };
};

export default createUTMGrid;
