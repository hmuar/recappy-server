function getRoutePath(apiVersionPath) {
  return apiVersionPath + '/fbmessage';
}

function routes(apiVersionPath) {

  let routePath = getRoutePath(apiVersionPath);

  // When initially setting up the webhook for messenger platform,
  // Facebook sends a GET request with challenge text that must
  // be responded with a parseInt version of that text.
  let routeGET = {
    method: 'GET',
    path: routePath,
    handler: function(request, reply) {
      let challengeText = request.query['hub.challenge'];
      reply(parseInt(challengeText, 10));
    }
  };

  // All chat messages from Facebook Messenger arrive as POST requests.
  let routePOST = {
    method: 'POST',
    path: routePath,
    handler: function(request, reply) {
      // let dbAdapter = require("../db/db");
      // if(request.server.plugins.hasOwnProperty('hapi-mongodb')) {
      //   dbAdapter.connect(request.server.plugins['hapi-mongodb'].db);
      //   let db = dbAdapter.db;
      //   db.getOneCat(null, (result) => {
      //   });
      // }
      reply();
    }
  };

  return [routeGET, routePOST];

}

export default {
  getRoutePath,
  routes
}
