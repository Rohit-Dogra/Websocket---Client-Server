const WebSocket = require("ws");
const { mysqlConnection } = require("./db");

const wss = new WebSocket.Server({ port: 5001 });

wss.on("connection", (ws) => {
    console.log(" WebSocket Client Connected");

    const sendData = () => {
        mysqlConnection.query("SELECT * FROM system_data ORDER BY id DESC LIMIT 10", (err, results) => {
            if (err) {
                console.error(" MySQL Query Error:", err);
                return;
            }
            const data = JSON.stringify(results);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        });
    };

    const interval = setInterval(sendData, 5000);

    ws.on("close", () => {
        console.log(" WebSocket Client Disconnected");
        clearInterval(interval);
    });
});

console.log(" WebSocket Server running on port 5001");
