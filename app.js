'use strict';
var Server = require("./server");
const Good = require('good');
const mongojs = require('mongojs');

Server.setup(5000);

var server = Server.server;

server.register([
  {
    register: Good,
    options: {
      reporters: {
        console: [{
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{
            response: '*',
            log: '*'
          }]
        }, {
          module: 'good-console'
        }, 'stdout']
      }
    }
  },
  // {
  //   register: MongoDB,
  //   options: {
  //     "url": "mongodb://127.0.0.1:3001/meteor",
  //     "settings": {
  //        "db": {
  //           "native_parser": false
  //        }
  //      }
  //    }
  //  }
  ], (err) => {
      if (err) {
        throw err; // something bad happened loading the plugin
      }

      server.start((err) => {
        if (err) {
          throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
      });
});
