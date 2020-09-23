
/**
 * Generate an $set javascript object, that can be used in update operations to
 * set the changes which have occured in the document since it was loaded.
 *
 * @param {Document} doc - The hadron document.
 *
 * @returns {Object} The javascript update object.
**/
export const getSetUpdateForDocumentChanges = (doc) => {
  const object = {};

  if (doc && doc.elements) {
    for (const element of doc.elements) {
      if (
        !element.isRemoved()
        && element.currentKey !== ''
        && element.isModified()
      ) {
        // Include the full modified element.
        // We don't individually set nested fields because we can't guarantee a
        // path to the element using '.' dot notation will update
        // the correct field, because field names can contain dots as of 3.6.
        // When a nested field has been altered (changed/added/removed) it is
        // set at the top level field. This means we overwrite possible
        // background changes that occur within sub documents.
        object[element.currentKey] = element.generateObject();
      }
    }
  }
  return object;
};

/**
 * Generate an $unset javascript object, that can be used in update
 * operations, with the removals from the document.
 *
 * @param {Document} doc - The hadron document.
 *
 * @returns {Object} The javascript update object.
**/
export const getUnsetUpdateForDocumentChanges = (doc) => {
  const object = {};

  if (doc && doc.elements) {
    for (const element of doc.elements) {
      if (!element.isAdded() && element.isRemoved() && element.key !== '') {
        object[element.key] = true;
      }
      if (!element.isAdded() && element.isRenamed() && element.key !== '') {
        // Remove the original field when an element is renamed.
        object[element.key] = true;
      }
    }
  }
  return object;
};

/**
 * Generate the query javascript object reflecting the elements that
 * were updated in this document. The values of this object are the original
 * values, this can be used when querying for an update to see if the original
 * document was changed in the background while it was being updated elsewhere.
 *
 * @param {Object} doc - The hadron document.
 *
 * @returns {Object} The javascript object.
 */
export const getOriginalKeysAndValuesForFieldsThatWereUpdated = (doc) => {
  const object = {};

  if (doc && doc.elements) {
    for (const element of doc.elements) {
      if (element.isModified() && !element.isAdded()) {
        // Using `.key` instead of `.currentKey` to ensure we look at
        // the original field's value.
        object[element.key] = element.generateOriginalObject();
      }
      if (element.isAdded() && element.currentKey !== '') {
        // Using `.currentKey` to ensure we see if the new field was
        // added with a different value in the background.
        object[element.currentKey] = element.generateOriginalObject();
      }
    }
  }

  return object;
};

