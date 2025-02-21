import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.5, 40],
      zoom: 9,
    });
    return () => {
      mapRef.current.remove();
    };
  }, []);

  const API_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://maschinensehen.vercel.app/";

  const fetchSatelliteData = async () => {
    try {
      const lon = 10;
      const lat = 50;
      const alt = 100;
      const num = 1;
      const id = 25544;

      const response = await fetch(
        `${API_URL}/api/satellite/position/${lon}/${lat}/${alt}/${num}/${id}`
      );
      if (!response.ok) {
        throw new Error("Network response failed");
      }
      const data = await response.json();
      console.log("Satellite-Data:", data);
    } catch (error) {
      console.error("Error retrieving satellite data:", error);
    }
  };

  return (
    <>
      <div id="map-container" ref={mapContainerRef}></div>
    </>
  );
}

export default App;
