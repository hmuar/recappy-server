import Good from 'good';
import Server from './server';
import winston from './logger';

const server = new Server();
server.setup(5000);

// const winston = require('winston');
//
// winston.add(
//   winston.transports.File, {
//     filename: 'logs/server.log',
//     level: 'info',
//     eol: '\n', // for Windows, or `eol: ‘n’,` for *NIX OSs
//     json: true,
//     prettyPrint: true,
//     timestamp: true,
//     colorize: false,
//   }
//   // winston.transports.Console, {
//   //   level: 'info',
//   //   colorize: true,
//   // }
// );

server.start([
  {
    register: Good,
    options: {
      reporters: {
        winston: [{
          module: 'good-winston',
          args: [winston, {
            error_level: 'error',
            ops_level: 'debug',
            request_level: 'info',
            response_level: 'info',
            other_level: 'info',
          }],
        }],
      },
    },
  },
]);
