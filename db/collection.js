'use strict';

const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  name : String,
  email : String,
  facebookMessageID: String
});

let User = mongoose.model('User', userSchema, 'users');

let sessionSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  subjects: {}
});

let StudentSession = mongoose.model('StudentSession',
                                     sessionSchema,
                                     'studentsession');

let catSchema = new mongoose.Schema({
  createdAt : Date,
  ctype: String,
  order : Number,
  weight : Number,
  parent : [mongoose.Schema.Types.ObjectId],
  ckey : String,
  globalIndex : Number,
  subjectParent : mongoose.Schema.Types.ObjectId
});

let Category = mongoose.model('Category', catSchema, 'category');

let noteSchema = new mongoose.Schema({
  createdAt : Date,
  ctype: String,
  order : Number,
  type : String,
  weight : Number,
  level : Number,
  display : String,
  extra : String,
  extra_media : String,
  parent : [mongoose.Schema.Types.ObjectId],
  ckey : String,
  displayRaw : String,
  globalIndex : Number,
  subjectParent : mongoose.Schema.Types.ObjectId,
  directParent : mongoose.Schema.Types.ObjectId
});

// Note is just subset of Category, but use different
// schema to make it easier and clearer to work with.
let Note = mongoose.model('Note', noteSchema, 'category');

let noteRecordSchema = new mongoose.Schema({
  userID : mongoose.Schema.Types.ObjectId,
  noteID : mongoose.Schema.Types.ObjectId,
  noteType : String,
  count : Number,
  factor : Number,
  interval : Number,
  subjectParent : mongoose.Schema.Types.ObjectId,
  lastDone : Date,
  due : Date,
  history : [Number],
  health : Number
});

let NoteRecord = mongoose.model('NoteRecord',
                                 noteRecordSchema,
                                 'noterecord');

let Schema = {
  User: User,
  StudentSession: StudentSession,
  Category: Category,
  Note: Note,
  NoteRecord: NoteRecord,
  ObjectID: mongoose.Types.ObjectId
}

module.exports = Schema
