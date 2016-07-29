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

// returns Promise
Server.prototype.start = function() {
  return this.server.register([]).then(() => {
    return this.server.start();
  });
}

// returns Promise
Server.prototype.stop = function() {
  return this.server.stop();
}

Server.prototype.inject = function(options) {
  return this.server.inject(options);
}

module.exports = Server;
