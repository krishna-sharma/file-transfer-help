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

exports.addNewClient = (clientId, ws) => {
  clients[clientId] = {
    clientId,
    webSocket: ws,
    files: [],
  };
};

exports.deleteClient = (clientId) => {
  removeFilesOfAClient(clientId);
  delete clients[clientId];
};

exports.clearClientFiles = (clientId) => {
  removeFilesOfAClient(clientId);
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
  transfers[transferId] = { fileId, sourceClientId, destClientId };
  console.log(`${transferId}: [${fileId}] from [${sourceClientId}] to [${destClientId}]`);
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
