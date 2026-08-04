require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { verifyConnectivity } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/startups", require("./routes/startups"));
app.use("/api/investors", require("./routes/investors"));
app.use("/api/founders", require("./routes/founders"));
app.use("/api/queries", require("./routes/queries"));
app.use("/api/network", require("./routes/network"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (err.code === "ServiceUnavailable" || err.message?.includes("database")) {
    return res.status(503).json({
      error: "Database unavailable",
      message:
        "The graph database is temporarily unavailable. Please try again later.",
    });
  }
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const startServer = async () => {
  await verifyConnectivity();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
