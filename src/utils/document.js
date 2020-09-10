
/**
 * Generate a javascript object reflecting the updates from the document.
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
        // Include the full modified element. This way if a nested field
        // has been altered (changed/added/removed) it is set at the top
        // most level and exists in the set update document.
        // We don't dive into nested objects because we can't gaurantee a
        // path to the element using '.' dot notation will update
        // the correct field, because field names can now contain dots.
        object[element.currentKey] = element.generateObject();
      }
    }
  }
  return object;
};

/**
 * Generate a javascript object reflecting the removals from the document.
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
 * Generate the javascript object reflecting the elements that
 * were updated in this document. The values of this object are the original
 * values, this can be useful when seeing if the original document
 * was changed in the background while it was being updated elsewhere.
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
    }
  }

  return object;
};

