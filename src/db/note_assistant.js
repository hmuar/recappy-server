import { Category } from '../db/collection';

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
  return Category.findOne({ctype:catLabel, ckey: catName});
}

// function getParentQuery(parentCategories) {
//   let parentQuery = [{parent: getParentIdList(parentCategories)}];
//   return parentQuery;
// }

function getParentQueryWithId(parentCategoriesIds) {
  return [{parent: parentCategoriesIds}];
}

function getCategoryById(catId) {
  return Category.findById(catId);
}

function getUnitsInOrder(subjectID) {
  let parentQuery = getParentQueryWithId([subjectID]);
  if(parentQuery.length == 0) {
    return [];
  }
  return Category.find({ctype: 'unit', $and: parentQuery}).sort('order');
}

function getTopicsInOrder(subjectID, unitID) {
  let parentQuery = getParentQueryWithId([subjectID,
                                    unitID]);
  if(parentQuery.length == 0) {
    return [];
  }
  return Category.find({ctype: 'topic', $and: parentQuery}).sort('order');
}

function getConceptsInOrder(subjectID, unitID, topicID) {
  let parentQuery = getParentQueryWithId([subjectID,
                                    unitID,
                                    topicID]);
  if(parentQuery.length == 0) {
    return [];
  }
  return Category.find({ctype: 'concept', $and: parentQuery}).sort('order');
}

function getNotesInOrder(subjectID, unitID, topicID, conceptID) {
  let parentQuery = getParentQueryWithId([subjectID,
                                    unitID,
                                    topicID,
                                    conceptID]);
  if(parentQuery.length == 0) {
    return [];
  }

  return Category.find({ctype: 'note', $and: parentQuery}).sort('order');
}

let NoteAssistant = {
  // getParentList: getParentIdList,
  getCategoryByName,
  // getParentQuery: getParentQuery,
  getParentQueryWithId,
  getCategoryById,
  getUnitsInOrder,
  getTopicsInOrder,
  getConceptsInOrder,
  getNotesInOrder
}

export default NoteAssistant;
