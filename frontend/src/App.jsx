import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

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
      console.log(
        "Fetching from:",
        `${API_URL}/api/satellite/position/10/50/100/1/25544`
      );
      const response = await fetch(
        `${API_URL}/api/satellite/position/10/50/100/1/25544`
      );
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Satellite-Data:", data);
    } catch (error) {
      console.error("Error retrieving satellite data:", error);
    }
  };

  // Retrieve initial satellite data
  useEffect(() => {
    fetchSatelliteData();
  }, []);

  return (
    <>
      <div id="map-container" ref={mapContainerRef}></div>
    </>
  );
}

export default App;
