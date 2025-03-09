/*import { io } from "socket.io-client";
const socket = io("ws://localhost:5000"); // Adjust IP if running on different machine
export default socket;
*/
/*
import { io } from "socket.io-client";
const socket = io("http://192.168.29.50:8080"); // ✅ Update with Frontend IP
export default socket;
*/


import { io } from "socket.io-client";

const socket = io("http://192.168.29.112:8080", {
  transports: ["websocket", "polling"], // Ensure compatibility
  reconnectionAttempts: 5, // Retry 5 times before failing
  timeout: 10000, // Wait 10 seconds before failing
});

export default socket;
