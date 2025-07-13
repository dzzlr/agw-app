const express = require("express");
const cors = require("cors");
const path = require("path"); // Import the path module

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { initDBConnection } = require("./config/db");

const findingsRoutes = require("./routes/findingsRoutes");
const auditsRoutes = require("./routes/auditsRoutes");

const service = express();
service.use(express.json());
service.use(cors());

// Initialize database connection
initDBConnection();
// initFindingsTable().catch(err => console.error('Failed to initialize findings table:', err));

// Use routes
service.use("/api/findings", findingsRoutes);
service.use("/api/audits", auditsRoutes);

const port = process.env.BACKEND_PORT || 8080;
service.listen(port, () => {
  console.log(`IAG Workspace is running on http://localhost:${port}`);
});
