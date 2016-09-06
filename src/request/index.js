function getHapiPostBody(request) {
  // hapijs specific
  // return JSON.parse(request.payload);
  return request.payload;
}

export default function getPostBody(request) {
  return getHapiPostBody(request);
}
