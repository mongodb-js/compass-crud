const HadronDocument = require('hadron-document');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const getApi = function() {
  return {
    selectAll: sinon.spy(),
    startEditingCell: sinon.spy(),
    stopEditing: sinon.spy()
  };
};

const getActions = function() {
  return {
    addColumn: sinon.spy(),
    removeColumn: sinon.spy(),
    cleanCols: sinon.spy(),
    resetHeaders: sinon.spy(),
    elementAdded: sinon.spy(),
    elementRemoved: sinon.spy(),
    elementMarkRemoved: sinon.spy(),
    elementTypeChanged: sinon.spy(),
    getNextPage: sinon.spy(),
    getPrevPage: sinon.spy(),
    pathChanged: sinon.spy(),
    drillDown: sinon.spy()
  };
};

const getRowNode = function(doc, id) {
  if (!id) {
    id = '1';
  }
  doc._id = id;
  return {
    data: {
      hadronDocument: new HadronDocument(doc),
      isFooter: false,
      hasFooter: false,
      state: null,
      rowNumber: 0
    },
    childIndex: 2
  };
};

const getColumn = function(colId, colDef) {
  return {
    getColId: () => { return colId; },
    getColDef: () => { return colDef; }
  };
};

const getColumnApi = function(columns) {
  return {
    getAllColumns: () => { return columns; }
  };
};

const getContext = function(path) {
  return {
    path: path,
    removeFooter: sinon.spy(),
    handleUpdate: sinon.spy(),
    handleRemove: sinon.spy()
  };
};

const getDataService = function(done) {
  const foarSpy = sinon.spy();
  const iSpy = sinon.spy();
  const dSpy = sinon.spy();
  return {
    foarSpy: foarSpy,
    findOneAndReplace: (ns, filter, obj, prefs, callback) => {
      foarSpy(filter, obj);
      callback(null, obj);
      done();
    },
    iSpy: iSpy,
    insertOne: (ns, obj, prefs, callback) => {
      iSpy(obj);
      callback(null);
      done();
    },
    dSpy: dSpy,
    deleteOne: (ns, filter, prefs, callback) => {
      dSpy(filter);
      callback(null, 1);
      done();
    }
  };
};

const notCalledExcept = function(spies, except) {
  for (const action in spies) {
    if (except.indexOf(action) < 0 && action !== 'selectAll' && action !== 'path') {
      expect(spies[action].called).to.equal(false);
    }
  }
};

module.exports = {
  getNode: getRowNode,
  getApi: getApi,
  getColumn: getColumn,
  getActions: getActions,
  getColumnApi: getColumnApi,
  getContext: getContext,
  getDataService: getDataService,
  notCalledExcept: notCalledExcept
};
