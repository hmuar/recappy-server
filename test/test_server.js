var Server = require("../server");

var server = new Server();
server.setup(5001);

module.exports = server;
