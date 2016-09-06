import mongoose from 'mongoose';

// User
// ----
// Main user account. Has access info from other adapters.
// E.g. facebook messenger ID
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  facebookMessageID: String,
});

export const User = mongoose.model('User', userSchema, 'users');

// StudentSession
// --------------
// Current state of user with app (what note they are on, what stage
// of response they have with note, remaining note queue etc.)
const sessionSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  subjects: {},
});

export const StudentSession = mongoose.model('StudentSession',
                                     sessionSchema,
                                     'studentsession');


// Category
// --------
// Main collection of hierarchical pieces to organize notes under
const catSchema = new mongoose.Schema({
  createdAt: Date,
  ctype: String,
  order: Number,
  weight: Number,
  parent: [mongoose.Schema.Types.ObjectId],
  ckey: String,
  globalIndex: Number,
  subjectParent: mongoose.Schema.Types.ObjectId,
});

export const Category = mongoose.model('Category', catSchema, 'category');

// Note
// ----
// Main unit of information users interact with. Can be info,
// or question / answer pair user responds to and gets evaluated on.
// Note is just subset of Category, but use different
// schema to make it easier and clearer to work with.
const noteSchema = new mongoose.Schema({
  createdAt: Date,
  ctype: String,
  order: Number,
  type: String,
  weight: Number,
  level: Number,
  display: String,
  extra: String,
  extra_media: String,
  parent: [mongoose.Schema.Types.ObjectId],
  ckey: String,
  displayRaw: String,
  globalIndex: Number,
  subjectParent: mongoose.Schema.Types.ObjectId,
  directParent: mongoose.Schema.Types.ObjectId,
});

export const Note = mongoose.model('Note', noteSchema, 'category');

// Note Record
// -----------
// History of user interaction with a given note. Holds factors that inform
// how to re-schedule note, evaluate how well user understands note
const noteRecordSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  noteID: mongoose.Schema.Types.ObjectId,
  noteType: String,
  count: Number,
  factor: Number,
  interval: Number,
  subjectParent: mongoose.Schema.Types.ObjectId,
  lastDone: Date,
  due: Date,
  history: [Number],
  health: Number,
});

export const NoteRecord = mongoose.model('NoteRecord',
                                 noteRecordSchema,
                                 'noterecord');

export const ObjectID = mongoose.Types.ObjectId;
