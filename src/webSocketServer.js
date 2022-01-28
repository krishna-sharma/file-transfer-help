const { Server } = require("ws");
const {
  getNextClientId,
  addNewClient,
  deleteClient,
  addFileToList,
  filesListForClient,
  doOnAllClients,
  clearClientFiles,
  addTransferRequest,
} = require("./helpers");

const connection = (clientId, ws) => {
  addNewClient(clientId, ws);
  ws.send(filesListForClient(clientId), { binary: false });
};

const close = (clientId) => {
  deleteClient(clientId);
  doOnAllClients((client) => {
    client.webSocket.send(filesListForClient(client.clientId), { binary: false });
  });
};

const message = (clientId, data, isBinary) => {
  if (isBinary) {
    console.log("Received binary data of length", Buffer.byteLength(data, "utf-8"));
  } else {
    const parsedData = JSON.parse(data.toString("utf-8"));
    if (parsedData.action === "ADD") {
      addFileToList(parsedData.payload, clientId);
    } else if (parsedData.action === "CLEAR") {
      clearClientFiles(clientId);
    } else if (parsedData.action === "REQUEST") {
      const sourceClient = addTransferRequest(clientId, parsedData.payload);
      sourceClient.webSocket.send(
        JSON.stringify({ action: "REQUEST", payload: { fileId: parsedData.payload.fileId, clientId } }),
        { binary: false }
      );
    }
    doOnAllClients((client) => {
      client.webSocket.send(filesListForClient(client.clientId), { binary: false });
    });
  }
};

exports.startWebSocketServer = (httpServer) => {
  const wss = new Server({ server: httpServer });
  wss.on("connection", (ws) => {
    const clientId = getNextClientId();
    connection(clientId, ws);
    ws.on("close", () => close(clientId));
    ws.on("message", (data, isBinary) => message(clientId, data, isBinary));
  });

  setInterval(() => {
    doOnAllClients((client) => {
      client.webSocket.send(filesListForClient(client.clientId), { binary: false });
    });
  }, 2000);
};
