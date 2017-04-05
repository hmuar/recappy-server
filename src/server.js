import Hapi from 'hapi';
// add additional resources to this list as they are created
// for now, it is just fbmessenger resource
import FBMessenger from './resource/fbmessenger';
import Webclient from './resource/webclient';
import NextQueue from './resource/nextqueue';
import Admin from './resource/admin';
import Database from './db/db';

const resources = [FBMessenger, Webclient, NextQueue, Admin];

export default class Server {
  constructor() {
    this.server = new Hapi.Server();
  }

  setup(port) {
    this.server.connection({
      port,
    });
    // map routes to resources
    resources.map(resource =>
      resource.routes('/api/v1').map(routeData => this.server.route(routeData)));
  }

  // returns Promise
  start(pluginArray) {
    const plugins = pluginArray || [];
    return this.server.register(plugins).then(err => {
      if (err) {
        this.server.log('error', 'Error registering plugins.');
        this.server.log('error', err);
        throw err; // something bad happened loading the plugin
      }
      this.server.log('info', 'Done registering server plugins');
      const db = new Database();
      return db.setup().then(() => {
        this.server.log('info', 'Connected to database');
        return this.server.start(startErr => {
          if (startErr) {
            this.server.log('error', 'Error starting server');
            this.server.log('error', startErr);
            throw startErr;
          }
          this.server.log('info', `Server running at: ${this.server.info.uri}`);
        });
      });
    });
  }

  // returns Promise
  stop() {
    return this.server.stop();
  }

  inject(options) {
    return this.server.inject(options);
  }

  register(...args) {
    return this.server.register(...args);
  }
}
