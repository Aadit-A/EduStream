
const dns = require("dns");
// Force Node to use Google Public DNS for SRV resolution
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const path = require("path");
const dotenv = require("dotenv");

// Load .env relative to server root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = parseInt(process.env.PORT, 10) || 3001;
const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || "development";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Defensive check: warn developer early if MONGO_URI is missing
if (!MONGO_URI) {
  console.warn("[WARN] MONGO_URI is not set in server/.env. Please provide a valid MongoDB connection string.");
}

module.exports = {
  PORT,
  MONGO_URI,
  NODE_ENV,
  CLIENT_ORIGIN,
};