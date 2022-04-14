const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

let peers = [];

const webrtcContents = fs.readFileSync(path.join(__dirname, "webrtc.html"), "utf8");

router.post("/webrtc/internals", function (req, res) {
  const internals = {};
  if (req.body.peers) internals.peers = peers;
  res.status(200).json(internals);
});

router.get("/webrtc/peers/purge", function (req, res) {
  peers = [];
  res.status(200).json({ status: "success" });
});

router.post("/webrtc/peer/add", function (req, res) {
  const newPeer = {
    id: peers.length,
    ...req.body,
  };
  peers.push(newPeer);
  res.status(200).json({ peer: newPeer });
});

router.get("/webrtc", (req, res) => {
  res.type(".html");
  res.status(200).send(webrtcContents);
});

module.exports = router;
