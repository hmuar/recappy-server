import calcWeight, { calcWeightDelta } from '~/core/knowledge';
import { StudentModel, ObjectID } from '~/db/collection';
import { getParentLabelForLevel } from '~/core/category';
import { logErr } from '~/logger';
import CategoryAssistant from '~/db/category_assistant';

// Work with StudentModel collection
// Create new or update existing record in studentmodel collection for
// current note after calculating new weight.
// If doesn't exist, create, else, update
export function updateCategoryForUser(userID, catID, ctype, weightDelta) {
  return StudentModel.findOne({ userID, catID, }).then(studentModel => {
    if (studentModel) {
      const newWeight = calcWeight(studentModel.weight, weightDelta);
      return StudentModel.findByIdAndUpdate(studentModel._id, {
        $set: { weight: newWeight, },
      });
    }

    // cat doesn't exist in student model so create new record
    return CategoryAssistant.getCategoryById(catID).then(cat => {
      if (cat) {
        const newModel = new StudentModel({
          userID,
          catID,
          ctype,
          ckey: cat.ckey,
          directParent: ObjectID(cat.parent[cat.parent.length - 1]),
          weight: calcWeight(0, weightDelta),
        });
        return newModel.save();
      }
      logErr(`Could not find category with id ${catID}. Student Model not updated`);
      return Promise.reject();
    });
  });
}

// Create new or update existing record in studentmodel
// collection for all parents, and propagate weight change upwards.
export function updateCatParentsForUser(userID, parents, weightDelta) {
  let pChain = Promise.resolve(0);
  parents.forEach((parentID, i) => {
    pChain = pChain.then(() =>
      updateCategoryForUser(userID, parentID, getParentLabelForLevel(i), weightDelta));
  });
  return pChain;
}

export default function updateModelForUser(userID, note, evalCtx) {
  if (!userID || !note || !evalCtx) {
    logErr('no userID or note or evalCtx. Failed to updateModelForUser');
    return Promise.reject(null);
  }
  const weightDelta = calcWeightDelta(note.level, evalCtx.answerQuality);
  // XXX: commenting this out for now - doesn't seem right to update weights
  // for notes. We only need to update weights for all parent categories
  // return updateCategoryForUser(userID, note._id, note.ctype, weightDelta).then(() =>
  //   updateCatParentsForUser(userID, note.parent, weightDelta));

  // only update note parents
  return updateCatParentsForUser(userID, note.parent, weightDelta);
}
