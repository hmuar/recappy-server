// import test from 'blue-tape';
// import AdapterFB from '~/adapter/fbmessenger/fbmessenger';
// import Input from '~/core/input';
// import DBAssist from '~/db/category_assistant';
// import { SessionState } from '~/core/session_state';
// import { successEval } from '~/controller/pipe_eval';
// import Answer from '~/core/answer';
// import TestDatabase from './test_database';
// import TestConst from './test_const';
//
// const before = test;
// const after = test;
// const db = new TestDatabase();
//
// const SUBJECT_NAME = TestConst.SUBJECT_NAME;
// let subject = null;
// let testUser = null;
//
// function getSession(queueIndex, state) {
//   return {
//     queueIndex,
//     startSessionTime: new Date(),
//     noteQueue: [
//       {
//         _id: db.createObjectID('9e16c772556579bd6fc6c222'),
//         type: 'info',
//         label: ['prompt'],
//       },
//       {
//         _id: db.createObjectID('987e8177faf2c2f03c974482'),
//         type: 'recall',
//         paths: [
//           {
//             display: 'polar bonds?',
//             catName: 'polar-covalent-bond',
//             catId: '2980227254feb46732ca491e',
//           },
//           {
//             display: 'electron?',
//             catName: 'electron-shell',
//             catId: '7980227254feb46736ca47fd',
//           }
//         ],
//       },
//       {
//         _id: db.createObjectID('987e8177faf2c2f03c974482'),
//         type: 'input',
//         paths: ['fake path input'],
//       },
//       {
//         _id: db.createObjectID('ff7cbfb397fb2794827739ad'),
//         type: 'choice',
//       }
//     ],
//     state,
//     globalIndex: 0,
//     nextGlobalIndex: 1,
//   };
// }
//
// function getAppState(session, input, evalCtx) {
//   return {
//     timestamp: 1,
//     senderID: '2028279607252615',
//     userID: testUser._id,
//     input,
//     subjectName: SUBJECT_NAME,
//     subjectID: subject._id,
//     session,
//     evalCtx,
//   };
// }
//
// before('before fb message transform input testing', () =>
//   db
//     .setup()
//     .then(() => db.clean())
//     .then(() => db.loadAllFixtures())
//     .then(() => DBAssist.getCategoryByName('subject', SUBJECT_NAME))
//     .then(subj => {
//       subject = subj;
//       return db.getTestUser();
//     })
//     .then(user => {
//       testUser = user;
//     }));
//
// test('test transform prompt note input', t => {
//   const appState = getAppState(
//     getSession(0, SessionState.INIT),
//     {
//       type: Input.Type.CUSTOM,
//       payload: 'hallo',
//     },
//     successEval(Answer.ok)
//   );
//   const nextAppState = AdapterFB.transformInput(appState);
//   t.equal(nextAppState.input.type, Input.Type.PATH);
//   t.equal(nextAppState.input.payload, '0');
//   t.end();
// });
//
// // TODO: create tests after fleshing out evalContext
//
// // test("send message", function(t) {
// //   let reqStub = sinon.stub(request, 'post')
// //     .yields(null, 200);
// //     // .yields(null, JSON.stringify({login: "bulkan"}));
// //   AdapterFB.sendMessage("1028279607252642", "test text", (err, result) => {
// //     t.equal(result, 200);
// //     t.end();
// //   });
// //   request.post.restore();
// // });
//
// after('after fb message transform input testing', () => db.close());
