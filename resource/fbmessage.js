exports = module.exports = {};

function getRoutePath(apiVersionPath) {
  return apiVersionPath + '/fbmessage';
}

function routes(apiVersionPath) {

  var routePath = getRoutePath(apiVersionPath);

  var routeGET = {
    method: 'GET',
    path: routePath,
    handler: function(request, reply) {
      var challengeText = request.query['hub.challenge'];
      reply(parseInt(challengeText, 10));
    }
  };

  var routePOST = {
    method: 'POST',
    path: routePath,
    handler: function(request, reply) {
      reply();
    }
  };

  return [routeGET, routePOST];

}

var FBMessage = {
  routes: routes,
  getRoutePath: getRoutePath
}

module.exports = FBMessage;
