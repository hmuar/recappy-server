import mongoose from 'mongoose';

// User
// ----
// Main user account. Has access info from other adapters.
// E.g. facebook messenger ID
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  locale: String,
  timezone: String,
  gender: String,
  email: String,
  facebookMessageID: String,
  notification: {},
  createdAt: Date,
  updatedAt: Date,
});

export const User = mongoose.model('User', userSchema, 'user');

// StudentSession
// --------------
// Current state of user with app (what note they are on, what stage
// of response they have with note, remaining note queue etc.)
const sessionSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  subjects: {},
  createdAt: Date,
  updatedAt: Date,
});

export const StudentSession = mongoose.model('StudentSession', sessionSchema, 'studentsession');

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
  exclude: Boolean,
  expireDate: Date,
  publishDate: Date,
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
  choice1: String,
  choice2: String,
  choice3: String,
  choice4: String,
  choice5: String,
  imgUrl: String,
  parent: [mongoose.Schema.Types.ObjectId],
  phrase: Object,
  paths: [],
  label: [],
  ckey: String,
  displayRaw: String,
  globalIndex: Number,
  subjectParent: mongoose.Schema.Types.ObjectId,
  originSubjectParent: mongoose.Schema.Types.ObjectId,
  directParent: mongoose.Schema.Types.ObjectId,
  // queueStatus is used by scheduler to tag notes in session
  // as 'old' or 'new'
  queueStatus: String,
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
  responseHistory: [Number],
  pathHistory: [mongoose.Schema.Types.ObjectId],
  health: Number,
  factorHistory: [Number],
  intervalHistory: [Number],
  dueHistory: [Date],
  lastDoneHistory: [Date],
  createdAt: Date,
  updatedAt: Date,
});

export const NoteRecord = mongoose.model('NoteRecord', noteRecordSchema, 'noterecord');

const studentModelSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  catID: mongoose.Schema.Types.ObjectId,
  weight: { type: Number, min: 0, max: 1, },
  ctype: String,
  ckey: String,
  directParent: mongoose.Schema.Types.ObjectId,
});

export const StudentModel = mongoose.model('StudentModel', studentModelSchema, 'studentmodel');

const simulationSchema = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  backlogCount: Number,
  notesSeen: Number,
  step: Number,
  noteRecords: {},
  noteRecordsMap: {},
  noteGlobalIndexes: [Number],
  appState: {},
});

export const Simulation = mongoose.model('Simulation', simulationSchema, 'simulation');

const mediaSchema = new mongoose.Schema({
  type: String,
  label: [String],
  url: String,
});

export const Media = mongoose.model('Media', simulationSchema, 'media');

const messageQueueScheme = new mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  subjectID: mongoose.Schema.Types.ObjectId,
  queue: {},
  pending: Boolean,
});

export const MessageQueue = mongoose.model('MessageQueue', messageQueueScheme, 'messagequeue');

export const ObjectID = mongoose.Types.ObjectId;
