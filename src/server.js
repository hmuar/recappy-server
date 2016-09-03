import Hapi from 'hapi';
// add additional resources to this list as they are created
// for now, it is just fbmessenger resource
import FBMessenger from './resource/fbmessenger';

const resources = [FBMessenger];

class Server {
  constructor() {
    this.server = new Hapi.Server();
  }

  setup(port) {
    this.server.connection({
      port,
    });
    resources.map((resource) => (
      resource.routes('/api/v1').map(routeData => this.server.route(routeData))
    ));
  }

  // returns Promise
  start() {
    return this.server.register([]).then(() => (
      this.server.start()
    ));
  }

  // returns Promise
  stop() {
    return this.server.stop();
  }

  inject(options) {
    return this.server.inject(options);
  }
}

export default Server;
