const clients = {};
const files = {};
let lastUsedClientId = 0;
let lastUsedFileId = 0;

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

exports.doOnAllClients = (cb) => Object.values(clients).map(cb);

exports.filesListForClient = (clientId) =>
  JSON.stringify(Object.values(files).filter((file) => file.clientId !== clientId));

exports.getNextClientId = () => {
  lastUsedClientId += 1;
  return `client-${lastUsedClientId}`;
};

const getNextFileId = () => {
  lastUsedFileId += 1;
  return `file-${lastUsedFileId}`;
};
