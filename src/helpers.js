exports.addFileToList = (files, newFileMeta, fileId, clientId) => {
  files[fileId] = {
    clientId,
    fileId,
    ...JSON.parse(newFileMeta),
  };
};

exports.addFileToClient = (clients, clientId, fileId) => {
  clients[clientId].files.push(fileId);
};
