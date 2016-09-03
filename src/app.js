import Good from 'good';
import Server from './server';

Server.setup(5000);

const server = Server.server;

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
            log: '*',
          }],
        }, {
          module: 'good-console',
        }, 'stdout'],
      },
    },
  },
], (err) => {
  if (err) {
    throw err; // something bad happened loading the plugin
  }
  server.start((startErr) => {
    if (startErr) {
      throw startErr;
    }
    server.log('info', `Server running at: ${server.info.uri}`);
  });
});
