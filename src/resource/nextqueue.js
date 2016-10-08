// import { log, logErr } from '~/logger';
import { getNextNotes } from '~/core/scheduler';
import { ObjectID } from '~/db/collection';
import CategoryAssistant from '~/db/category_assistant';

function getRoutePath(apiVersionPath) {
  return `${apiVersionPath}/queue`;
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
      console.log('got queue request........');
      if (request.query && request.query.uid && request.query.sid) {
        getNextNotes(ObjectID(request.query.uid), ObjectID(request.query.sid))
        .then((nextNoteList) => {
          const nextNotes = [...nextNoteList[0], ...nextNoteList[1]];
          const conceptMap = {};
          let pChain = Promise.resolve(0);
          nextNotes.forEach((note) => {
            const conceptID = note.directParent.valueOf();
            if (!{}.hasOwnProperty.call(conceptMap, conceptID)) {
              pChain = pChain.then(() =>
                CategoryAssistant.getCategoryById(note.directParent))
              .then((concept) => {
                conceptMap[conceptID] = concept;
              });
            }
          });
          pChain.then(() => {
            console.log('resolving pchain, final concept map keys:');
            console.log(Object.keys(conceptMap));
            reply(nextNotes.map((note) => {
              const conceptParent = conceptMap[note.directParent.valueOf()];
              console.log('-------------------------------');
              console.log(note.directParent.valueOf());
              console.log(conceptParent.ckey);
              console.log(conceptParent._id);
              console.log(conceptParent.ctype);
              return {
                type: note.type,
                displayRaw: note.displayRaw,
                conceptName: conceptParent.ckey,
                conceptIndex: conceptParent.globalIndex,
              };
            }));
          });
        });
      } else {
        reply([]);
      }
    },
  };

  return [routeGET];
}

// All chat messages from Facebook Messenger arrive as POST requests.
export default {
  routes,
};
