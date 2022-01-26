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
  const filesOfClient = clients[clientId].files;

  // delete file entries of clientId in other clients
  Object.keys(clients).forEach((otherClientId) => {
    if (otherClientId !== clientId) {
      const oldFiles = clients[otherClientId].files;
      clients[otherClientId].files = oldFiles.filter((oldFile) => !filesOfClient.includes(oldFile));
    }
  });

  // delete file entries of clientId in files
  filesOfClient.forEach((fileOfClient) => {
    delete files[fileOfClient];
  });

  // delete clientId entry from clients
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
