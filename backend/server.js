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
  origin: ["http://localhost:5173", "https://maschinensehen-r3mu.vercel.app"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
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
    message: "Maschinensehen API ist online",
    routes: [
      "/satellite/position/:lon/:lat/:alt/:num/:id",
      "/satellite/above/:lat/:lon/:alt/:radius/:category",
    ],
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

// Satellite "above" endpoint: Retrieves satellites above a location from N2YO API
app.get(
  "/satellite/above/:lat/:lon/:alt/:radius/:category",
  async (req, res) => {
    const { lat, lon, alt, radius, category } = req.params;

    console.log("Received parameters for ‘above’:", {
      lat,
      lon,
      alt,
      radius,
      category,
    });

    try {
      const apiUrl = `https://api.n2yo.com/rest/v1/satellite/above/${lat}/${lon}/${alt}/${radius}/${category}/?apiKey=${process.env.N2YO_API_KEY}`;
      console.log(
        "Request to N2YO-API:",
        apiUrl.replace(process.env.N2YO_API_KEY, "HIDDEN")
      );

      const response = await fetch(apiUrl);

      console.log("N2YO-API Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("N2YO-API Error response:", errorText);
        return res.status(response.status).json({
          error: "Error retrieving satellite data",
          details: errorText,
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Backend error:", error);
      res.status(500).json({
        error: "Error retrieving satellite data",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// ---- Server Export & Start ----
module.exports = app;

if (process.env.NODE_ENV !== "production") {
  console.log("API Key loaded:", process.env.N2YO_API_KEY ? "Yes" : "No");
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
}
