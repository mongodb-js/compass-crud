const Reflux = require('reflux');
const Actions = require('../actions');
const _ = require('lodash');

const MIXED = 'Mixed';

const GridStore = Reflux.createStore( {

  init: function() {
    this.columns = {};
    this.showing = {};
    this.stageRemove = {};
    this.listenTo(Actions.addColumn, this.addColumn.bind(this));
    this.listenTo(Actions.removeColumn, this.removeColumn.bind(this));
    this.listenTo(Actions.resetHeaders, this.resetColumns.bind(this));
    this.listenTo(Actions.cleanCols, this.cleanCols.bind(this));
    this.listenTo(Actions.elementAdded, this.elementAdded.bind(this));
    this.listenTo(Actions.elementRemoved, this.elementRemoved.bind(this));
    this.listenTo(Actions.elementMarkRemoved, this.elementMarkRemoved.bind(this));
    this.listenTo(Actions.elementTypeChanged, this.elementTypeChanged.bind(this));
    this.listenTo(Actions.renameColumn, this.renameColumn.bind(this));

    this.setShowing = this.setShowing.bind(this);
  },

  /**
   * Get the type of every element with key, or MIXED.
   *
   * @param {String} key - The column key.
   *
   */
  setShowing(key) {
    const types = Object.values(this.columns[key]);
    let type = types[0];
    for (let i = 0; i < types.length; i++) {
      if (type !== types[i]) {
        type = MIXED;
        break;
      }
    }
    this.showing[key] = type;
  },

  /**
   * Helper to add/remove elements from the stageRemove object, which tracks
   * if an element is marked as deleted but not actually removed. Needed because
   * we want to delete columns that are empty, but not if something is staged.
   * this.stagedRemove is a mapping of colId to objectId to boolean.
   *
   * @param {String} key - The column ID.
   * @param {String} oid - The OID string of the document.
   * @param {boolean} add - True if we are marking a field as deleted. False if
   * we are no longer tracking that field (either because it was actually
   * deleted or undo/cancel was clicked.
   */
  stageField(key, oid, add) {
    if (add) {
      if (!(key in this.stageRemove)) {
        this.stageRemove[key] = {};
      }
      this.stageRemove[key][oid] = true;
    } else if (key in this.stageRemove) {
      delete this.stageRemove[key][oid];
      if (_.isEmpty(this.stageRemove[key])) {
        delete this.stageRemove[key];
      }
    }
  },

  /**
   * Set the initial type for each column header.
   *
   * @param {Object} columns - A mapping of column names to a mapping of ObjectIds
   * to BSON types.
   */
  resetColumns(columns) {
    this.showing = {};
    this.stageRemove = {};
    this.columns = _.cloneDeep(columns);

    const columnNames = Object.keys(columns);
    for (let i = 0; i < columnNames.length; i++) {
      this.setShowing(columnNames[i]);
    }
  },

  /**
   * Rename a column. Right now only used for $new.
   * @param {String} oldKey
   * @param {String} newKey
   */
  renameColumn(oldKey, newKey) {
    if (!this.columns[newKey]) {
      return;
    }
    this.columns[newKey] = this.columns[oldKey];
    this.setShowing(newKey);
    if (this.stageRemove[oldKey]) {
      this.stageRemove[newKey] = true;
    }

    delete this.columns[oldKey];
    delete this.stageRemove[oldKey];
    delete this.showing[oldKey];
  },

  /**
   * After an update, go through and see if any columns are empty. If so,
   * delete them.
   */
  cleanCols() {
    console.log('GridStore: cleanCols');
    const toDel = [];

    const columnNames = Object.keys(this.showing);
    for (let i = 0; i < columnNames.length; i++) {
      const name = columnNames[i];
      console.log('checking col=' + name + ' in cols=' + (name in this.columns) + ' name in remove=' + (name in this.stageRemove));
      if (!(name in this.columns) && !(name in this.stageRemove)) {
        toDel.push(name);
        delete this.showing[name];
      }
    }
    if (toDel.length) {
      this.trigger({remove: {colIds: toDel}});
    }
  },

  /**
   * A new element has been added to a document. If the new type will change
   * the column header type, then trigger a change on the grid.
   *
   * @param {String} key - The newly added element's fieldname.
   * @param {String} type - The newly added element's type.
   * @param {String} oid - The ObjectId string of the parent document.
   */
  elementAdded(key, type, oid) {
    console.log('GridStore: ' + key + ' element added with type=' + type);
    console.log(this.columns);
    console.log(this.showing);
    let oldType = -1;

    if (!(key in this.columns)) {
      console.log('key missing from columns');
      this.columns[key] = {};
      this.columns[key][oid] = type;
      this.showing[key] = type;
    } else {
      console.log('key not missing from columns');
      this.columns[key][oid] = type;
      oldType = this.showing[key];
      console.log('oldType=' + oldType);
      if (Object.keys(this.columns[key]).length < 2) {
        console.log('set showing to type because 0 or 1');
        this.showing[key] = type;
      } else if (type !== oldType) {
        console.log('switching the type to mixed');
        this.showing[key] = MIXED;
      }
    }

    this.stageField(key, oid, false);

    if (oldType !== this.showing[key]) {
      const params = {updateHeaders: {showing: {}}};
      params.updateHeaders.showing[key] = this.showing[key];
      this.trigger(params);
    }
  },

  /**
   * A element has been marked as deleted from the column. Need to remove it
   * from this.columns/this.showing so that the header types will be updated
   * immediately, but add it to this.markedRemoved so that we don't remove
   * columns when there are still fields that are marked as deleted but not
   * fully removed.
   *
   * @param {String} key - The removed element's key.
   * @param {ObjectId} oid - The ObjectId of the parent element.
   */
  elementMarkRemoved(key, oid) {
    console.log('GridStore: ' + key + ' marked removed');
    delete this.columns[key][oid];
    const params = {};

    /* Need to track columns that are marked as deletion but not removed yet */
    this.stageField(key, oid, true);

    /* Update the headers */
    if (_.isEmpty(this.columns[key])) {
      delete this.columns[key];
    } else {
      const oldType = this.showing[key];
      if (oldType === MIXED) {
        this.setShowing(key);
      }
      if (oldType !== this.showing[key]) {
        params.updateHeaders = {showing: {}};
        params.updateHeaders.showing[key] = this.showing[key];
        this.trigger(params);
      }
    }
  },

  /**
   * A element has been deleted from the column. Can be deleted after being
   * marked for deletion or can just be deleted. If the type was mixed, and
   * there are other elements in the column, recalculate the header type.
   *
   * @param {String} key - The removed element's key.
   * @param {ObjectId} oid - The ObjectId of the parent element.
   */
  elementRemoved(key, oid) {
    console.log('GridStore: ' + key + ' removed');
    if (this.columns[key] && this.columns[key][oid]) {
      delete this.columns[key][oid];
    }
    const params = {};

    /* Need to track columns that are marked as deletion but not removed yet */
    this.stageField(key, oid, false);

    /* Update the headers */
    if (_.isEmpty(this.columns[key])) {
      delete this.columns[key];
      if (!(key in this.stageRemove)) {
        params.remove = {colIds: [key]};
        delete this.showing[key];
      }
    } else {
      const oldType = this.showing[key];
      if (oldType === MIXED) {
        this.setShowing(key);
      }

      if (oldType !== this.showing[key]) {
        params.updateHeaders = {showing: {}};
        params.updateHeaders.showing[key] = this.showing[key];
      }
    }

    if (!_.isEmpty(params)) {
      this.trigger(params);
    }
  },


  /**
   * The type of an element has changed. If the new type will change
   * the column header type, then trigger a change on the grid.
   *
   * @param {String} key - The newly added element's fieldname.
   * @param {String} type - The newly added element's type.
   * @param {ObjectId} oid - The ObjectId of the parent document.
   */
  elementTypeChanged(key, type, oid) {
    console.log('GridStore: ' + key + ' type changed');
    const oldType = this.showing[key];

    this.columns[key][oid] = type;

    if (type !== oldType) {
      if (oldType === MIXED) {
        this.setShowing(key);
      } else {
        this.showing[key] = (Object.keys(this.columns[key]).length === 1) ? type : MIXED;
      }
      if (oldType !== this.showing[key]) {
        const params = {updateHeaders: {showing: {}}};
        params.updateHeaders.showing[key] = this.showing[key];
        this.trigger(params);
      }
    }
  },

  /**
   * A new column must be added to the grid.
   *
   * @param {String} newColId - $new or the index of the column.
   * @param {String} columnBefore - The colId of the column to insert the new column after.
   * @param {Integer} rowIndex - The row index to start editing.
   * @param {Array} path - The series of fieldnames or indexes.
   * @param {Boolean} isArray - If we are inserting into an array.
   * @param {Boolean} editOnly - Don't actually add a column, just start editing
   * (for the case where we're adding to an array but the column already exists).
   * @param {String} oid - The string representation of the _id field of the row.
   */
  addColumn: function(newColId, columnBefore, rowIndex, path, isArray, editOnly, oid) {
    console.log('GridStore: ' + newColId + ' col added');
    const params = {
      edit: {
        colId: newColId, rowIndex: rowIndex
      }
    };
    if (!editOnly) {
      params.add = {
        newColId: newColId, colIdBefore: columnBefore, path: path, isArray: isArray, colType: ''
      };
    }
    /* If we're inserting into an array, need to update headers */
    if (isArray) {
      const currentMax = Object.keys(this.columns).length; //TODO: maxKey?
      const newShowing = {};
      this.columns[currentMax] = {};

      for (let index = currentMax; index > newColId; index--) {
        this.columns[index][oid] = this.columns[index - 1][oid];
        this.setShowing(index);
        newShowing[index] = this.showing[index];

        /* Update stagedRemove */
        this.stageField('' + index, oid, false);
        if ('' + (index - 1) in this.stageRemove) {
          if (oid in this.stageRemove['' + (index - 1)]) {
            this.stageField('' + index, oid, true);
          }
        }
      }
      if (newColId in this.columns) {
        delete this.columns[newColId][oid];
        if (_.isEmpty(this.columns[newColId])) {
          delete this.columns[newColId];
        } else {
          this.setShowing(newColId);
          params.add.colType = this.showing[newColId];
        }
      }

      this.stageField('' + newColId, oid, false);
      if (!_.isEmpty(newShowing)) {
        params.updateHeaders = { showing: newShowing };
      }
    }
    this.trigger(params);
  },

  /**
   * A column must be removed from the grid.
   *
   * @param {String} colId - The colId of the column to be removed.
   */
  removeColumn: function(colId) {
    console.log('GridStore: ' + colId + ' col removed');
    this.trigger({remove: {colIds: [colId]}});
  }
});

module.exports = GridStore;
