
const getSetUpdateKeyValuePairsForElementChanges = (path, currentElement) => {
  const pairs = [];

  const currentPath = `${path}${currentElement.currentKey}`;
  // todo element is object
  if (currentElement.elements && !currentElement.currentType === 'Array') {
    for (const element of currentElement.elements) {
      if (
        !element.isRemoved()
        && element.currentKey !== ''
        && element.isModified()
      ) {
        const updatedNestedKeyValuePairs = getSetUpdateKeyValuePairsForElementChanges(`${currentPath}.`, element);
        pairs.push(...updatedNestedKeyValuePairs);

        // Include the full modified element. This way if a nested field
        // has been altered (changed/added/removed) it is set at the top
        // most level and exists in the set update document.
        // object[element.currentKey] =

        // TODO: This should build strings from each nested object change.
        // full replace arrays.
      }
    }
  } else {
    pairs.push([
      currentPath,
      currentElement.currentValue
    ]);
  }

  return pairs;
};

export const getSetUpdateForDocumentChanges = (doc) => {
  const object = {};

  if (doc.elements) {
    for (const element of doc.elements) {
      if (
        !element.isRemoved()
        && element.currentKey !== ''
        && element.isModified()
      ) {
        const updatedKeyValuePairs = getSetUpdateKeyValuePairsForElementChanges('', element);
        updatedKeyValuePairs.forEach((pair) => {
          object[pair[0]] = pair[1];
        });
        // Include the full modified element. This way if a nested field
        // has been altered (changed/added/removed) it is set at the top
        // most level and exists in the set update document.
        // object[element.currentKey] =

        // TODO: This should build strings from each nested object change.
        // full replace arrays
      }
    }
  }
  return object;
};

const getUnsetUpdateKeysForElementChanges = (path, currentElement) => {
  const unsetKeys = [];

  const currentPath = `${path}${currentElement.key}`;

  // todo element is object
  if (currentElement.elements && !currentElement.currentType === 'Array') {
    for (const element of currentElement.elements) {
      if (element.isModified() && element.currentKey !== '') {
        const updatedNestedKeyValuePairs = getSetUpdateKeyValuePairsForElementChanges(`${currentPath}.`, element);
        unsetKeys.push(...updatedNestedKeyValuePairs);

        // Include the full modified element. This way if a nested field
        // has been altered (changed/added/removed) it is set at the top
        // most level and exists in the set update document.
        // object[element.currentKey] =
      }
    }
  } else if (currentElement.isRemoved() && currentElement.currentKey !== '') {
    unsetKeys.push(currentPath);
  } else if (currentElement.isRenamed()) {
    // Unset/remove the old key/value in the document.
    unsetKeys.push(currentPath);
  }

  return unsetKeys;
};

export const getUnsetUpdateForDocuments = (doc) => {
  const object = {};

  if (doc.elements) {
    for (const element of doc.elements) {
      // If an element is modified it could be removed/renamed, have a child
      // that is removed or renamed, or it could have had a value change.
      if (element.isModified() && element.currentKey !== '') {
        const updatedKeyValuePairs = getUnsetUpdateKeysForElementChanges('', element);
        updatedKeyValuePairs.forEach((pair) => {
          object[pair[0]] = pair[1];
        });

        // Include the full modified element. This way if a nested field
        // has been altered (changed/added/removed) it is set at the top
        // most level and exists in the set update document.
        // object[element.currentKey] =

        // TODO: This should build strings from each nested object change.
        // full replace arrays
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

  if (doc.elements) {
    for (const element of doc.elements) {
      if (element.isModified()) {
        // Using `.key` instead of `.currentKey` to ensure we look at
        // the original field's value.
        object[element.key] = element.generateOriginalObject();
      }
    }
  }

  return object;
};

