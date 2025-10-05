import express from "express";
import cors from "cors";
import multer from "multer";
import ImageKit from "imagekit";
import dotenv from "dotenv";
import admin from "firebase-admin";

// Load env variables
dotenv.config();

// Firebase Admin initialization via ENV variables
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("Firebase environment variables are missing. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
}

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // handle line breaks
    }),
  });
}

console.log("Firebase Admin initialized successfully");

// Imports
import renterRoutes from "./routes/renterRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Multer setup
const upload = multer({ storage: multer.memoryStorage() });

// ImageKit setup
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/renters", renterRoutes);

// File upload
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/uploads",
    });

    return res.json({ url: uploadResponse.url });
  } catch (err) {
    console.error("Upload error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    firebase: admin.apps.length > 0 ? "Connected" : "Not Connected",
    port: port,
    cors: "Enabled"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Residence Management System API",
    version: "1.0.0",
    port: port,
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      users: "/api/users",
      createRenter: "POST /api/renters/create",
      deleteRenter: "DELETE /api/renters/:renterId",
      uploadImage: "POST /api/upload"
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Start server
try {
  app.listen(port, () => {
    console.log(`
    Residence Management System - Backend         
    Server running on port ${port}                
    URL: http://localhost:${port}                 
    Firebase: Connected
    `);
  }).on("error", (err) => {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  });
} catch (err) {
  console.error("Unexpected server error:", err.message);
  process.exit(1);
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server gracefully...");
  process.exit(0);
});

export default app;
