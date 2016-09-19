import { StudentModel } from '~/db/collection';
// Work with StudentModel collection
// Create new or update existing record in studentmodel collection for
// current note after calculating new weight.
// Then create new or update existing record in studentmodel
// collection for all parents, and propagate weight change upwards.

// If doesn't exist, create, else, update
// catData {catID, ctype, weightDelta}
export default function updateCategoryForUser(userID, catData) {
  const { catID, weightDelta } = catData;
  return StudentModel.findOne({ userID, catID }).then((studentModel) => {
    if (studentModel) {
      return StudentModel.findByIdAndUpdate(studentModel._id, {
        $inc: { weight: weightDelta },
      });
    }
    const { ctype } = catData;
    const newModel = new StudentModel({
      userID,
      catID,
      weight: weightDelta,
      ctype,
    });
    return newModel.save();
  });
}
