var AdapterFBMessenger = {};

AdapterFBMessenger.handleRequest = function(request) {
  // var requestInfo = MessageAdapterFBMessenger.parseRequest(request);
  //
  // // convert facebookID into a userID
  // var fbUserID = requestInfo.senderID;
  // var user = Modules.Account.getUserByFacebookMsgID(fbUserID);
  //
  // if(user === undefined) {
  //   var userID = Modules.Account.createUserWithFacebookMsgID(fbUserID);
  // }
  // else {
  //   var userID = user._id;
  // }
  // requestInfo.senderID = userID;
  // return requestInfo;
}

AdapterFBMessenger.parseRequest = function(request) {

}

AdapterFBMessenger.sendMessage = function(userID, note, state) {

}

module.exports = AdapterFBMessenger;
