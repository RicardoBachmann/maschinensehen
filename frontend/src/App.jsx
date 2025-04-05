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

  const fetchSatelliteData = async () => {
    try {
      // Detaillierte Logging-Informationen
      console.log("Fetching satellite data...");
      console.log(
        "Full API URL:",
        `${API_URL}/satellite/position/10/50/100/1/25544`
      );

      const response = await fetch(
        `${API_URL}/satellite/position/10/50/100/1/25544`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Zusätzliche Debugging-Informationen
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Satellite Data:", data);

      // Optional: Verarbeiten Sie die Satellitendaten hier
      return data;
    } catch (error) {
      console.error("Fehler beim Abrufen der Satellitendaten:", error);
      throw error;
    }
  };

  // Retrieve initial satellite data
  useEffect(() => {
    fetchSatelliteData();
  }, []);

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
    getUserLocation();
  }, []);

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
