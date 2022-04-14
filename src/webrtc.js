const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const webrtcContents = fs.readFileSync(path.join(__dirname, "webrtc.html"), "utf8");

router.get("/webrtc/one", function (req, res) {
  res.status(200).json({ one: 1 });
});

router.get("/webrtc", (req, res) => {
  res.type(".html");
  res.status(200).send(webrtcContents);
});

module.exports = router;
