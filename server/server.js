
/*
const net = require("net");
const mysql = require("mysql2");
const mongoose = require("mongoose");
const WebSocket = require("ws");
const http = require("http");
const socketIo = require("socket.io");

// MySQL Connection
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "username",
  password: "yourpassword",
  database: "system_monitoring",
});

mysqlConnection.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error:", err);
    return;
  }
  console.log(" Connected to MySQL");
});

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/system_monitoring", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const SystemData = mongoose.model("SystemData", new mongoose.Schema({
  username: String,
  device: String,
  cpu_usage: Number,
  ram_usage: Number,
  cpu_temp: Number,
  timestamp: { type: Date, default: Date.now },
}));

// HTTP Server for WebSockets
const httpServer = http.createServer();
const io = socketIo(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Allow React frontend
    methods: ["GET", "POST"],
  },
});

// WebSocket Server (on port 5001)
const wss = new WebSocket.Server({ server: httpServer });

wss.on("connection", (ws) => {
  console.log(" New WebSocket client connected");

  ws.on("close", () => {
    console.log(" WebSocket client disconnected");
  });
});

// TCP Server (on port 5000)
const tcpServer = net.createServer((socket) => {
  console.log(" New TCP client connected");

  socket.on("data", (data) => {
    try {
      const receivedData = JSON.parse(data.toString());
      console.log(" Received Data:", receivedData);

      // Insert into MySQL
      const sqlQuery = `
        INSERT INTO system_data (username, device, cpu_usage, ram_usage, cpu_temp, timestamp)
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE cpu_usage=?, ram_usage=?, cpu_temp=?, timestamp=NOW();
      `;
      const values = [
        receivedData.username, receivedData.device, receivedData.cpu_usage,
        receivedData.ram_usage, receivedData.cpu_temp,
        receivedData.cpu_usage, receivedData.ram_usage, receivedData.cpu_temp,
      ];

      mysqlConnection.query(sqlQuery, values, (err) => {
        if (err) console.error(" MySQL Insert Error:", err);
        else console.log(" Data inserted/updated in MySQL");
      });

      // Insert into MongoDB
      (async () => {
        try {
          await SystemData.findOneAndUpdate(
            { username: receivedData.username }, 
            receivedData, 
            { upsert: true, new: true }
          );
          console.log(" Data inserted/updated in MongoDB");
        } catch (err) {
          console.error(" MongoDB Insert Error:", err);
        }
      })();
      
      // Send real-time update to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(receivedData));
        }
      });

      // Send real-time update to Socket.io clients
      io.emit("newData", receivedData);
    } catch (error) {
      console.error(" Error processing TCP data:", error);
    }
  });

  socket.on("error", (err) => {
    console.error(" Socket Error:", err);
  });

  socket.on("end", () => {
    console.log(" TCP Client disconnected");
  });
});

// Start TCP Server
tcpServer.listen(5000, "0.0.0.0", () => {
  console.log(" TCP Server Running on Port 5000");
});

// Start WebSocket Server
httpServer.listen(5001, () => {
  console.log(" WebSocket Server Running on Port 5001");
});
*/



/*

const net = require("net");
const mysql = require("mysql2");
const mongoose = require("mongoose");

//  Use MySQL Connection Pool 
const mysqlPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "rohitdogra@23",
  database: "system_monitoring",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/system_monitoring", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const SystemData = mongoose.model("SystemData", new mongoose.Schema({
  username: String,
  device: String,
  ip_address: String,
  device_id: Number,
  cpu_usage: Number,
  ram_usage: Number,
  cpu_temp: Number,
  timestamp: { type: Date, default: Date.now },
}));

//  Create TCP Server
const server = net.createServer((socket) => {
  console.log(" New TCP Client Connected");

  socket.on("data", (data) => {
    try {
      console.log(" RAW Data Received:", data.toString());

      let receivedData;

      //  Check if the data is JSON (Client 1) or Array format (Client 2)
      if (data.toString().startsWith("{")) {
        receivedData = JSON.parse(data.toString()); //  JSON from Client 1
        receivedData.ip_address = socket.remoteAddress.replace(/^.*:/, ""); //  Extract IP
      } else {
        //  Convert Array Format to JSON for Client 2
        const values = data.toString().replace(/[\[\]]/g, "").split("|");
        receivedData = {
          client_version: values[0],
          packet_id: values[1],
          ip_address: values[2] || socket.remoteAddress.replace(/^.*:/, ""),
          cpu_usage: parseFloat(values[3]),
          ram_usage: parseFloat(values[4]),
          username: values[5],
          cpu_temp: parseFloat(values[6]) || 40, // Default 40°C if temp is not available
        };
      }

      console.log(` Connected Client: ${receivedData.username} - IP: ${receivedData.ip_address}`);

      //  Insert or Update User in MySQL
      mysqlPool.query(
        `INSERT INTO users (username) VALUES (?)
         ON DUPLICATE KEY UPDATE username=username;`,
        [receivedData.username]
      );

      //  Insert or Update Device in MySQL
      mysqlPool.query(
        `INSERT INTO devices (device_name, ip_address, username)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE ip_address=?, username=?;`,
        [receivedData.device, receivedData.ip_address, receivedData.username, receivedData.ip_address, receivedData.username]
      );

      //  Fetch Device ID
      mysqlPool.query(
        `SELECT device_id FROM devices WHERE device_name=? AND username=?`,
        [receivedData.device, receivedData.username],
        (err, rows) => {
          if (err || rows.length === 0) {
            console.error(" MySQL Device Fetch Error:", err);
            return;
          }

          const device_id = rows[0].device_id;
          const username = receivedData.username;

          //  Insert or Update Monitoring Data in MySQL
          mysqlPool.query(
            `INSERT INTO system_data (device_id, username, cpu_usage, ram_usage, cpu_temp)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE cpu_usage=?, ram_usage=?, cpu_temp=?, timestamp=NOW();`,
            [
              device_id, username, receivedData.cpu_usage, receivedData.ram_usage, receivedData.cpu_temp,
              receivedData.cpu_usage, receivedData.ram_usage, receivedData.cpu_temp
            ]
          );

          console.log(` Data Stored for: ${username} (${receivedData.device})`);

          //  Insert or Update in MongoDB
          SystemData.findOneAndUpdate(
            { username: receivedData.username, device: receivedData.device },
            {
              username: receivedData.username,
              device: receivedData.device,
              ip_address: receivedData.ip_address,
              device_id: device_id,
              cpu_usage: receivedData.cpu_usage,
              ram_usage: receivedData.ram_usage,
              cpu_temp: receivedData.cpu_temp,
              timestamp: new Date(),
            },
            { upsert: true, new: true }
          ).then(() => console.log(" Data inserted/updated in MongoDB"))
            .catch((err) => console.error(" MongoDB Insert Error:", err));
        }
      );

      //  Send Confirmation Response to Client
      socket.write(JSON.stringify({ message: ` Data received from ${receivedData.username}` }));

    } catch (error) {
      console.error("\ Error processing TCP data:", error);
    }
  });

  socket.on("error", (err) => console.error(" Socket Error:", err));
  socket.on("end", () => console.log(" TCP Client Disconnected"));
});

//  Start TCP Server
server.listen(5000, "0.0.0.0", () => {
  console.log(" TCP Server Running on Port 5000");
});
*/















const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const net = require("net");
const mysql = require("mysql2");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);

const allowedOrigins = ["http://192.168.29.22:3000", "http://localhost:3000"]; // Allowed Frontend IPs
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy error: Not allowed"));
      }
    },
    methods: ["GET", "POST"],
  },
});

const TCP_PORT = 5000;
const WS_PORT = 8080;

//  MySQL Connection
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rohitdogra@23",
  database: "system_monitoring",
});

mysqlConnection.connect((err) => {
  if (err) console.error(" MySQL Connection Error:", err);
  else console.log(" Connected to MySQL");
});

//  MongoDB Connection
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

// WebSocket Server
io.on("connection", (socket) => {
  console.log(" WebSocket Client Connected");
  socket.on("disconnect", () => console.log(" WebSocket Client Disconnected"));
});

//  TCP Server
const tcpServer = net.createServer((socket) => {
  console.log(" New TCP Client Connected");

  socket.on("data", async (data) => {
    try {
      let receivedData;
      let rawData = data.toString().trim();
      console.log(" RAW Data Received:", rawData);

      //  Convert Client 2's format into valid JSON
      if (rawData.startsWith("[") && rawData.endsWith("]")) {
        const parsedData = rawData.replace(/\[|\]/g, "").split("|");

        receivedData = {
          username: parsedData[5],
          device: parsedData[6],
          ip_address: parsedData[2],
          cpu_usage: parseFloat(parsedData[3]),
          ram_usage: parseFloat(parsedData[4]),
          cpu_temp: parsedData[7] === "N/A" ? 40 : parseFloat(parsedData[7]), // Default 40 if N/A
        };
      } else {
        receivedData = JSON.parse(rawData);
      }

      console.log("Processed Data:", receivedData);

      //  Store in MySQL
      const userQuery = `INSERT INTO users (username) VALUES (?) ON DUPLICATE KEY UPDATE username=username`;
      mysqlConnection.query(userQuery, [receivedData.username]);

      const deviceQuery = `INSERT INTO devices (username, device_name, ip_address) 
                           VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ip_address=?`;
      mysqlConnection.query(deviceQuery, [receivedData.username, receivedData.device, receivedData.ip_address, receivedData.ip_address]);

      const [device] = await mysqlConnection.promise().query(`SELECT device_id FROM devices WHERE device_name = ?`, [receivedData.device]);
      const deviceId = device[0]?.device_id;

      if (!deviceId) return;

      //  Store System Stats
      const statsQuery = `
        INSERT INTO system_data (device_id, cpu_usage, ram_usage, cpu_temp, timestamp)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE cpu_usage=?, ram_usage=?, cpu_temp=?, timestamp=NOW();
      `;
      const values = [deviceId, receivedData.cpu_usage, receivedData.ram_usage, receivedData.cpu_temp, receivedData.cpu_usage, receivedData.ram_usage, receivedData.cpu_temp];

      mysqlConnection.query(statsQuery, values);

      //  Store in MongoDB
      await SystemData.findOneAndUpdate(
        { username: receivedData.username, device: receivedData.device },
        receivedData,
        { upsert: true, new: true }
      );

      //  Send Data to WebSocket Clients
      io.emit("message", receivedData);
      console.log(" Sent Data to WebSocket Clients");

      // Send Acknowledgment to Client
      socket.write(" Data Received Successfully");

    } catch (err) {
      console.error(" Error processing TCP data:", err);
    }
  });
  
  socket.on("close", () => console.log(" TCP Client Disconnected"));
});

tcpServer.listen(TCP_PORT, "0.0.0.0", () => console.log(` TCP Server Running on Port ${TCP_PORT}`));
server.listen(WS_PORT, () => console.log(` WebSocket Server Running on Port ${WS_PORT}`));
  
