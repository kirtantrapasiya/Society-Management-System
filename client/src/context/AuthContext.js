import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const SimpleLoading = () => (
  <div className="min-h-screen w-full flex justify-center items-center">
    <div className="w-10 h-10 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
  </div>
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserDoc = useCallback(async (uid) => {
    try {
      if (!uid) {
        setUserDoc(null);
        return null;
      }

      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("User found in 'users' collection:", userData);
        setUserDoc(userData);
        setError(null);
        return userData;
      }

      const visitorDocRef = doc(db, "visitors", uid);
      const visitorDocSnap = await getDoc(visitorDocRef);

      if (visitorDocSnap.exists()) {
        const visitorData = visitorDocSnap.data();
        console.log("User found in 'visitors' collection:", visitorData);
        setUserDoc(visitorData);
        setError(null);
        return visitorData;
      }

      // Not found in either collection
      console.error("User document not found in either collection");
      setUserDoc(null);
      setError("User document not found.");
      return null;
    } catch (error) {
      console.error("Error fetching user document:", error);
      setError(error.message);
      setUserDoc(null);
      return null;
    }
  }, []);

  const refreshUserData = useCallback(async (uid = null) => {
    const userId = uid || user?.uid;
    if (!userId) return null;
    return await fetchUserDoc(userId);
  }, [user?.uid, fetchUserDoc]);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setUserDoc(null);
    setError(null);
  }, []);

  const registerOwner = useCallback(async (email, password, profileData) => {
    try {
      setError(null);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userData = {
        uid,
        email,
        role: "owner",
        isOwner: true,
        isRenterFamily: false,
        createdAt: new Date(),
        ...profileData,
      };

      await setDoc(doc(db, "users", uid), userData);

      await setDoc(doc(db, "rooms", profileData.roomNumber), {
        roomNumber: profileData.roomNumber,
        owner: uid,
        ownerName: profileData.fullName,
        self: true,
        rent: false,
        familyMembers: [],
        renterFamilyMembers: [],
        createdAt: new Date(),
      });

      return uid;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const registerOwnerFamily = useCallback(async (email, password, ownerUid, profileData) => {
    try {
      setError(null);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userData = {
        uid,
        email,
        role: "owner_family",
        isOwner: false,
        isRenterFamily: false,
        ownerUid,
        createdAt: new Date(),
        ...profileData,
      };

      await setDoc(doc(db, "users", uid), userData);

      const roomRef = doc(db, "rooms", profileData.roomNumber);
      await updateDoc(roomRef, {
        familyMembers: arrayUnion({
          uid,
          name: profileData.fullName,
          relationship: profileData.relationship,
          email: email,
          contact: profileData.contactNo,
        }),
        updatedAt: new Date(),
      });

      return uid;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const registerRenter = useCallback(async (email, password, ownerUid, profileData) => {
    try {
      setError(null);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userData = {
        uid,
        email,
        role: "renter",
        isOwner: false,
        isRenterFamily: true,
        ownerUid,
        createdAt: new Date(),
        isActive: true,
        ...profileData,
      };

      await setDoc(doc(db, "users", uid), userData);

      const roomRef = doc(db, "rooms", profileData.roomNumber);
      await updateDoc(roomRef, {
        self: false,
        rent: true,
        renterUid: uid,
        renterName: profileData.fullName,
        renterEmail: email,
        renterContact: profileData.contactNo,
        isOwner: false,
        isRenterFamily: true,
        updatedAt: new Date(),
      });

      return uid;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const registerRenterFamily = useCallback(async (email, password, renterUid, profileData) => {
    try {
      setError(null);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userData = {
        uid,
        email,
        role: "renter_family",
        isOwner: false,
        isRenterFamily: true,
        renterUid,
        createdAt: new Date(),
        ...profileData,
      };

      await setDoc(doc(db, "users", uid), userData);

      const roomRef = doc(db, "rooms", profileData.roomNumber);
      await updateDoc(roomRef, {
        renterFamilyMembers: arrayUnion({
          uid,
          name: profileData.fullName,
          relationship: profileData.relationship,
          email: email,
          contact: profileData.contactNo,
        }),
        updatedAt: new Date(),
      });

      return uid;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const registerVisitor = useCallback(async (email, password, profileData) => {
    try {
      setError(null);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const visitorData = {
        uid,
        email,
        role: "visitor",
        createdAt: new Date(),
        ...profileData,
      };

      await setDoc(doc(db, "visitors", uid), visitorData);

      console.log("Visitor registered in 'visitors' collection");
      return uid;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const registerSecretary = useCallback(async (email, password, profileData) => {
    try {
      setError(null);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const secretaryData = {
        uid,
        email,
        role: "secretary",
        createdAt: new Date(),
        ...profileData,
      };

      // Save to users collection
      await setDoc(doc(db, "users", uid), secretaryData);

      console.log("Secretary registered in 'users' collection");
      return uid;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userData = await fetchUserDoc(uid);
      if (!userData) throw new Error("User profile not found in users or visitors collection");

      setUser(userCred.user);
      console.log("Login successful. Role:", userData.role);
      return { user: userCred.user, profile: userData };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUserDoc]);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
      clearAuthState();
      console.log("Logout successful");
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [clearAuthState]);

  useEffect(() => {
    let timeoutId;
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        try {
          setUser(currentUser);
          
          if (currentUser) {
            if (!userDoc || userDoc.uid !== currentUser.uid) {
              await fetchUserDoc(currentUser.uid);
            }
          } else {
            clearAuthState();
          }
        } catch (error) {
          console.error("Auth state change error:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }, 100); 
    });

    return () => {
      unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userDoc, fetchUserDoc, clearAuthState]);

  const forceRefresh = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        await currentUser.getIdToken(true); 
        await fetchUserDoc(currentUser.uid);
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error("Force refresh error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchUserDoc, clearAuthState]);

  const value = {
    user,
    userDoc,
    loading,
    error,
    registerOwner,
    registerOwnerFamily,
    registerRenter,
    registerRenterFamily,
    registerVisitor,
    registerSecretary,
    login,
    logout,
    refreshUserData,
    forceRefresh,
    clearAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <SimpleLoading />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}