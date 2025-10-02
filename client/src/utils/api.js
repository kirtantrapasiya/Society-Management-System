// /frontend/utils/api.js
import axios from "axios";

// Base API URL (use env var for prod/dev switching)
const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

// Attach token before each request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const getProfile = () => API.get("/auth/profile");

export const getAllUsers = () => API.get("/users");
export const updateUserRole = (data) => API.put("/users/role", data);
export const deleteUser = (uid) => API.delete(`/users/${uid}`);

export const uploadImage = (formData) =>
  API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default API;
