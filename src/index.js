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
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toISOString());
  });
}, 1000);
