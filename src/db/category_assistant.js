import { Category, Note, ObjectID } from '~/db/collection';

// function getParentIdList(parentCategories) {
//   return parentCategories.map(function(obj) {
//     if(obj && obj.hasOwnProperty("_id")) {
//       return obj._id;
//     } else {
//       return null;
//     }
//   });
// }

function getCategoryByName(catLabel, catName) {
  return Category.findOne({ ctype: catLabel, ckey: catName, });
}

// function getParentQuery(parentCategories) {
//   let parentQuery = [{parent: getParentIdList(parentCategories)}];
//   return parentQuery;
// }

function getParentQueryWithId(parentCategoriesIds) {
  return [{ parent: parentCategoriesIds, }];
}

function getCategoryById(catId) {
  return Category.findOne({ _id: catId, });
}

function getNoteById(catId) {
  return Note.findById(catId);
}

function getNotesByIds(ids) {
  return Note.find({ _id: { $in: ids, }, }).exec((err, docs) =>
    docs.sort(
      (a, b) => ids.findIndex(id => a._id.equals(id)) - ids.findIndex(id => b._id.equals(id))
    )
  );
}

function getUnitsInOrder(subjectID) {
  const parentQuery = getParentQueryWithId([subjectID]);
  if (parentQuery.length === 0) {
    return [];
  }
  return Category.find({ ctype: 'unit', $and: parentQuery, }).sort('order');
}

function getTopicsInOrder(subjectID, unitID) {
  const parentQuery = getParentQueryWithId([subjectID, unitID]);
  if (parentQuery.length === 0) {
    return [];
  }
  return Category.find({ ctype: 'topic', $and: parentQuery, }).sort('order');
}

function getConceptsInOrder(subjectID, unitID, topicID) {
  const parentQuery = getParentQueryWithId([subjectID, unitID, topicID]);
  if (parentQuery.length === 0) {
    return [];
  }
  return Category.find({ ctype: 'concept', $and: parentQuery, }).sort('order');
}

// function getNotesInOrder(subjectID, unitID, topicID, conceptID) {
//   const parentQuery = getParentQueryWithId([subjectID,
//                                     unitID,
//                                     topicID,
//                                     conceptID]);
//   if (parentQuery.length === 0) {
//     return [];
//   }
//
//   return Category.find({ ctype: 'note', $and: parentQuery }).sort('order');
// }

function getAllChildNotes(catID, readOnly = false) {
  const formatCatID = typeof catID === 'string' ? ObjectID(catID) : catID;
  return getCategoryById(formatCatID).then(cat => {
    let noteParents = [cat._id];
    if (cat.parent) {
      noteParents = [...cat.parent, ...noteParents];
    }
    const childNotesQuery = { ctype: 'note', parent: { $all: noteParents, }, };
    if (readOnly) {
      return Note.find(childNotesQuery)
        .sort('order')
        .lean();
    }
    return Note.find(childNotesQuery).sort('order');
  });
}

const CategoryAssistant = {
  // getParentList: getParentIdList,
  getCategoryByName,
  // getParentQuery: getParentQuery,
  getParentQueryWithId,
  getCategoryById,
  getUnitsInOrder,
  getTopicsInOrder,
  getConceptsInOrder,
  // getNotesInOrder,
  getAllChildNotes,
  getNoteById,
  getNotesByIds,
};

export default CategoryAssistant;
