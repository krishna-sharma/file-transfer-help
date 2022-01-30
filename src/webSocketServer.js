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
  processData,
  endofData,
  getClientWebsocket,
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
    try {
      const [ws, dataToForward] = processData(clientId, data);
      ws.send(dataToForward, { binary: true });
    } catch (error) {
      getClientWebsocket(clientId).send(
        JSON.stringify({
          action: "SEND_FAILED",
          payload: error.message,
        }),
        { binary: false }
      );
    }
  } else {
    const parsedData = JSON.parse(data.toString("utf-8"));
    if (parsedData.action === "ADD") {
      addFileToList(parsedData.payload, clientId);
    } else if (parsedData.action === "CLEAR") {
      clearClientFiles(clientId);
    } else if (parsedData.action === "REQUEST") {
      const [sourceClient, destClient, fileDetails, transferId] = addTransferRequest(clientId, parsedData.payload);
      destClient.webSocket.send(
        JSON.stringify({
          action: "START",
          payload: { transferId, ...fileDetails },
        }),
        {
          binary: false,
        }
      );
      sourceClient.webSocket.send(
        JSON.stringify({
          action: "REQUEST",
          payload: { transferId, filename: fileDetails.name },
        }),
        { binary: false }
      );
    } else if (parsedData.action === "END") {
      const [ws, dataToForward] = endofData(clientId);
      ws.send(dataToForward, { binary: false });
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
  }, 20000);
};
