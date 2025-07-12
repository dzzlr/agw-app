require('dotenv').config();
const express = require("express");
const cors = require("cors");

const { initDBConnection } = require("./services/postgres");

const authRoutes = require("./routes/authRoutes");

const service = express();
service.use(express.json());
service.use(cors());

// Initialize database connection
initDBConnection();

// Use routes
service.use("/api/auth", authRoutes);

const port = process.env.BACKEND_PORT || 8080;
service.listen(port, () => {
    console.log(`User Service is running on http://localhost:${port}`);
});