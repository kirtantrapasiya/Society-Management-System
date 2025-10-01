import express from "express";
import cors from "cors";
import multer from "multer";
import ImageKit from "imagekit";
import dotenv from "dotenv";
import admin from 'firebase-admin';
import fs from 'fs';

// Load environment variables FIRST
dotenv.config();

if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.");
}

if (!process.env.FIREBASE_API_KEY) {
  console.warn("FIREBASE_API_KEY not set. Password verification will not work.");
}

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

console.log('Firebase Admin initialized successfully');

import renterRoutes from "./routes/renterRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

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

// Protected Upload Route
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

app.get("/health", (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    firebase: admin.apps.length > 0 ? 'Connected' : 'Not Connected',
    port: port,
    cors: 'Enabled'
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: 'Residence Management System API',
    version: '1.0.0',
    port: port,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      createRenter: 'POST /api/renters/create',
      deleteRenter: 'DELETE /api/renters/:renterId',
      uploadImage: 'POST /api/upload'
    }
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
try {
  app.listen(port, () => {
    console.log(`
    Residence Management System - Backend         
    Server running on port ${port}                
    URL: http://localhost:${port}                 
    CORS: Enabled for http://localhost:3000       
    `);
  }).on("error", (err) => {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  });
} catch (err) {
  console.error("Unexpected server error:", err.message);
  process.exit(1);
}

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server gracefully...');
  process.exit(0);
});

export default app;
