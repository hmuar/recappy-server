import AdapterFB from '../adapter/fbmessenger/fbmessenger';
import Controller from '../controller/controller';
import getPostBody from '../request';

function getRoutePath(apiVersionPath) {
  return `${apiVersionPath}/fbmessage`;
}

function routes(apiVersionPath, server) {
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
    // config: {
    //   payload: {
    //     parse: true,
    //   },
    // },
    handler(request, reply) {
      reply('Ok');
      const postBody = getPostBody(request);
      console.log(postBody);
      server.log('info', postBody);
      const controller = new Controller(AdapterFB);
      const msg = AdapterFB.parse(postBody);
      console.log(msg);
      if (msg.input.type != null) {
        // controller.debugDBAssist(msg);
        console.log('trying to register message....');
        controller.registerMsg(msg).then((state) => {
          console.log('done registering message in controller');
          controller.sendMessage(state);
        })
        .catch((err) => console.log(err));
      } else {
        console.log('Unrecognized message...........');
      }
    },
  };

  return [routeGET, routePOST];
}

export default {
  getRoutePath,
  routes,
};
