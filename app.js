var server = require("./server");
const Good = require('good');

server.register({
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
}, (err) => {

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
