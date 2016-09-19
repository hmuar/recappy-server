// import neo4jbase from 'neo4j-driver';
// const neo4j = neo4jbase.v1;
//
// const seraph = require('seraph');
//
// export default class GraphDB {
//   constructor() {
//     // this.driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'neoneo'));
//     // this.session = null;
//     this.db = seraph({
//       user: 'neo4j',
//       pass: 'neoneo',
//       bolt: true,
//     });
//   }
//
//   // connect() {
//   //   this.session = this.driver.session();
//   // }
//
//   close() {
//     this.db.driver.close();
//   }
//
//   // close() {
//   //   console.log('trying to close session');
//   //   if (this.session) {
//   //     this.session.close();
//   //     this.session = null;
//   //   }
//   //   this.driver.close();
//   // }
//
//   setupTest() {
//     if (!this.session) {
//       console.log('no session, cant setup test');
//       return false;
//     }
//     return this.session.run('CREATE (n {name: {value}}) RETURN n', { value: 'apu' });
//   }
//
//   getAllNodes() {
//     return this.db.query('MATCH (n) RETURN n');
//   }
//
//   clearAll() {
//   // MATCH (n) DETACH
//   // DELETE n
//   }
//
// }
