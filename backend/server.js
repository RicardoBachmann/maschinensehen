// 1. Importiere benötigte Bibliotheken
const fetch = require("node-fetch");
const express = require("express"); // Web-Server Framework
const cors = require("cors"); // Cross-Origin Resource Sharing Middleware
const dotenv = require("dotenv"); // Lädt Umgebungsvariablen aus .env-Datei

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

dotenv.config();

// 2. Lade Umgebungsvariablen
const app = express();

/*const corsOptions = {
  origin: ["http://localhost:5173", "https://maschinensehen.vercel.app"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};*/

console.log("API Key loaded:", process.env.N2YO_API_KEY ? "Yes" : "No");

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://maschinensehen.vercel.app",
    process.env.FRONTEND_URL, // Falls du eine andere Domain verwendest
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

// 4. Middleware - Hilfsfunktionen für jede Anfrage
app.use(cors(corsOptions)); // Erlaubt Anfragen von anderen Domains
app.use(express.json()); // Kann JSON-Daten verarbeiten

// Root-Route:
app.get("/", (req, res) => {
  res.json({
    message: "Maschinensehen API is running",
    routes: {
      test: "/test",
      satellite: "/api/satellite/position/:lon/:lat/:alt/:num/:id",
    },
  });
});

// Test-Route:
app.get("/test", (req, res) => {
  res.json({
    message: "Test route works!",
    envVars: {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.N2YO_API_KEY,
    },
  });
});

// 5. Route für Satelliten-Position
app.get("/api/satellite/position/:lon/:lat/:alt/:num/:id", async (req, res) => {
  const { lon, lat, alt, num, id } = req.params;

  try {
    const apiUrl = `https://api.n2yo.com/rest/v1/satellite/positions/${id}/${lat}/${lon}/${alt}/${num}/?apiKey=${process.env.N2YO_API_KEY}`;
    console.log(
      "Fetching from:",
      apiUrl.replace(process.env.N2YO_API_KEY, "HIDDEN_KEY")
    );
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to fetch satellite data",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal Server Error",
    });
  }
});

// 6. Export für Vercel
module.exports = app;

// 7. Starte den Server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
}
