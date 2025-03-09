
const net = require("net");
const si = require("systeminformation");

// Server IP and Port (Replace `SERVER_IP` with actual server IP)
const SERVER_IP = "192.168.29.112"; // Change this for remote client
const SERVER_PORT = 5000;

// Function to get system information
async function getSystemData() {
  const cpuData = await si.currentLoad();
  const memData = await si.mem();
  const tempData = await si.cpuTemperature();
  const osInfo = await si.osInfo();

  return {
    username: "Rohit ", // Change for different users
    device: osInfo.hostname,
    cpu_usage: cpuData.currentLoad.toFixed(2),
    ram_usage: ((memData.active / memData.total) * 100).toFixed(2),
    cpu_temp: tempData.main || 40, // Default 40 if temperature not available
  };
}

// Create a function to handle connection
function connectToServer() {
  const client = new net.Socket();

  client.connect(SERVER_PORT, SERVER_IP, () => {
    console.log(" Connected to TCP Server");

    // Send system data every 5 seconds
    const interval = setInterval(async () => {
      if (client.destroyed) {
        clearInterval(interval);
        return;
      }
      try {
        const data = await getSystemData();
        client.write(JSON.stringify(data));
      } catch (err) {
        console.error(" Error getting system data:", err);
      }
    }, 5000);
  });

  client.on("error", (err) => {
    console.error(" Connection Error:", err);
    if (err.code === "ECONNRESET" || err.code === "ECONNREFUSED") {
      console.log(" Reconnecting in 5 seconds...");
      setTimeout(connectToServer, 5000);
    }
  });

  client.on("close", () => {
    console.log(" Connection closed by server. Reconnecting...");
    setTimeout(connectToServer, 5000);
  });

  client.on("end", () => {
    console.log(" Server ended connection.");
  });
}

// Start the connection
connectToServer();



/* old client for send data to another server */
/*
const net = require("net");
const si = require("systeminformation");
const SERVER_IP = "192.168.29.22"; 
const SERVER_PORT = 9000; 


async function getSystemData() {
  const cpuData = await si.currentLoad();
  const memData = await si.mem();
  const tempData = await si.cpuTemperature();
  const osInfo = await si.osInfo();

  return {
    username: "Rohit Dogra", 
    device: osInfo.hostname,
    cpu_usage: cpuData.currentLoad.toFixed(2),
    ram_usage: ((memData.active / memData.total) * 100).toFixed(2),
    cpu_temp: tempData.main || 40, 
  };
}

function connectToServer() {
  const client = new net.Socket();

  client.connect(SERVER_PORT, SERVER_IP, () => {
    console.log(`Connected to Server at ${SERVER_IP}:${SERVER_PORT}`);

   
    const interval = setInterval(async () => {
      if (client.destroyed) {
        clearInterval(interval);
        return;
      }
      try {
        const data = await getSystemData();
        client.write(JSON.stringify(data)); 
      } catch (err) {
        console.error(" Error getting system data:", err);
      }
    }, 5000);
  });


  client.on("error", (err) => {
    console.error(" Connection Error:", err);
    if (err.code === "ECONNRESET" || err.code === "ECONNREFUSED") {
      console.log(" Reconnecting in 5 seconds...");
      setTimeout(connectToServer, 5000);
    }
  });

  client.on("close", () => {
    console.log(" Connection closed by server");
    setTimeout(connectToServer, 5000);
  });

  client.on("end", () => {
    console.log("Server ended connection.");
  });
}

connectToServer();

*/