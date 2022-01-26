const { Server } = require("ws");

const getCurrentTime = () => new Date().toISOString().replace("T", " ").slice(0, -5);

exports.startWebSocketServer = (httpServer) => {
  const wss = new Server({ server: httpServer });

  setInterval(() => {
    wss.clients.forEach((client) => {
      client.send(getCurrentTime());
    });
  }, 1000);

  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.send(getCurrentTime());

    ws.on("close", () => console.log("Client disconnected"));

    ws.on("message", (data, isBinary) => {
      if (isBinary) {
        console.log("Received binary data of length", Buffer.byteLength(data, "utf-8"));
      } else {
        console.log("Received non-binary data ", data.toString("utf-8"));
      }
    });
  });
};
