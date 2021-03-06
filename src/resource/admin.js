import AdminController from '~/admin/controller';
import getPostBody from '~/request';

import { log, logErr } from '~/logger';

function getRoutePath(apiVersionPath) {
  return `${apiVersionPath}/admin`;
}

function routes(apiVersionPath) {
  const routePath = getRoutePath(apiVersionPath);

  const routeGET = {
    method: 'GET',
    path: routePath,
    handler(request, reply) {
      reply('Got admin GET request');
    },
  };

  const routePOST = {
    method: 'POST',
    path: routePath,
    handler(request, reply) {
      const postBody = getPostBody(request);
      const controller = new AdminController();
      controller
        .registerMsg(postBody)
        .then(state => {
          reply(state);
        })
        .catch(err => logErr(err));
    },
  };

  return [routeGET, routePOST];
}

export default {
  getRoutePath,
  routes,
};
