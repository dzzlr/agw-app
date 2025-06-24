const express = require("express");
const cors = require("cors");
const multer = require("multer"); // Import multer
const path = require("path"); // Import the path module

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { initDBConnection } = require("./config/db");
// const { initFindingsTable } = require("./db/findingsDb");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const configRoutes = require("./routes/configRoutes");
const findingsRoutes = require("./routes/findingsRoutes");

const service = express();
service.use(express.json());
service.use(cors());

// Define the directories where files will be stored
const uploadDirectories = {
  compliance_checklist: path.join(__dirname, "files", "compliance_checklist"),
  procedure_checklist: path.join(__dirname, "files", "procedure_checklist"),
  rollback_checklist: path.join(__dirname, "files", "rollback_checklist"),
  architecture_diagram: path.join(__dirname, "files", "architecture_diagram"),
  captures: path.join(__dirname, "files", "captures"),
  completion_report: path.join(__dirname, "files", "completion_report"),
};

// Ensure directories exist
const fs = require("fs");
for (const dir in uploadDirectories) {
  if (!fs.existsSync(uploadDirectories[dir])) {
    fs.mkdirSync(uploadDirectories[dir], { recursive: true });
  }
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the correct directory based on the field name
    const fieldname = file.fieldname;
    const uploadDir = uploadDirectories[fieldname];
    if (uploadDir) {
      cb(null, uploadDir);
    } else {
      cb(new Error(`Invalid fieldname: ${fieldname}`), false); // Reject if fieldname is invalid
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

// Create the multer upload instance
const upload = multer({ storage: storage });

// Initialize database connection
initDBConnection();
// initFindingsTable().catch(err => console.error('Failed to initialize findings table:', err));

// Use routes
service.use("/api/users", userRoutes);
service.use("/api/auth", authRoutes);
service.use("/api/config", configRoutes);
service.use("/api/findings", findingsRoutes);
// Pass the upload instance to requestRoutes
service.use("/api/requests", requestRoutes(upload));

// Serve static files from the "files" directory
service.use("/files", express.static(path.join(__dirname, "files")));

// Modified endpoint to force download
service.get("/files/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(__dirname, "files", folder, filename);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // Set the Content-Disposition header to force download
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // Send the file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

const port = process.env.BACKEND_PORT || 8080;
service.listen(port, () => {
  console.log(`IAG Workspace is running on http://localhost:${port}`);
});
