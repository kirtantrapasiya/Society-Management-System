// middleware/authMiddleware.js
import { auth, db } from "../firebase.js";

//Verify Firebase Token Middleware

export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token using Firebase Admin Auth
    const decodedToken = await auth.verifyIdToken(token); // auth is Firebase Admin auth instance
    req.user = decodedToken;

    // Fetch role from Firestore
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user.role = userDoc.data().role; // attach role to request
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

/**
 * Role-based Access Middleware
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 */
export const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};
