const express = require("express");
const fs = require("fs");
const path = require("path");
const webrtcRouter = require("./webrtc");

const PORT = process.env.PORT || 8000;

exports.startHTTPServer = () => {
  const indexContents = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

  const app = express();
  app.use(express.json());
  app.use(webrtcRouter);
  app.get("/", (req, res) => {
    res.type(".html");
    res.status(200).send(indexContents);
  });

  return app.listen(PORT, () => console.log(`Listening on ${PORT}`));
};
