// /controllers/userController.js
import { auth, db } from "../firebase.js";

/**
 * 🔹 Get All Users (Secretary only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🔹 Update User Role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { uid, role } = req.body;

    if (!uid || !role) {
      return res.status(400).json({ error: "UID and role are required" });
    }

    await db.collection("users").doc(uid).update({ role });

    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Update User Role Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🔹 Delete User
 */
export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;

    // Delete from Firebase Auth
    await auth.deleteUser(uid);

    // Delete from Firestore
    await db.collection("users").doc(uid).delete();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ error: error.message });
  }
};
