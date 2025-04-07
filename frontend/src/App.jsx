import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import GridOverlay from "../components/BasicGridOverlay";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [userLocation, setUserLocation] = useState(null);
  const [satallitesAbove, setSatallitesAbove] = useState(null);

  // API URL Configuration
  const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "/api/"; // Relative URL

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.5, 40],
      zoom: 8,
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
      const searchradius = 70; // Value between 0-90 degrees
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

      // Output of the number of satellites found
      if (data.info) {
        console.log(`Satellites found: ${data.info.satcount}`);
        setSatallitesAbove(data.info.satcount);
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
      <GridOverlay />
      <button onClick={getUserLocation}>Get User Location</button>
      {userLocation && (
        <div>
          <p>User location is: </p>
          <p>Latitude:{userLocation.latitude.toFixed(5)}</p>
          <p>Longitude:{userLocation.longitude.toFixed(5)}</p>
          <p>Satelittes above you:{satallitesAbove || "Loading..."}</p>
        </div>
      )}
      <div id="map-container" ref={mapContainerRef}></div>
    </>
  );
}

export default App;
