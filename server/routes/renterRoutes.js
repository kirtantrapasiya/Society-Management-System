// backend/routes/renterRoutes.js
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Get Firebase references inside route handlers, not at module level
const getFirebaseServices = () => {
  return {
    auth: admin.auth(),
    db: admin.firestore()
  };
};

/**
 * POST /api/renters/verify-owner
 * Verify owner credentials before allowing renter creation form
 * 
 * Body: {
 *   ownerEmail: string,
 *   ownerPassword: string,
 *   currentOwnerUid: string (from dashboard)
 * }
 */
router.post('/verify-owner', async (req, res) => {
  try {
    const { ownerEmail, ownerPassword, currentOwnerUid } = req.body;

    // Get Firebase services
    const { db } = getFirebaseServices();

    // Validate required fields
    if (!ownerEmail || !ownerPassword || !currentOwnerUid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Step 1: Authenticate owner credentials
    
    if (!process.env.FIREBASE_API_KEY) {
      console.error('FIREBASE_API_KEY not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    let verifiedOwnerUid;
    try {
      const ownerAuthResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: ownerEmail.trim().toLowerCase(),
            password: ownerPassword,
            returnSecureToken: true
          })
        }
      );

      const ownerAuthData = await ownerAuthResponse.json();

      if (!ownerAuthResponse.ok) {
        console.error('Authentication failed:', ownerAuthData.error?.message);
        return res.status(401).json({
          success: false,
          message: 'Owner email or password is wrong, please fill correct'
        });
      }

      verifiedOwnerUid = ownerAuthData.localId;

    } catch (error) {
      console.error('Authentication error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify credentials. Please try again.'
      });
    }

    // Step 2: Fetch user data and check role
    const ownerDoc = await db.collection('users').doc(verifiedOwnerUid).get();
    
    if (!ownerDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Account not found in database'
      });
    }

    const ownerData = ownerDoc.data();
    
    // Check if user is an owner
    if (ownerData.role !== 'owner') {
      console.error('User is not an owner, role:', ownerData.role);
      return res.status(403).json({
        success: false,
        message: 'Only owner can create a renter. Please fill correct owner details.'
      });
    }

    // Step 3: Verify UID matches current dashboard owner
    if (currentOwnerUid !== verifiedOwnerUid) {
      console.error('UID mismatch - Dashboard:', currentOwnerUid, 'Entered:', verifiedOwnerUid);
      return res.status(403).json({
        success: false,
        message: 'Owner email or password is wrong, please fill correct'
      });
    }

    // All checks passed - allow to proceed
    return res.json({
      success: true,
      message: 'Owner verified successfully',
      data: {
        ownerUid: verifiedOwnerUid,
        ownerName: ownerData.fullName || ownerData.name,
        ownerEmail: ownerData.email
      }
    });

  } catch (error) {
    console.error('Owner verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify owner. Please try again.'
    });
  }
});

/**
 * POST /api/renters/create
 * Creates a new renter account with complete authentication flow
 * 
 * SECURITY: Verifies ALL credentials BEFORE making ANY database changes
 */
router.post('/create', async (req, res) => {
  const { 
    ownerEmail, 
    ownerPassword, 
    ownerUid, 
    ownerRoomNumber, 
    renterData 
  } = req.body;

  // Get Firebase services
  const { auth, db } = getFirebaseServices();

  // Validation
  if (!ownerEmail || !ownerPassword || !ownerUid || !ownerRoomNumber || !renterData) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  if (!renterData.fullName || !renterData.email || !renterData.password || !renterData.contactNo) {
    return res.status(400).json({
      success: false,
      message: 'Missing required renter information'
    });
  }

  let renterUid = null;

  try {
    // ============================================
    // PHASE 1: VERIFICATION ONLY (NO DATA CHANGES)
    // ============================================

    // Step 1: Check if renter email already exists
    
    const existingRenterQuery = await db.collection('users')
      .where('email', '==', renterData.email.trim().toLowerCase())
      .get();

    if (!existingRenterQuery.empty) {
      const existingUser = existingRenterQuery.docs[0].data();
      if (existingUser.role === 'renter' && existingUser.roomNumber) {
        return res.status(409).json({
          success: false,
          message: `This email is already registered as a renter in room ${existingUser.roomNumber}`
        });
      }
      return res.status(409).json({
        success: false,
        message: 'This email is already registered with a different account type'
      });
    }

    // ============================================
    // PHASE 2: CREATION (Only after ALL verifications pass)
    // ============================================

    // Step 2: Create renter Firebase Authentication account
    
    const renterUserRecord = await auth.createUser({
      email: renterData.email.trim().toLowerCase(),
      password: renterData.password,
      displayName: capitalizeWords(renterData.fullName.trim()),
      emailVerified: false
    });

    renterUid = renterUserRecord.uid;

    // Step 3: Create renter Firestore document
    
    const renterUserData = {
      uid: renterUid,
      fullName: capitalizeWords(renterData.fullName.trim()),
      email: renterData.email.trim().toLowerCase(),
      contactNo: renterData.contactNo.trim(),
      roomNumber: ownerRoomNumber,
      role: 'renter',
      ownerUid: ownerUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    };

    await db.collection('users').doc(renterUid).set(renterUserData);

    // Step 4: Update room document
    
    await db.collection('rooms').doc(ownerRoomNumber.toString()).update({
      isOwner: false,
      rent: true,
      isRenterFamily: true,
      renterUid: renterUid,
      renterEmail: renterData.email.trim().toLowerCase(),
      renterName: capitalizeWords(renterData.fullName.trim()),
      renterContact: renterData.contactNo.trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Step 5: Generate custom token for owner to re-authenticate
    const customToken = await auth.createCustomToken(ownerUid);

    // Success response
    return res.status(201).json({
      success: true,
      message: 'Renter account created successfully',
      data: {
        renterUid: renterUid,
        renterEmail: renterData.email.trim().toLowerCase(),
        renterName: capitalizeWords(renterData.fullName.trim()),
        roomNumber: ownerRoomNumber,
        ownerCustomToken: customToken
      }
    });

  } catch (error) {
    console.error('Renter creation error:', error);

    // Rollback: If renter was created but process failed, delete the renter account
    if (renterUid) {
      try {
        const { auth, db } = getFirebaseServices();
        await auth.deleteUser(renterUid);
        await db.collection('users').doc(renterUid).delete();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }

    // Handle specific Firebase Auth errors
    let errorMessage = 'Failed to create renter account';
    let statusCode = 500;

    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email is already registered';
      statusCode = 409;
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
      statusCode = 400;
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Use at least 6 characters.';
      statusCode = 400;
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/password accounts are not enabled';
      statusCode = 403;
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

/**
 * DELETE /api/renters/:renterId
 * Delete a renter (owner only)
 * 
 * SECURITY: Verifies ALL credentials BEFORE making ANY database changes
 */
router.delete('/:renterId', async (req, res) => {
  try {
    const { renterId } = req.params;
    const { adminEmail, adminPassword, renterPassword } = req.body;

    // Get Firebase services
    const { auth, db } = getFirebaseServices();

    // Validate required fields
    if (!adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Admin email and password are required'
      });
    }

    // ============================================
    // PHASE 1: VERIFICATION ONLY (NO DATA CHANGES)
    // ============================================

    // Step 1: Get renter details from Firestore (for verification)
    const renterDoc = await db.collection('users').doc(renterId).get();
    
    if (!renterDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Renter not found'
      });
    }

    const renterData = renterDoc.data();
    const roomNumber = renterData.roomNumber;

    // Step 2: Check if renter has family members (BEFORE any deletion)
    let hasFamilyMembers = false;
    let familyMembersCount = 0;
    
    if (roomNumber) {
      const roomDoc = await db.collection('rooms').doc(roomNumber.toString()).get();
      if (roomDoc.exists) {
        const roomData = roomDoc.data();
        const familyMembers = roomData.renterFamilyMembers || [];
        familyMembersCount = familyMembers.length;
        
        if (familyMembers.length > 0) {
          hasFamilyMembers = true;
        }
      }
    }

    // If family members exist, STOP HERE
    if (hasFamilyMembers) {
      return res.status(400).json({
        success: false,
        error: 'You are not able to remove renter details, contact secretary. You can only remove renter if no family members are added.',
        hasFamilyMembers: true,
        familyMembersCount: familyMembersCount
      });
    }

    // Step 3: Verify owner credentials using Firebase Auth REST API
    let adminUid;
    try {
      const adminAuthResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: adminEmail.trim().toLowerCase(),
            password: adminPassword,
            returnSecureToken: true
          })
        }
      );

      const adminAuthData = await adminAuthResponse.json();

      if (!adminAuthResponse.ok) {
        console.error('Owner authentication failed:', adminAuthData.error?.message);
        return res.status(401).json({
          success: false,
          error: 'Owner email or password is wrong, please fill correct',
          field: 'owner'
        });
      }

      adminUid = adminAuthData.localId;

      // Verify the admin user is an owner
      const adminDoc = await db.collection('users').doc(adminUid).get();
      
      if (!adminDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Owner account not found'
        });
      }

      const adminData = adminDoc.data();
      if (adminData.role !== 'owner') {
        return res.status(403).json({
          success: false,
          error: 'Only owners can delete renters'
        });
      }

      // CRITICAL: Verify entered owner UID matches the renter's owner
      if (renterData.ownerUid && renterData.ownerUid !== adminUid) {
        console.error('Owner UID mismatch - entered email does not match renter owner');
        return res.status(403).json({
          success: false,
          error: 'Owner email or password is wrong, please fill correct. This renter belongs to a different owner.',
          field: 'owner'
        });
      }

    } catch (error) {
      console.error('Owner verification error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Owner email or password is wrong, please fill correct',
        field: 'owner'
      });
    }

    // Step 4: Verify renter password (if provided, BEFORE deletion)
    let renterPasswordVerified = false;
    let renterPasswordError = null;

    if (renterData.email && renterPassword) {
      try {
        const renterAuthResponse = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: renterData.email.trim().toLowerCase(),
              password: renterPassword,
              returnSecureToken: true
            })
          }
        );

        const renterAuthData = await renterAuthResponse.json();

        if (!renterAuthResponse.ok) {
          if (renterAuthData.error?.message === 'INVALID_PASSWORD' || 
              renterAuthData.error?.message === 'INVALID_LOGIN_CREDENTIALS') {
            console.error('Renter password is wrong');
            return res.status(401).json({
              success: false,
              error: 'Renter password is wrong, please fill correct',
              field: 'renter'
            });
          } else if (renterAuthData.error?.message === 'EMAIL_NOT_FOUND') {
            renterPasswordError = 'Renter authentication account not found';
          } else {
            console.error('Renter authentication verification failed');
            return res.status(401).json({
              success: false,
              error: 'Renter password verification failed, please try again',
              field: 'renter'
            });
          }
        } else {
          renterPasswordVerified = true;
        }
        
      } catch (error) {
        console.error('Renter password verification error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to verify renter password'
        });
      }
    } else if (renterData.email && !renterPassword) {
      // User didn't provide renter password - ask for confirmation
      return res.status(400).json({
        success: false,
        error: `You have not filled renter password. Only database details of ${renterData.fullName || renterData.name} will be deleted. Enter renter password for complete deletion including authentication account.`,
        requiresConfirmation: true,
        partialDeletion: true,
        renterName: renterData.fullName || renterData.name
      });
    }

    // ============================================
    // PHASE 2: DELETION (Only after ALL verifications pass)
    // ============================================

    // Step 5: Update room document
    if (roomNumber) {
      const roomRef = db.collection('rooms').doc(roomNumber.toString());
      await roomRef.update({
        renterUid: null,
        renterName: null,
        renterEmail: null,
        isOwner: true,
        renterContact: null,
        rent: false,
        isRenterFamily: false,
        renterFamilyMembers: [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Step 6: Delete user document from Firestore
    await db.collection('users').doc(renterId).delete();

    // Step 7: Delete Firebase Authentication account (if password was verified)
    let authDeletionSuccess = false;
    let authDeletionMessage = null;

    if (renterPasswordVerified) {
      try {
        await auth.deleteUser(renterId);
        authDeletionSuccess = true;
      } catch (authError) {
        console.error('Auth deletion error:', authError);
        authDeletionMessage = `Authentication deletion failed: ${authError.message}`;
      }
    } else if (renterPasswordError) {
      authDeletionMessage = `${renterPasswordError}. Database deleted but authentication account remains.`;
    }

    // Step 8: Return success response
    return res.json({
      success: true,
      message: authDeletionSuccess 
        ? 'Renter deleted successfully including authentication account'
        : 'Renter deleted from database',
      warning: authDeletionMessage,
      authDeleted: authDeletionSuccess,
      deletedRenter: {
        id: renterId,
        name: renterData.fullName || renterData.name,
        email: renterData.email,
        roomNumber: roomNumber
      }
    });

  } catch (error) {
    console.error('Deletion error:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to delete renter: ${error.message}`
    });
  }
});

// Helper function to capitalize words
function capitalizeWords(str) {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export default router;