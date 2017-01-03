// import test from 'blue-tape';
// import GraphDB from '~/db/graph';
// import TestDatabase from './test_database';
// import TestConst from './test_const';
//
// const before = test;
// const after = test;
// const db = new TestDatabase();
//
// const SUBJECT_NAME = TestConst.SUBJECT_NAME;
//
// before('before scheduler testing', () => (
//   db.setup().then(() => db.clean())
//   .then(() => db.loadAllFixtures())
// ));
//
// // test('connect to graph db', t => {
// //   const gdb = new GraphDB();
// //   gdb.connect();
// //   console.log('done closing grahp db');
// //   return gdb.setupTest()
// //   .then((result) => {
// //     console.log(result.records[0]);
// //     console.log(result._fields);
// //     return gdb.getAllNodes();
// //   })
// //   .then((result) => {
// //     t.ok(result);
// //     gdb.close();
// //   });
// // });
//
// test('connect to graphdb using seraph', t => {
//   const gdb = new GraphDB();
//   return gdb.getAllNodes().then((result) => {
//     console.log(result);
//     gdb.close();
//     t.ok(gdb);
//   });
// });
//
// after('after scheduler testing', () => db.close());
