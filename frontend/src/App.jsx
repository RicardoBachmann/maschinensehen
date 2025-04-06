import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [userLocation, setUserLocation] = useState(null);

  // API URL Configuration
  const API_URL = import.meta.env.DEV ? "http://localhost:3000" : "/api"; // Relative URL

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

  const fetchSatellitesAbove = async (latitude, longitude) => {
    try {
      // Detaillierte Logging-Informationen
      console.log("Fetching satellite data above users location...");
      console.log("User coordinates:", latitude, longitude);

      // Set altitude to 0 metres (sea level)
      // Category 0 means all satellites
      const requestUrl = `${API_URL}/satellite/above/${latitude}/${longitude}/0/70/0`;
      console.log("RequestURL:", requestUrl);

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
      console.log("Satellites Above Data:", data);

      // Output of the number of satellites found
      if (data.info) {
        console.log(`Satellites found: ${data.info.satcount}`);
      }

      // Detailed output of each satellite
      if (data.above) {
        data.above.forEach((satellite, index) => {
          console.log(`Satellit ${index + 1}:`);
          console.log(`Name: ${satellite.satname}`);
          console.log(`ID: ${satellite.satid}`);
          console.log(
            `Position: ${satellite.satlatitude}, ${satellite.satlongitude}`
          );
          console.log(`Höhe: ${satellite.sataltitude} km`);
          console.log("----------------------------");
        });
      }

      // Optional: Verarbeiten Sie die Satellitendaten hier
      return data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Satellitendaten:", error);
      throw error;
    }
  };

  // Users position
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

  return (
    <>
      <button onClick={getUserLocation}>Get User Location</button>
      {userLocation && (
        <div>
          <p>User location is: </p>
          <p>Latitude:{userLocation.latitude.toFixed(5)}</p>
          <p>Longitude:{userLocation.longitude.toFixed(5)}</p>
        </div>
      )}
      <div id="map-container" ref={mapContainerRef}></div>
    </>
  );
}

export default App;
