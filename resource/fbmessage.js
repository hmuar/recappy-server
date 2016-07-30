'use strict';
exports = module.exports = {};

function getRoutePath(apiVersionPath) {
  return apiVersionPath + '/fbmessage';
}

function routes(apiVersionPath) {

  var routePath = getRoutePath(apiVersionPath);

  // When initially setting up the webhook for messenger platform,
  // Facebook sends a GET request with challenge text that must
  // be responded with a parseInt version of that text.
  var routeGET = {
    method: 'GET',
    path: routePath,
    handler: function(request, reply) {
      var challengeText = request.query['hub.challenge'];
      reply(parseInt(challengeText, 10));
    }
  };

  // All chat messages from Facebook Messenger arrive as POST requests.
  var routePOST = {
    method: 'POST',
    path: routePath,
    handler: function(request, reply) {
      var dbAdapter = require("../db/db");
      if(request.server.plugins.hasOwnProperty('hapi-mongodb')) {
        dbAdapter.connect(request.server.plugins['hapi-mongodb'].db);
        var db = dbAdapter.db;
        db.getOneCat(null, (result) => {
          console.log("received results!");
          console.log(result);
        });
      }
      reply();
    }
  };

  return [routeGET, routePOST];

}

var FBMessage = {
  routes: routes,
  getRoutePath: getRoutePath
};

module.exports = FBMessage;
