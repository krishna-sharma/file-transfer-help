const { Server } = require("ws");
const {
  getNextClientid,
  getNextFileid,
  addNewClient,
  deleteClient,
  addFileToList,
  addFileToClient,
  filesListForClient,
  doOnAllClients,
} = require("./helpers");

const connection = (clientId, ws) => {
  addNewClient(clientId, ws);
  ws.send(filesListForClient(clientId), { binary: false });
};

const close = (clientId) => {
  deleteClient(clientId);
};

const message = (clientId, data, isBinary) => {
  if (isBinary) {
    // console.log("Received binary data of length", Buffer.byteLength(data, "utf-8"));
  } else {
    const fileId = getNextFileid();
    // delete old file entries from clientId in files
    // delete old file entries from clientId in other clients
    addFileToList(data.toString("utf-8"), fileId, clientId);
    addFileToClient(clientId, fileId);
    doOnAllClients((client) => {
      client.webSocket.send(filesListForClient(client.clientId), { binary: false });
    });
  }
};

exports.startWebSocketServer = (httpServer) => {
  const wss = new Server({ server: httpServer });
  wss.on("connection", (ws) => {
    const clientId = getNextClientid();
    connection(clientId, ws);
    ws.on("close", () => close(clientId));
    ws.on("message", (data, isBinary) => message(clientId, data, isBinary));
  });
};
