const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const peers = [];

const webrtcContents = fs.readFileSync(path.join(__dirname, "webrtc.html"), "utf8");

router.post("/webrtc/internals", function (req, res) {
  const internals = {};
  if (req.body.peers) internals.peers = peers;
  res.status(200).json(internals);
});

router.post("/webrtc/peer/add", function (req, res) {
  peers.push({
    id: peers.length,
    ...req.body,
  });
  res.status(200).json({ peers: peers });
});

router.get("/webrtc", (req, res) => {
  res.type(".html");
  res.status(200).send(webrtcContents);
});

module.exports = router;
