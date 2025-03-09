/*import React, { useState, useEffect } from "react";
import socket from "../socket";

const Report = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    socket.on("message", (newData) => {
      setData((prevData) => [newData, ...prevData].slice(0, 10));
    });

    return () => socket.off("message");
  }, []);

  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <h2> Live System Report</h2>
      <table border="1" style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Device</th>
            <th>IP Address</th>
            <th>CPU Usage</th>
            <th>RAM Usage</th>
            <th>CPU Temperature</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.username}</td>
              <td>{item.device}</td>
              <td>{item.ip_address}</td>
              <td>{item.cpu_usage.toFixed(2)}%</td>
              <td>{item.ram_usage.toFixed(2)}%</td>
              <td>{item.cpu_temp.toFixed(2)}°C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Report;
*/




import React, { useState, useEffect } from "react";
import socket from "../socket";

const Report = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        socket.on("message", (newData) => {
            setData((prevData) => [newData, ...prevData].slice(0, 2));
        });

        return () => socket.off("message");
    }, []);

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Live System Report</h2>
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Device</th>
                            <th>CPU Usage</th>
                            <th>RAM Usage</th>
                            <th>CPU Temperature</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.username || "N/A"}</td>
                                <td>{item.device || "N/A"}</td>
                                <td>{parseFloat(item.cpu_usage || 0).toFixed(2)}%</td>
                                <td>{parseFloat(item.ram_usage || 0).toFixed(2)}%</td>
                                <td>{parseFloat(item.cpu_temp || 0).toFixed(2)}°C</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ✅ Styles for Centering & Compact Layout
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh", // Adjust height to avoid full-page usage
        backgroundColor: "#f8f9fa", // Light gray background
    },
    heading: {
        fontSize: "24px",
        marginBottom: "20px",
        color: "#333",
    },
    tableWrapper: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "80%", // Adjusted width to prevent full-page takeover
    },
    table: {
        width: "100%",
        maxWidth: "800px", // Keep table size small
        borderCollapse: "collapse",
        textAlign: "center",
        backgroundColor: "#fff",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    th: {
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px",
    },
    td: {
        padding: "8px",
        borderBottom: "1px solid #ddd",
    },
};

export default Report;

