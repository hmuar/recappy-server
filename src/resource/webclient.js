import AdapterWebclient from '~/adapter/webclient/webclient';
import Controller from '~/controller/controller';
import getPostBody from '~/request';

import { log, logErr } from '~/logger';

function getRoutePath(apiVersionPath) {
  return `${apiVersionPath}/web`;
}

function routes(apiVersionPath) {
  const routePath = getRoutePath(apiVersionPath);

  // When initially setting up the webhook for messenger platform,
  // Facebook sends a GET request with challenge text that must
  // be responded with a parseInt version of that text.
  const routeGET = {
    method: 'GET',
    path: routePath,
    handler(request, reply) {
      // const challengeText = request.query['hub.challenge'];
      // reply(parseInt(challengeText, 10));
      reply('Got webclient GET request');
    },
  };

  // All chat messages from Facebook Messenger arrive as POST requests.
  const routePOST = {
    method: 'POST',
    path: routePath,
    handler(request, reply) {
      const postBody = getPostBody(request);
      const controller = new Controller(AdapterWebclient);
      const msg = AdapterWebclient.parse(postBody);
      if (msg.input.type != null) {
        controller
          .registerMsg(msg)
          .then(state => {
            reply(state);
          })
          .catch(err => logErr(err));
      } else {
        log('Unrecognized message');
        reply('Unrecognized message');
      }
    },
  };

  return [routeGET, routePOST];
}

export default {
  getRoutePath,
  routes,
};
