import Reflux from 'reflux';

const configureActions = () => {
  const actions = Reflux.createActions([
    'addColumn',
    'cleanCols',
    'closeInsertDocumentDialog',
    'copyToClipboard',
    'documentRemoved',
    'drillDown',
    'elementAdded',
    'elementMarkRemoved',
    'elementRemoved',
    'elementTypeChanged',
    'getNextPage',
    'getPrevPage',
    'insertDocument',
    'openInsertDocumentDialog',
    'openImportFileDialog',
    'pathChanged',
    'refreshDocuments',
    'removeDocument',
    'removeColumn',
    'renameColumn',
    'replaceDoc',
    'resetHeaders',
    'updateDocument',
    'viewChanged'
  ]);

  return actions;
};

export default configureActions;
