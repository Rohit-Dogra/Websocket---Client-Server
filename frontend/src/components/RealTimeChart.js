/*import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

//  Register Required Components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RealtimeChart = ({ data }) => {
  return (
    <div style={{ width: "80%", height: "400px", margin: "auto" }}>
      <h2> Real-Time System Usage</h2>
      <Line
        data={{
          labels: data.labels,
          datasets: [
            {
              label: "CPU Usage (%)",
              data: data.cpuUsage,
              borderColor: "blue",
              backgroundColor: "rgba(0, 0, 255, 0.2)", //  Light Fill
              borderWidth: 2,
              pointRadius: 3,
              tension: 0.4, //  Makes the line smooth
            },
            {
              label: "RAM Usage (%)",
              data: data.ramUsage,
              borderColor: "green",
              backgroundColor: "rgba(0, 255, 0, 0.2)",
              borderWidth: 2,
              pointRadius: 3,
              tension: 0.4,
            },
            {
              label: "CPU Temperature (°C)",
              data: data.cpuTemp,
              borderColor: "red",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
              borderWidth: 2,
              pointRadius: 3,
              tension: 0.4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: "linear", //  Fixes the issue with missing lines
              title: {
                display: true,
                text: "Time (Latest Data First)",
              },
            },
            y: {
              title: {
                display: true,
                text: "Usage / Temperature",
              },
              beginAtZero: true,
            },
          },
          elements: {
            line: {
              tension: 0.4, //  Smooth Curved Line
            },
          },
        }}
      />
    </div>
  );
};

export default RealtimeChart;


*/



import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

//  Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RealtimeChart = ({ data }) => {
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map((d, i) => i),
    datasets: [
      {
        label: "CPU Usage (%)",
        data: data.map((d) => d.cpu_usage),
        borderColor: "blue",
        backgroundColor: "rgba(0,0,255,0.1)",
        fill: true,
        tension: 0.2,
      },
      {
        label: "RAM Usage (%)",
        data: data.map((d) => d.ram_usage),
        borderColor: "green",
        backgroundColor: "rgba(0,255,0,0.1)",
        fill: true,
        tension: 0.2,
      },
      {
        label: "CPU Temperature (°C)",
        data: data.map((d) => d.cpu_temp),
        borderColor: "red",
        backgroundColor: "rgba(255,0,0,0.1)",
        fill: true,
        tension: 0.2,
      },
      
    ],
    
  };

  return (
    <div>
      <h2>Real-Time System Monitoring</h2>
      <Line ref={chartRef} data={chartData} />
    </div>
  );
};

export default RealtimeChart;

 