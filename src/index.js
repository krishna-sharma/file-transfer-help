const { startHTTPServer } = require("./httpServer");
const { startWebSocketServer } = require("./webSocketServer");

const httpServer = startHTTPServer();
startWebSocketServer(httpServer);
