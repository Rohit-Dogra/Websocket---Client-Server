/*
import React, { useEffect, useState } from "react";
import socket from "./socket";
import RealtimeChart from "./components/RealTimeChart";
//import Report from "./components/Report";< Report/>

const App = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    cpuUsage: [],
    ramUsage: [],
    cpuTemp: [],
  });

  useEffect(() => {
    socket.on("message", (newData) => {
      setChartData((prev) => ({
        labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-10),
        cpuUsage: [...prev.cpuUsage, newData.cpu_usage].slice(-10),
        ramUsage: [...prev.ramUsage, newData.ram_usage].slice(-10),
        cpuTemp: [...prev.cpuTemp, newData.cpu_temp].slice(-10),
      }));
    });

    return () => socket.off("message");
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1> Real-Time System Monitoring Dashboard</h1>
      <RealtimeChart data={chartData} />

    </div>
  );
};

export default App;
*/








/*
import React, { useEffect, useState } from "react";
import socket from "./socket";
import RealtimeChart from "./components/RealTimeChart";
import Report from "./components/Report";

const App = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    cpuUsage: [],
    ramUsage: [],
    cpuTemp: [],
  });

  useEffect(() => {
    socket.on("message", (newData) => {
      console.log("Received Data from WebSocket:", newData);

      if (!newData || !newData.cpu_usage) return;

      setChartData((prev) => ({
        labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-10),
        cpuUsage: [...prev.cpuUsage, newData.cpu_usage].slice(-10),
        ramUsage: [...prev.ramUsage, newData.ram_usage].slice(-10),
        cpuTemp: [...prev.cpuTemp, newData.cpu_temp].slice(-10),
      }));
    });

    return () => socket.off("message");
  }, []);

  return (
    <div>
      <h1>📡 Real-Time System Monitoring</h1>
      <RealtimeChart data={chartData} />
      <Report />
    </div>
  );
};

export default App;
*/


import React, { useEffect, useState } from "react";
import socket from "./socket";
import RealtimeChart from "./components/RealTimeChart";
import Report from "./components/Report";

export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    socket.on("message", (newData) => {
      setData((prevData) => [...prevData, newData].slice(-20)); // Keep only last 20 data points
    });

    return () => socket.off("message");
  }, []);

  return (
    <div>
      <h1>System Monitoring Dashboard</h1>
      <RealtimeChart data={data} />
      <Report />
    </div>
  );
}
