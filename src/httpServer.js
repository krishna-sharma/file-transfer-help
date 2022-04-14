const express = require("express");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;

exports.startHTTPServer = () => {
  const indexContents = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const webrtcContents = fs.readFileSync(path.join(__dirname, "webrtc.html"), "utf8");

  const app = express();

  app.get("/webrtc", (req, res) => {
    res.type(".html");
    res.status(200).send(webrtcContents);
  });

  app.get("/", (req, res) => {
    res.type(".html");
    res.status(200).send(indexContents);
  });

  return app.listen(PORT, () => console.log(`Listening on ${PORT}`));
};
