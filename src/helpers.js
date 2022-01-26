const clients = {};
const files = {};
let lastUsedClientId = 0;
let lastUsedFileId = 0;

exports.addNewClient = (clientId, ws) => {
  clients[clientId] = {
    clientId,
    webSocket: ws,
    files: [],
  };
};

exports.deleteClient = (clientId) => {
  // delete file entries from clientId in files
  // delete file entries from clientId in other clients
  delete clients[clientId];
};

exports.addFileToList = (newFileMeta, fileId, clientId) => {
  files[fileId] = {
    clientId,
    fileId,
    ...JSON.parse(newFileMeta),
  };
};

exports.addFileToClient = (clientId, fileId) => {
  clients[clientId].files.push(fileId);
};

exports.doOnAllClients = (cb) => Object.values(clients).map(cb);

exports.filesListForClient = (clientId) =>
  JSON.stringify(Object.values(files).filter((file) => file.clientId !== clientId));

exports.getNextClientid = () => {
  lastUsedClientId += 1;
  return `client-${lastUsedClientId}`;
};

exports.getNextFileid = () => {
  lastUsedFileId += 1;
  return `client-${lastUsedFileId}`;
};
