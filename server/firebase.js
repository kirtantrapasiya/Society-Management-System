// backend/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Your Firebase project config
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID
};


let serviceAccount = {};

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If no service account in env, use project ID only for simple setup
    console.log("Using project ID for Firebase initialization");
  } else {
    // Parse JSON from .env if available
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    // Replace \n in private key
    if (process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount.private_key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    }
  }
} catch (err) {
  console.log("Service account not configured, using basic setup");
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (serviceAccount.private_key) {
    // Full service account initialization
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  } else {
    // Basic initialization with project ID
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
      // Note: This requires GOOGLE_APPLICATION_CREDENTIALS environment variable
      // or running on Google Cloud with default credentials
    });
  }
}

// Export Firebase services
const auth = admin.auth();
const db = admin.firestore();

export { admin, auth, db };