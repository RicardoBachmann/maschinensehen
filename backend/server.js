// 1. Importiere benötigte Bibliotheken
const express = require("express"); // Web-Server Framework
const cors = require("cors"); // Cross-Origin Resource Sharing Middleware
const dotenv = require("dotenv"); // Lädt Umgebungsvariablen aus .env-Datei

// 2. Lade Umgebungsvariablen
dotenv.config();

// 3. Erstelle eine Express-Anwendung
const app = express();

// 4. Setze den Port - entweder aus Umgebungsvariable oder Standard 3000

// 5. Middleware - Hilfsfunktionen für jede Anfrage
app.use(cors()); // Erlaubt Anfragen von anderen Domains
app.use(express.json()); // Kann JSON-Daten verarbeiten

// 6. Erste Testroute - zeigt, dass der Server läuft
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend ist online!" });
});

module.exports = app;

// 7. Starte den Server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
}
