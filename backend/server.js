// ---- Dependencies ----
const fetch = require("node-fetch"); // Perform HTTP requests and retrieve local resources
const express = require("express"); // Web application framework for Node.js
const cors = require("cors"); // Cross-Origin Resource Sharing Middleware
const dotenv = require("dotenv"); // Load environment variables from .env file

// ---- Error Handlers ----
// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection:");
  console.error("- Promise:", promise);
  console.error("- Reason:", reason);
});

// Catch uncaught exceptions to prevent server crash
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:");
  console.error("- Error:", error.message);
  console.error("- Stack", error.stack);
});

// ---- App Configuration ----
// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Configure CORS options
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

// ---- Middleware Configuration ----
// Configure CORS for cross-origin request
app.use(cors(corsOptions));

// Parse incoming JSON payloads
app.use(express.json());

// ---- Routes ----
// API endpoints for the application

// Root endpoint: Provides API information and available routes
app.get("/", (req, res) => {
  res.json({
    message: "Maschinensehen API is running",
    routes: {
      test: "/test",
      satellite: "/api/satellite/position/:lon/:lat/:alt/:num/:id",
    },
  });
});

// Test endpoint: Validates API functionality and environment variables
app.get("/test", (req, res) => {
  res.json({
    message: "Test route works!",
    envVars: {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.N2YO_API_KEY,
    },
  });
});

// Satellite position endpoint: Retrieves satellite position data from N2YO API
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

// ---- Server Export & Start ----
module.exports = app;

if (process.env.NODE_ENV !== "production") {
  console.log("API Key loaded:", process.env.N2YO_API_KEY ? "Yes" : "No");
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
}
