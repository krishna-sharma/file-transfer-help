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
  const destClient = clients[transfer.destClientId];
  return [destClient.webSocket, data];
};

exports.endofData = (sourceClientId) => {
  const [transfer] = Object.values(transfers).filter((transfer) => transfer.sourceClientId === sourceClientId);
  const destClient = clients[transfer.destClientId];
  return [destClient.webSocket, JSON.stringify({ action: "END", payload: transfer })];
};

exports.doOnAllClients = (cb) => Object.values(clients).map(cb);

exports.filesListForClient = (clientId) =>
  JSON.stringify({ action: "LIST", payload: Object.values(files).filter((file) => file.clientId !== clientId) });

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
