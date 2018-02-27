import PropTypes from 'prop-types';
import React from 'react';
import { ObjectId } from 'bson';
import { StatusRow } from 'hadron-react-components';
import InsertDocumentDialog from 'components/insert-document-dialog';
import DocumentListView from 'components/document-list-view';
import DocumentTableView from 'components/document-table-view';
import Toolbar from 'components/toolbar';

import './index.less';
import './ag-grid-dist.css';

/**
 * Component for the entire document list.
 */
class DocumentList extends React.Component {

  /**
   * Handle opening of the insert dialog.
   */
  handleOpenInsert() {
    this.props.openInsertDocumentDialog({ _id: new ObjectId(), '': '' }, false);
  }

  /**
   * Render the views for the document list.
   *
   * @returns {React.Component} The document list views.
   */
  renderViews() {
    if (this.props.view === 'List') {
      return (<DocumentListView {...this.props} />);
    }
    return (<DocumentTableView {...this.props} />);
  }

  /**
   * Render the list of documents.
   *
   * @returns {React.Component} The list.
   */
  renderContent() {
    if (this.props.error) {
      return (
        <StatusRow style="error">
          {this.props.error.message}
        </StatusRow>
      );
    }
    return (
      <div className="column-container">
        <div className="column main">
          {this.renderViews()}
        </div>
      </div>
    );
  }

  /**
   * Render the insert modal.
   *
   * @returns {React.Component} The insert modal.
   */
  renderInsertModal() {
    if (this.props.isEditable) {
      return (
        <InsertDocumentDialog
          closeInsertDocumentDialog={this.props.closeInsertDocumentDialog}
          insertDocument={this.props.insertDocument}
          version={this.props.version}
          {...this.props.insert} />
      );
    }
  }

  /**
   * Render the query bar.
   *
   * @returns {React.Component} The query bar.
   */
  renderQueryBar() {
    if (this.props.isExportable) {
      const QueryBar = global.hadronApp.appRegistry.getComponent('Query.QueryBar');
      return (<QueryBar buttonLabel="Find" />);
    }
  }

  /**
   * Render the document list.
   *
   * @returns {React.Component} The document list.
   */
  render() {
    return (
      <div className="content-container content-container-documents compass-documents">
        <div className="controls-container">
          {this.renderQueryBar()}
          <Toolbar
            readonly={!this.props.isEditable}
            insertHandler={this.handleOpenInsert.bind(this)}
            viewSwitchHandler={this.props.viewChanged}
            activeDocumentView={this.props.view}
            {...this.props} />
        </div>
        {this.renderContent()}
        {this.renderInsertModal()}
      </div>
    );
  }
}

DocumentList.displayName = 'DocumentList';

DocumentList.propTypes = {
  closeInsertDocumentDialog: PropTypes.func,
  error: PropTypes.object,
  insert: PropTypes.object,
  insertDocument: PropTypes.func,
  isEditable: PropTypes.bool.isRequired,
  isExportable: PropTypes.bool.isRequired,
  openInsertDocumentDialog: PropTypes.func,
  view: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
  viewChanged: PropTypes.func.isRequired
};

DocumentList.defaultProps = {
  error: null,
  view: 'List',
  version: '3.4.0',
  isEditable: true,
  insert: {}
};

export default DocumentList;
