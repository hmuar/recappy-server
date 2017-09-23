import { MessageQueue } from '~/db/collection';

// update queue if msg timestamp is newer than older msg
// and return if this is latest message
// export function isLatestMsg(userID, subjectID, msg, update = true) {
//   return MessageQueue.findOne({ userID, subjectID, }).then(queueEntry => {
//     if (!queueEntry) {
//       const newQueue = {
//         userID,
//         subjectID,
//         queue: msg,
//         pending: true,
//       };
//       return MessageQueue.create(newQueue).then(() => true);
//     }
//     const queueMsg = queueEntry.queue;
//     console.log(
//       `[isLatestCheck] ${msg.timestamp % 1000}: ${msg.timestamp -
//         queueMsg.timestamp}, ${queueMsg.timestamp <= msg.timestamp}`
//     );
//     if (queueMsg && queueMsg.timestamp && queueMsg.timestamp <= msg.timestamp) {
//       queueEntry.queue = msg;
//       queueEntry.pending = true;
//       if (update) {
//         return queueEntry.save().then(() => true);
//       }
//       return true;
//     }
//     return false;
//   });
// }

export function updatePending(userID, subjectID, timestamp, pending) {
  // return MessageQueue.update(
  //   { userID, subjectID, 'queue.timestamp': { $lte: timestamp, }, },
  //   {
  //     pending: false,
  //   }
  // );
  MessageQueue.findOne({ userID, subjectID, }).then(queueEntry => {
    if (!queueEntry) {
      const newQueue = {
        userID,
        subjectID,
        queue: { timestamp, },
        pending,
      };
      return MessageQueue.create(newQueue).then(() => true);
    }
    const queueMsg = queueEntry.queue;
    if (queueMsg && queueMsg.timestamp && queueMsg.timestamp <= timestamp) {
      queueEntry.pending = pending;
      return queueEntry.save().then(() => pending);
    }
    return queueEntry.pending;
  });
}

export function shouldHandleMsg(userID, subjectID, timestamp) {
  return MessageQueue.findOne({ userID, }).then(queueEntry => {
    if (!queueEntry) {
      const newQueue = {
        userID,
        subjectID,
        queue: { timestamp, },
        pending: true,
      };
      return MessageQueue.create(newQueue).then(() => true);
    }
    const queueMsg = queueEntry.queue;
    if (queueMsg && queueMsg.timestamp && queueMsg.timestamp <= timestamp) {
      if (queueEntry.pending) {
        return false;
      }
    }
    queueMsg.timestamp = timestamp;
    queueEntry.pending = true;
    return queueEntry.save().then(() => true);
  });
}
