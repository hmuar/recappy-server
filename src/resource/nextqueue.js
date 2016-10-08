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
      if (request.query && request.query.uid && request.query.sid) {
        getNextNotes(ObjectID(request.query.uid),
                     ObjectID(request.query.sid),
                     request.query.ind)
        .then((resNotes) => {
          const nextNotes = resNotes.map((note) => (
            {
              _id: note._id,
              type: note.type,
              displayRaw: note.displayRaw,
              directParent: note.directParent,
              queueStatus: note.queueStatus,
            }
          ));
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
            reply(nextNotes.map((note) => {
              const conceptParent = conceptMap[note.directParent.valueOf()];
              return {
                ...note,
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
