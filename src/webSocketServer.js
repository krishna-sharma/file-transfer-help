const { Server } = require("ws");
const { addFileToList, addFileToClient } = require("./helpers");

const clients = {};
let lastUsedClientId = 0;
const files = {};
let lastUsedFileId = 0;

const connection = (clientId, ws) => {
  clients[clientId] = {
    clientId,
    webSocket: ws,
    files: [],
  };
  const filesList = JSON.stringify(Object.values(files));
  ws.send(filesList, { binary: false });
};

const close = (clientId) => {
  // delete file entries from clientId in files
  // delete file entries from clientId in other clients
  delete clients[clientId];
};

const message = (clientId, data, isBinary) => {
  if (isBinary) {
    // console.log("Received binary data of length", Buffer.byteLength(data, "utf-8"));
  } else {
    const currentFileId = `client-${lastUsedFileId}`;
    // delete old file entries from clientId in files
    // delete old file entries from clientId in other clients
    addFileToList(files, data.toString("utf-8"), currentFileId, clientId);
    addFileToClient(clients, clientId, currentFileId);
    lastUsedFileId += 1;
    Object.values(clients).forEach((client) => {
      const filesList = JSON.stringify(Object.values(files).filter((file) => file.clientId !== client.clientId));
      client.webSocket.send(filesList, { binary: false });
    });
  }
};

exports.startWebSocketServer = (httpServer) => {
  const wss = new Server({ server: httpServer });
  wss.on("connection", (ws) => {
    const currentClientId = `client-${lastUsedClientId}`;
    lastUsedClientId += 1;

    connection(currentClientId, ws);
    ws.on("close", () => close(currentClientId));
    ws.on("message", (data, isBinary) => message(currentClientId, data, isBinary));
  });
};
