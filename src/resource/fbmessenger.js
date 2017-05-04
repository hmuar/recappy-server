import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
import Controller from '~/controller/controller';
import getPostBody from '~/request';

import { log, logErr } from '~/logger';

function getRoutePath(apiVersionPath) {
  return `${apiVersionPath}/fbmessage`;
}

function processMessages(msgs) {
  const controller = new Controller(AdapterFB);
  let pChain = Promise.resolve(0);
  msgs.forEach(msg => {
    if (msg && msg.input && msg.input.type != null) {
      pChain = pChain.then(() => controller.registerMsg(msg).catch(err => logErr(err)));
    } else {
      logErr(`Unrecognized message: ${msg}`);
    }
  });
  return pChain;
  // return pChain.catch(error => {
  //   logErr('Error while trying to process messages.');
  //   logErr(error);
  // });
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
      const challengeText = request.query['hub.challenge'];
      reply(parseInt(challengeText, 10));
    },
  };

  // All chat messages from Facebook Messenger arrive as POST requests.
  const routePOST = {
    method: 'POST',
    path: routePath,
    handler(request, reply) {
      reply('Ok');
      const postBody = getPostBody(request);
      const msgs = AdapterFB.parse(postBody);
      processMessages(msgs);
    },
  };

  return [routeGET, routePOST];
}

export default {
  getRoutePath,
  routes,
};
