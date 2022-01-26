const express = require("express");
const fs = require("fs");
const path = require("path");
const { Server } = require("ws");

const PORT = process.env.PORT || 8000;
const indexContents = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

const app = express();
app.get("/", (req, res) => {
  res.type(".html");
  res.status(200).send(indexContents);
});
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("close", () => console.log("Client disconnected"));

  ws.on("message", (data, isBinary) => {
    if (isBinary) {
      console.log("Received binary data of length", Buffer.byteLength(data, "utf-8"));
    } else {
      console.log("Received non-binary data ", data.toString("utf-8"));
    }
  });

  const currentTime = new Date().toISOString().replace("T", " ").slice(0, -5);
  ws.send(currentTime);
});

setInterval(() => {
  const currentTime = new Date().toISOString().replace("T", " ").slice(0, -5);
  wss.clients.forEach((client) => {
    client.send(currentTime);
  });
}, 1000);
