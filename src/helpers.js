const clients = {};
const files = {};
const transfers = {};
let lastUsedClientId = 0;
let lastUsedFileId = 0;
let lastUsedTransferId = 0;

const removeFilesOfAClient = (clientId) => {
  const fileIds = clients[clientId].files;
  fileIds.forEach((fileId) => {
    delete files[fileId];
  });
};

const removeTransfersOfClient = (clientId, useDest) => {
  Object.values(transfers).forEach((transfer) => {
    if (transfer.sourceClientId === clientId || (useDest && transfer.destClientId === clientId)) {
      // TODO: move this if-else out of helper
      if (transfer.sourceClientId === clientId) {
        this.getClientWebsocket(transfer.destClientId).send(
          JSON.stringify({
            action: "RECEIVE_FAILED",
            payload: useDest ? "CLIENT_DISCONNECTED" : "CLIENT_CLEARED_FILES",
          }),
          { binary: false }
        );
      } else {
        this.getClientWebsocket(transfer.sourceClientId).send(
          JSON.stringify({
            action: "SEND_FAILED",
            payload: useDest ? "CLIENT_DISCONNECTED" : "CLIENT_CLEARED_FILES",
          }),
          { binary: false }
        );
      }

      delete transfers[transfer.transferId];
    }
  });
};

exports.addNewClient = (clientId, ws) => {
  clients[clientId] = {
    clientId,
    webSocket: ws,
    files: [],
  };
};

exports.deleteClient = (clientId) => {
  removeFilesOfAClient(clientId);
  removeTransfersOfClient(clientId, true);
  delete clients[clientId];
};

exports.clearClientFiles = (clientId) => {
  removeFilesOfAClient(clientId);
  removeTransfersOfClient(clientId, false);
  clients[clientId].files = [];
};

exports.addFileToList = (newFileMeta, clientId) => {
  const fileId = getNextFileId();
  files[fileId] = {
    clientId,
    fileId,
    ...newFileMeta,
  };
  clients[clientId].files.push(fileId);
};

exports.addTransferRequest = (destClientId, source) => {
  const sourceClientId = source.clientId;
  const fileId = source.fileId;
  const transferId = getNextTransferId();
  transfers[transferId] = { transferId, fileId, sourceClientId, destClientId };
  return [clients[sourceClientId], clients[destClientId], files[fileId], transferId];
};

exports.processData = (sourceClientId, data) => {
  const [transfer] = Object.values(transfers).filter((transfer) => transfer.sourceClientId === sourceClientId);
  if (!transfer) {
    throw new Error("TRANSFER_UNAVAILABLE");
  }
  const destClient = clients[transfer.destClientId];
  return [destClient.webSocket, data];
};

exports.endofData = (sourceClientId) => {
  const [transfer] = Object.values(transfers).filter((transfer) => transfer.sourceClientId === sourceClientId);
  const destClient = clients[transfer.destClientId];
  delete transfers[transfer.transferId];
  return [destClient.webSocket, JSON.stringify({ action: "END", payload: transfer })];
};

exports.doOnAllClients = (cb) => Object.values(clients).map(cb);

exports.filesListForClient = (clientId) =>
  JSON.stringify({ action: "LIST", payload: Object.values(files).filter((file) => file.clientId !== clientId) });

exports.getClientWebsocket = (clientId) => clients[clientId].webSocket;

exports.getNextClientId = () => {
  lastUsedClientId += 1;
  return `client-${lastUsedClientId}`;
};

const getNextFileId = () => {
  lastUsedFileId += 1;
  return `file-${lastUsedFileId}`;
};

const getNextTransferId = () => {
  lastUsedTransferId += 1;
  return `transfer-${lastUsedTransferId}`;
};
