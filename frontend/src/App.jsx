import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import setupUTMProjection, {
  getUTMZone,
} from "../components/setupUTMProjection";
import UTMGridComponent from "../components/UTMGridComponent";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [satellitesAbove, setSatellitesAbove] = useState(null);
  const [satelliteRadius, setSatelliteRadius] = useState(70);

  // API URL Configuration
  const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "/api/"; // Relative URL

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [-74.5, 49],
      zoom: 4,
    }).on("load", () => {
      console.log("App: Map load-Event triggered");
      setMapLoaded(true);
    });

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const fetchSatellitesAbove = async (latitude, longitude, alt = 0) => {
    try {
      // Default values if the user location not yes available
      const userLatitude = latitude || 0;
      const userLongitude = longitude || 0;
      const searchradius = satelliteRadius; // Value between 0-90 degrees
      const categoryId = 0; // 0 for all satellites

      console.log("Fetching satellites above Location:", {
        userLatitude,
        userLongitude,
        alt,
      });

      const requestUrl = `${API_URL}/satellite/above/${userLatitude}/${userLongitude}/${alt}/${searchradius}/${categoryId}`;
      console.log("Full API-URL:", requestUrl);

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Zusätzliche Debugging-Informationen
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Satellites above user:", data);

      const satellitesGeoJSON = {
        type: "FeatureCollection",
        features: data.above.map((satellite) => {
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [satellite.satlng, satellite.satlat],
            },
            properties: {
              satname: satellite.satname,
              satid: satellite.satid,
              satalt: satellite.satalt,
            },
          };
        }),
      };

      if (mapRef.current && mapRef.current.loaded()) {
        //checks if Source/layer exist
        if (mapRef.current.getSource("satellites-source")) {
          // Entferne zuerst den Text-Layer
          mapRef.current.removeLayer("satellites-text-layer");
          // Dann den Haupt-Layer
          mapRef.current.removeLayer("satellites-layer");
          // Erst dann die Quelle
          mapRef.current.removeSource("satellites-source");
        }
        mapRef.current.addSource("satellites-source", {
          type: "geojson",
          data: satellitesGeoJSON,
        });
        // Add layer
        mapRef.current.addLayer({
          id: "satellites-layer",
          type: "circle",
          source: "satellites-source",
          paint: {
            "circle-radius": 6,
            "circle-color": "#ff0000",
            "circle-opacity": 0.8,
          },
        });
      }
      // Füge den Textlayer für die Namen hinzu
      mapRef.current.addLayer({
        id: "satellites-text-layer",
        type: "symbol",
        source: "satellites-source",
        layout: {
          "text-field": ["get", "satname"],
          "text-font": ["Open Sans Regular"],
          "text-size": 12,
          "text-offset": [0, 1], // Text wird unterhalb des Punktes angezeigt
          "text-anchor": "top",
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1,
        },
      });

      // Add UTM-Grid
      mapRef.current.addLayer({});

      // Output of the number of satellites found
      if (data.info) {
        console.log(`Satellites found: ${data.info.satcount}`);
        setSatellitesAbove(data.info.satcount);
      }

      // Detailed output of each satellite
      if (data.info && data.above) {
        console.log(
          `Found: ${data.info.satcount} satellites above your location`
        );
        // Log each satellite's basic information
        data.above.forEach((satellite, index) => {
          console.log(
            `Satellite ${index + 1}: ${satellite.satname} (ID: ${
              satellite.satid
            })`
          );
          console.log(
            `  Position: Lat ${satellite.satlat}, Lng ${satellite.satlng}, Alt ${satellite.satalt}km`
          );
          console.log("----------------------------");
        });
      }

      // Optional: Verarbeiten Sie die Satellitendaten hier
      return data;
    } catch (error) {
      console.error("Error fetching satellite data:", error);
      throw error;
    }
  };

  // Users location
  const getUserLocation = () => {
    // checks if geolocation is supported by the browser
    if (navigator.geolocation) {
      // get the current users location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // save geolocation coordinates in two variables
          const { latitude, longitude } = position.coords;
          console.log("Users location:", position);
          // update the value of userlocation variable
          setUserLocation({ latitude, longitude });
          setupUTMProjection(longitude, latitude);
        },
        (error) => {
          console.error("Error getting users location", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
    }
  };
  useEffect(() => {
    if (userLocation) {
      fetchSatellitesAbove(userLocation.latitude, userLocation.longitude);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 10,
        essential: true,
      });
    }
  }, [userLocation]);

  return (
    <>
      {mapLoaded && <UTMGridComponent map={mapRef.current} />}
      <button onClick={getUserLocation}>Get User Location</button>
      {userLocation && (
        <div>
          <p>User location is: </p>
          <p>Latitude:{userLocation.latitude.toFixed(5)}</p>
          <p>Longitude:{userLocation.longitude.toFixed(5)}</p>
          <p>
            Users UTM Zone:{getUTMZone(userLocation.longitude)}
            {userLocation.latitude >= 0 ? "N" : "S"}
          </p>
          <label>Search radius:{satelliteRadius}°</label>
          <input
            type="range"
            min={0}
            max={90}
            value={satelliteRadius}
            onChange={(e) => {
              setSatelliteRadius(e.target.valueAsNumber);
            }}
          ></input>

          <p>Satelittes above you:{satellitesAbove || "Loading..."}</p>
        </div>
      )}
      <div id="map-container" ref={mapContainerRef}></div>
    </>
  );
}
export default App;
