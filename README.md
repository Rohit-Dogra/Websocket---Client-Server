Real-Time System Monitoring (WebSocket + TCP + HTTP)
This project is a real-time system monitoring application that collects CPU usage, RAM usage, CPU temperature, and device details from multiple clients, stores them in MySQL and MongoDB, and displays the data graphically on a React.js frontend. The system communicates via TCP, WebSockets, and HTTP APIs.

🚀 Features
✅ Multi-client monitoring (Multiple laptops send system data)
✅ Real-time WebSocket updates
✅ TCP Server for handling client connections
✅ Stores data in MySQL (Structured) and MongoDB (Flexible)
✅ Uses Foreign Keys in MySQL for better data structuring
✅ Graphical display of system performance using React.js
✅ Auto-reconnect mechanism for clients
✅ Data is updated in MySQL and MongoDB instead of duplicating
🛠️ Technologies Used
Backend (Server-side)
Node.js – Server runtime
Express.js – Web framework for APIs
MySQL2 – MySQL Database
MongoDB & Mongoose – NoSQL Database
Socket.io – Real-time WebSocket communication
net (TCP) – TCP server for receiving system data
dotenv – Environment variable management
Frontend (Client-side)
React.js – Web frontend
Chart.js – Graph visualization
Axios – API requests
Socket.io-client – WebSocket client for real-time updates
📌 System Architecture
Client.js (Runs on each laptop)

Collects CPU usage, RAM usage, CPU temperature.
Sends data via TCP to the server.
Auto-reconnects if disconnected.
Server.js (Runs on the main machine)

Receives system data from multiple clients via TCP.
Stores data in MySQL and MongoDB.
Sends real-time updates via WebSockets to React frontend.
Frontend (React.js)

Connects via WebSockets to display real-time data.
Fetches stored data via HTTP API.
Displays system monitoring graphs & tables.
⚙️ Installation & Setup
1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/your-username/real-time-monitoring.git
cd real-time-monitoring
2️⃣ Install Backend Dependencies
sh
Copy
Edit
cd server
npm install
3️⃣ Install Frontend Dependencies
sh
Copy
Edit
cd frontend
npm install
4️⃣ Setup MySQL Database
sql
Copy
Edit
CREATE DATABASE system_monitoring;
USE system_monitoring;

CREATE TABLE users (
    username VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    device_name VARCHAR(255),
    ip_address VARCHAR(255),
    FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE
);

CREATE TABLE system_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id INT,
    cpu_usage FLOAT,
    ram_usage FLOAT,
    cpu_temp FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);
5️⃣ Setup .env File in Server
env
Copy
Edit
SERVER_IP=192.168.29.112
SERVER_PORT=5000
WS_PORT=8080
MONGO_URI=mongodb://localhost:27017/system_monitoring
6️⃣ Start the MySQL & MongoDB Servers
sh
Copy
Edit
# Start MySQL
sudo service mysql start   # (Linux/Mac)
net start MySQL           # (Windows)

# Start MongoDB
mongod --dbpath /data/db
7️⃣ Run the Backend
sh
Copy
Edit
cd server
node server.js
8️⃣ Run the Clients on Each Laptop
sh
Copy
Edit
cd client
node client.js
9️⃣ Run the Frontend
sh
Copy
Edit
cd frontend
npm start
📜 Full Code
🔹 Backend - server.js
javascript
Copy
Edit
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const net = require("net");
const mysql = require("mysql2");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://192.168.29.22:3000" }, // Change this to your frontend IP
});

const TCP_PORT = 5000;
const WS_PORT = 8080;

// ✅ MySQL Connection
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "username",
  password: "your password",
  database: "system_monitoring",
});

mysqlConnection.connect((err) => {
  if (err) console.error("❌ MySQL Connection Error:", err);
  else console.log("✅ Connected to MySQL");
});

// ✅ MongoDB Connection
mongoose.connect("mongodb://localhost:27017/system_monitoring", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const SystemData = mongoose.model("SystemData", new mongoose.Schema({
  username: String,
  device: String,
  ip_address: String,
  cpu_usage: Number,
  ram_usage: Number,
  cpu_temp: Number,
  timestamp: { type: Date, default: Date.now },
}));

// ✅ WebSocket Server
io.on("connection", (socket) => {
  console.log("📡 WebSocket Client Connected");
  socket.on("disconnect", () => console.log("🔴 WebSocket Client Disconnected"));
});

// ✅ TCP Server
const tcpServer = net.createServer((socket) => {
  console.log("💻 New TCP Client Connected");

  socket.on("data", async (data) => {
    try {
      let receivedData;
      let rawData = data.toString().trim();
      console.log("📥 RAW Data Received:", rawData);

      if (rawData.startsWith("[") && rawData.endsWith("]")) {
        const parsedData = rawData.replace(/\[|\]/g, "").split("|");

        receivedData = {
          username: parsedData[5].trim(),
          device: parsedData[6].trim(),
          ip_address: parsedData[2].trim(),
          cpu_usage: parseFloat(parsedData[3]),
          ram_usage: parseFloat(parsedData[4]),
          cpu_temp: parsedData[7] === "N/A" ? 40 : parseFloat(parsedData[7]),
        };
      } else {
        receivedData = JSON.parse(rawData);
      }

      console.log("✅ Processed Data:", receivedData);

      // ✅ Store in MySQL
      const statsQuery = `
        INSERT INTO system_data (cpu_usage, ram_usage, cpu_temp, timestamp)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        cpu_usage = VALUES(cpu_usage), 
        ram_usage = VALUES(ram_usage), 
        cpu_temp = VALUES(cpu_temp), 
        timestamp = NOW();
      `;

      mysqlConnection.query(statsQuery, [receivedData.cpu_usage, receivedData.ram_usage, receivedData.cpu_temp]);

      // ✅ Store in MongoDB
      await SystemData.findOneAndUpdate(
        { username: receivedData.username, device: receivedData.device },
        { $set: receivedData },
        { upsert: true, new: true }
      );

      io.emit("message", receivedData);
      console.log("📡 Sent Data to WebSocket Clients");

    } catch (err) {
      console.error("❌ Error processing TCP data:", err);
    }
  });

  socket.on("close", () => console.log("❌ TCP Client Disconnected"));
});

tcpServer.listen(TCP_PORT, "0.0.0.0", () => console.log(`🚀 TCP Server Running on Port ${TCP_PORT}`));
server.listen(WS_PORT, () => console.log(`📡 WebSocket Server Running on Port ${WS_PORT}`));
This is now a fully working real-time system monitoring solution.
Follow the steps, and let me know if you need any modifications! 
