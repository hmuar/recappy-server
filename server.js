'use strict';

const Hapi = require('hapi');
var resources = [require('./resource/fbmessage')];

var Server = function() {
  this.server = new Hapi.Server();
}

Server.prototype.setup = function(port) {
  this.server.connection({
    port: port
  });
  resources.map((resource) => {
    resource.routes('/api/v1').map(routeData => this.server.route(routeData));
  });
}

module.exports = new Server();
