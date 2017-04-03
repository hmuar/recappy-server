// import { log, logErr } from '~/logger';
import { getNextNotes } from '~/core/scheduler';
import { ObjectID } from '~/db/collection';
import CategoryAssistant from '~/db/category_assistant';

function getRoutePath(apiVersionPath) {
  return `${apiVersionPath}/queue`;
}

function routes(apiVersionPath) {
  const routePath = getRoutePath(apiVersionPath);

  // request can have:
  // uid - user id,
  // sid - subject id,
  // ind - global concept index,
  // d - cutoff date,

  const routeGET = {
    method: 'GET',
    path: routePath,
    handler(request, reply) {
      if (request.query && request.query.uid && request.query.sid) {
        const cutoffDate = request.query.d ? new Date(request.query.d) : null;
        const globalIndex = request.query.ind ? parseInt(request.query.ind, 10) : null;
        getNextNotes(
          ObjectID(request.query.uid),
          ObjectID(request.query.sid),
          globalIndex,
          null,
          cutoffDate,
        ).then(resNotes => {
          const nextNotes = resNotes.notes.map(note => ({
            _id: note._id,
            type: note.type,
            displayRaw: note.displayRaw,
            directParent: note.directParent,
            queueStatus: note.queueStatus,
            dueDate: note.dueDate,
          }));
          const conceptMap = {};
          let pChain = Promise.resolve(0);
          nextNotes.forEach(note => {
            const conceptID = note.directParent.valueOf();
            if (!{}.hasOwnProperty.call(conceptMap, conceptID)) {
              pChain = pChain
                .then(() => CategoryAssistant.getCategoryById(note.directParent))
                .then(concept => {
                  conceptMap[conceptID] = concept;
                });
            }
          });
          pChain.then(() => {
            reply(
              nextNotes.map(note => {
                const conceptParent = conceptMap[note.directParent.valueOf()];
                return {
                  ...note,
                  conceptName: conceptParent.ckey,
                  conceptIndex: conceptParent.globalIndex,
                };
              }),
            );
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
