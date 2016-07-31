const Collection = require('../db/collection');
const Category = Collection.Category;

function getParentIdList(parentCategories) {
  return parentCategories.map(function(obj) {
    if(obj && obj.hasOwnProperty("_id")) {
      return obj._id;
    } else {
      return null;
    }
  });
}

function getCategoryByName(catLabel, catName) {
  return Category.findOne({ctype:catLabel, ckey: catName});
}

function getParentQuery(parentCategories) {
  let parentQuery = [{parent: getParentIdList(parentCategories)}];
  return parentQuery;
}

function getParentQueryWithId(parentCategoriesIds) {
  return [{parent: parentCategoriesIds}];
}

function getCategoryById(catId) {
  return Category.findById(catId);
}

function getUnitsInOrder(subject) {
  let parentQuery = getParentQuery([subject]);
  if(parentQuery.length == 0) {
    return [];
  }

  return Category.find({ctype: 'unit', $and: parentQuery}).sort('order');
}

function getTopicsInOrder(subject, unit) {
  let parentQuery = getParentQuery([subject,
                                    unit]);
  if(parentQuery.length == 0) {
    return [];
  }

  return Category.find({ctype: 'topic', $and: parentQuery}).sort('order');
}

function getConceptsInOrder(subject, unit, topic) {
  let parentQuery = getParentQuery([subject,
                                    unit,
                                    topic]);
  if(parentQuery.length == 0) {
    return [];
  }

  return Category.find({ctype: 'concept', $and: parentQuery}).sort('order');
}

function getNotesInOrder(subject, unit, topic, concept) {
  let parentQuery = getParentQuery([subject,
                                    unit,
                                    topic,
                                    concept]);
  if(parentQuery.length == 0) {
    return [];
  }

  return Category.find({ctype: 'note', $and: parentQuery}).sort('order');
}

let DBAssistant = {
  getParentList: getParentIdList,
  getCategoryByName: getCategoryByName,
  getParentQuery: getParentQuery,
  getParentQueryWithId: getParentQueryWithId,
  getCategoryById: getCategoryById,
  getUnitsInOrder: getUnitsInOrder,
  getTopicsInOrder: getTopicsInOrder,
  getConceptsInOrder: getConceptsInOrder,
  getNotesInOrder: getNotesInOrder
}

module.exports = DBAssistant;
