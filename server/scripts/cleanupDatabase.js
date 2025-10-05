// backend/scripts/cleanupDatabase.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import readline from 'readline';

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify question function
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// All possible UID field names to check
const UID_FIELDS = ['uid', 'owner', 'ownerUid', 'renterUid', 'visitorUid', 'userId', 'createdBy'];

// Extract all UIDs from a collection checking multiple field names
async function extractAllUIDsFromCollection(collectionPath) {
  const uids = new Set();
  const snapshot = await db.collection(collectionPath).get();
  
  let docCount = 0;
  snapshot.docs.forEach(doc => {
    docCount++;
    const data = doc.data();
    
    // Check all possible UID fields
    UID_FIELDS.forEach(field => {
      if (data[field]) {
        uids.add(data[field]);
      }
    });
    
    // Also check if document ID looks like a UID (28+ chars alphanumeric)
    if (doc.id.length >= 28 && /^[a-zA-Z0-9]+$/.test(doc.id)) {
      uids.add(doc.id);
    }
  });
  
  return {
    uids: Array.from(uids),
    docCount: docCount
  };
}

// Delete all documents in a collection
async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  query.get()
    .then((snapshot) => {
      if (snapshot.size === 0) {
        resolve();
        return;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        console.log(`      Deleted batch: ${snapshot.size} documents`);
        process.nextTick(() => {
          deleteQueryBatch(query, resolve, reject);
        });
      });
    })
    .catch(reject);
}

// Get all collections from Firestore
async function getAllCollections() {
  const collections = await db.listCollections();
  return collections.map(col => col.id);
}

// Delete authentication users
async function deleteAuthUsers(uids) {
  let successCount = 0;
  let errorCount = 0;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`DELETING FIREBASE AUTHENTICATION USERS`);
  console.log(`${'='.repeat(60)}\n`);
  console.log(`Total users to delete: ${uids.length}\n`);
  
  for (let i = 0; i < uids.length; i++) {
    const uid = uids[i];
    try {
      await auth.deleteUser(uid);
      successCount++;
      console.log(`[${i + 1}/${uids.length}] Deleted user: ${uid}`);
    } catch (error) {
      errorCount++;
      if (error.code === 'auth/user-not-found') {
        console.log(`[${i + 1}/${uids.length}] User not found (already deleted): ${uid}`);
      } else {
        console.log(`[${i + 1}/${uids.length}] Failed to delete ${uid}: ${error.message}`);
      }
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Successfully deleted: ${successCount} users`);
  if (errorCount > 0) {
    console.log(`Errors/Not found: ${errorCount} users`);
  }
  console.log(`${'─'.repeat(60)}\n`);
}

// Main cleanup script
async function main() {
  console.log('\n');
  console.log(`${'='.repeat(60)}`);
  console.log(`FIREBASE DATABASE & AUTHENTICATION CLEANUP TOOL`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\nWARNING: This will PERMANENTLY delete data!`);
  console.log(`Make sure you have backups if needed.\n`);

  const confirm = await question(`Type 'START' to begin: `);
  
  if (confirm.toUpperCase() !== 'START') {
    console.log(`\nCleanup cancelled.`);
    rl.close();
    process.exit(0);
  }

  try {
    // Fetch all collections
    console.log(`\n Fetching collections from Firestore...`);
    const collections = await getAllCollections();
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(` FOUND ${collections.length} COLLECTIONS`);
    console.log(`${'='.repeat(60)}\n`);
    
    collections.forEach((col, idx) => {
      console.log(`   ${idx + 1}. ${col}`);
    });
    console.log('');

    const allUIDs = new Set();
    const deletedCollections = [];
    const skippedCollections = [];

    // Process each collection one by one
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      
      console.log(`\n${'─'.repeat(60)}`);
      console.log(` Collection [${i + 1}/${collections.length}]: "${collection}"`);
      console.log(`${'─'.repeat(60)}`);
      
      // Extract UIDs first to show count
      console.log(`    Scanning for UIDs...`);
      const { uids, docCount } = await extractAllUIDsFromCollection(collection);
      console.log(`    Documents: ${docCount}`);
      console.log(`    Unique UIDs found: ${uids.length}`);
      
      if (uids.length > 0) {
        console.log(`   UIDs: ${uids.slice(0, 3).join(', ')}${uids.length > 3 ? '...' : ''}`);
      }
      
      const answer = await question(`\n   ❓ Delete this collection? (yes/no): `);
      
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        // Add UIDs to master list
        uids.forEach(uid => allUIDs.add(uid));

        // Delete collection
        console.log(`\n     Deleting collection "${collection}"...`);
        await deleteCollection(collection);
        console.log(`    Collection "${collection}" DELETED\n`);
        deletedCollections.push(collection);
      } else {
        console.log(`     SKIPPED collection "${collection}"\n`);
        skippedCollections.push(collection);
      }
    }

    // Final Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`FIRESTORE CLEANUP SUMMARY`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Total collections: ${collections.length}`);
    console.log(`Deleted: ${deletedCollections.length}`);
    console.log(`Skipped: ${skippedCollections.length}`);
    console.log(`Unique UIDs collected: ${allUIDs.size}\n`);

    if (deletedCollections.length > 0) {
      console.log(`Deleted collections:`);
      deletedCollections.forEach(col => console.log(`   ✓ ${col}`));
      console.log('');
    }

    if (skippedCollections.length > 0) {
      console.log(`Skipped collections:`);
      skippedCollections.forEach(col => console.log(`   ○ ${col}`));
      console.log('');
    }

    // Delete authentication users
    if (allUIDs.size > 0) {
      console.log(`${'─'.repeat(60)}`);
      console.log(`FIREBASE AUTHENTICATION CLEANUP`);
      console.log(`${'─'.repeat(60)}\n`);
      console.log(`Found ${allUIDs.size} unique authentication users to delete.`);
      console.log(`These UIDs were extracted from deleted collections.\n`);
      
      const deleteAuth = await question(`Delete all ${allUIDs.size} authentication users? (yes/no): `);
      
      if (deleteAuth.toLowerCase() === 'yes' || deleteAuth.toLowerCase() === 'y') {
        await deleteAuthUsers(Array.from(allUIDs));
      } else {
        console.log(`\nAuthentication users preserved.`);
      }
    } else {
      console.log(`\nNo authentication users to delete (no UIDs found).`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`CLEANUP COMPLETE!`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('\nERROR during cleanup:', error);
    console.error(error.stack);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the script
console.log('\nStarting Firebase Cleanup Script...\n');
main();