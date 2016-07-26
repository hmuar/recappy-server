'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({
  port: 5000
});

var resources = [require('./resource/fbmessage')];

resources.map(function(resource) {
  resource.routes('/api/v1').map(routeData => server.route(routeData));
});

// server.route({
//   method: 'GET',
//   path: '/api/v1/fbmessage/',
//   handler: function(request, reply) {
//     console.log(request.query);
//     var challengeText = request.query['hub.challenge'];
//     reply(parseInt(challengeText, 10));
//   }
// });
//
// server.route({
//   method: 'GET',
//   path: '/{name}',
//   handler: function(request, reply) {
//     reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
//   }
// });



module.exports = server;
