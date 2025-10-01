// /frontend/utils/socket.js
import { io } from "socket.io-client";

// Connect to backend WebSocket
const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5001", {
  withCredentials: true,
  transports: ["websocket"],
});

// Example events
socket.on("connect", () => {
  console.log("Connected to WebSocket:", socket.id);
});

socket.on("notification", (data) => {
  console.log("Notification:", data);
});

export default socket;
