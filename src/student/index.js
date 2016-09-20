import calcWeight, { calcWeightDelta } from '~/core/knowledge';
import { StudentModel } from '~/db/collection';
import { getParentLabelForLevel } from '~/core/category';
import { logErr } from '~/logger';

// Work with StudentModel collection
// Create new or update existing record in studentmodel collection for
// current note after calculating new weight.
// If doesn't exist, create, else, update
export function updateCategoryForUser(userID, catID, ctype, weightDelta) {
  return StudentModel.findOne({ userID, catID }).then((studentModel) => {
    if (studentModel) {
      const newWeight = calcWeight(studentModel.weight, weightDelta);
      return StudentModel.findByIdAndUpdate(studentModel._id, {
        $set: { weight: newWeight },
      });
    }
    const newModel = new StudentModel({
      userID,
      catID,
      weight: calcWeight(0, weightDelta),
      ctype,
    });
    return newModel.save();
  });
}

// Create new or update existing record in studentmodel
// collection for all parents, and propagate weight change upwards.
export function updateCatParentsForUser(userID, parents, weightDelta) {
  let pChain = Promise.resolve(0);
  parents.forEach((parentID, i) => {
    pChain = pChain.then(() => updateCategoryForUser(userID,
                                                     parentID,
                                                     getParentLabelForLevel(i),
                                                     weightDelta));
  });
  return pChain;
}

export default function updateModelForUser(userID, note, evalCtx) {
  if (!userID || !note || !evalCtx) {
    logErr('no userID or note or evalCtx. Failed to updateModelForUser');
    return null;
  }
  const weightDelta = calcWeightDelta(note.level, evalCtx.answerQuality);
  return updateCategoryForUser(userID, note._id, note.ctype, weightDelta)
  .then(() => updateCatParentsForUser(userID, note.parent, weightDelta));
}
