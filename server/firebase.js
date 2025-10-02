// backend/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID || undefined;

/**
 * Priority:
 * 1) FIREBASE_SERVICE_ACCOUNT  (full JSON string in env)
 * 2) FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
 * 3) applicationDefault() (ADC) - useful when running on GCP or when GOOGLE_APPLICATION_CREDENTIALS is set
 */
let credential = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Case 1: full service account JSON stored in env as a string
  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // If user provided PRIVATE_KEY separately (sa might lack it or it may be escaped)
    if (process.env.FIREBASE_PRIVATE_KEY) {
      sa.private_key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    } else if (sa.private_key && sa.private_key.includes("\\n")) {
      // Convert escaped newlines if the JSON contains them
      sa.private_key = sa.private_key.replace(/\\n/g, "\n");
    }

    credential = admin.credential.cert(sa);
    console.log("Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT (env).");
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:", err);
  }
} else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  // Case 2: minimal service account fields passed separately via env
  const sa = {
    projectId,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace escaped newlines with real newlines
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };

  credential = admin.credential.cert(sa);
  console.log(
    "Firebase Admin initialized from FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (env)."
  );
} else {
  // Case 3: fallback to Application Default Credentials (ADC)
  // This will work if deployed on GCP or if GOOGLE_APPLICATION_CREDENTIALS points to a JSON key file.
  try {
    credential = admin.credential.applicationDefault();
    console.log(
      "Firebase Admin using application default credentials (ADC). Ensure ADC or GOOGLE_APPLICATION_CREDENTIALS is set if not on GCP."
    );
  } catch (err) {
    console.warn(
      "Could not obtain application default credentials. Admin SDK may fail without a service account. Error:",
      err
    );
    credential = null;
  }
}

// Initialize app (only once)
if (!admin.apps.length) {
  if (credential) {
    admin.initializeApp({
      credential,
      projectId,
    });
  } else {
    // Last-ditch initialize: attempt to initialize with projectId only.
    // This may work in some environments that provide default credentials automatically.
    admin.initializeApp({
      projectId,
    });
    console.warn(
      "Firebase Admin initialized without an explicit credential. This may fail for privileged admin operations."
    );
  }
}

// Export Firebase services
const auth = admin.auth();
const db = admin.firestore();

export { admin, auth, db };
