// backend/scripts/setupSecretaryWithRooms.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import readline from 'readline';
import { stat } from 'fs';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK using environment variables
let serviceAccount = {};

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    if (process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount.private_key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
    }
  } else {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not found in .env file");
  }
} catch (err) {
  console.error("Error parsing Firebase service account:", err.message);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

// Create rooms function
async function createRooms() {
  console.log("\n=== Creating Rooms with Admin SDK ===");
  
  const totalRooms = await askQuestion("Enter total number of rooms to create: ");
  const numRooms = 100 + parseInt(totalRooms);
  
  if (isNaN(numRooms) || numRooms <= 0) {
    console.log("Invalid number of rooms.");
    return false;
  }

  console.log(`Creating ${numRooms - 100} rooms...`);

  for (let i = 101; i <= numRooms; i++) {
    try {
      await db.collection('rooms').doc(i.toString()).set({
        roomNumber: (i).toString(),
        owner: null,
        ownerName: null,
        ownerEmail: null,
        ownerContact: null,
        isActive: null,
        isOwner: null,
        rent: null,
        renterName: null,
        renterUid: null,
        status: "unactive",
        renterContact: null,
        familyMembers: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Room No. ${i} created`);
    } catch (error) {
      console.error(`Error creating room no. ${i}:`, error.message);
    }
  }
  
  console.log(`Successfully created ${numRooms - 100} rooms!`);
  return true;
}

// Create secretary function
async function createSecretary() {
  console.log("\n=== Creating Secretary Account ===");
  
  const createSec = await askQuestion("Do you want to create a secretary account? (yes/no): ");
  
  if (createSec.toLowerCase() !== 'yes') {
    console.log("Skipped secretary creation.");
    return true;
  }

  const name = await askQuestion("Secretary Name: ");
  const email = await askQuestion("Secretary Email: ");
  const password = await askQuestion("Secretary Password (min 6 chars): ");
  const contact = await askQuestion("Secretary Contact Number: ");

  if (!name || !email || !password || !contact) {
    console.log("All fields are required!");
    return false;
  }

  if (password.length < 6) {
    console.log("Password must be at least 6 characters!");
    return false;
  }

  try {
    // Create authentication account using Admin SDK
    const userRecord = await auth.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      displayName: name.trim()
    });
    
    console.log("Secretary authentication created successfully!");

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      contactNo: contact.trim(),
      role: "secretary",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });

    console.log(`Secretary '${name}' profile created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("Please save these credentials securely!");
    
    return true;
  } catch (error) {
    console.error("Error creating secretary:", error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log("Building Management System Setup");
  console.log("===================================\n");

  try {
    // Check if Firebase is properly initialized
    console.log("Firebase Admin SDK initialized successfully");
    
    // Step 1: Create rooms
    const roomsCreated = await createRooms();
    
    if (!roomsCreated) {
      console.log("Room creation failed. Exiting.");
      process.exit(1);
    }

    // Step 2: Create secretary
    const secretaryCreated = await createSecretary();
    
    if (!secretaryCreated) {
      console.log("Secretary creation failed.");
    }

    console.log("\n✨ Setup completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Deploy Firestore security rules from your artifacts");
    console.log("2. Test registration with room numbers 1-" + "created rooms");
    console.log("3. Test secretary login with the credentials above");
    
  } catch (error) {
    console.error("Setup failed:", error);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the setup
main();