import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const SimpleLoading = () => (
  <div className="min-h-screen w-full flex justify-center items-center">
    <div className="w-10 h-10 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [state, setState] = useState({
    loading: true,
    user: null,
    profile: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setState({ loading: false, user: null, profile: null });
        return;
      }

      try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        const profile = docSnap.exists() ? docSnap.data() : null;
        setState({ loading: false, user: currentUser, profile });
      } catch (error) {
        console.error("Error fetching user document:", error);
        setState({ loading: false, user: currentUser, profile: null });
      }
    });

    return () => unsubscribe();
  }, []);

  if (state.loading) {
    return <SimpleLoading />;
  }

  // Not logged in → redirect to login
  if (!state.user) return <Navigate to="/login" replace />;

  // Logged in but Firestore profile missing → redirect to error page
  if (!state.profile) return <Navigate to="/error" replace />;

  // Logged in but role not allowed → redirect home
  if (allowedRoles.length > 0 && !allowedRoles.includes(state.profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
