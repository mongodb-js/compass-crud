const PropTypes = require('prop-types');
const React = require('react');
const ObjectId = require('bson').ObjectId;
const { StatusRow } = require('hadron-react-components');
const InsertDocumentDialog = require('./insert-document-dialog');
const DocumentListView = require('./document-list-view');
const DocumentTableView = require('./document-table-view');
const Toolbar = require('./toolbar');

/**
 * Component for the entire document list.
 */
class DocumentList extends React.Component {

  /**
   * The component constructor.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
    const appRegistry = global.hadronApp.appRegistry;
    this.queryBar = appRegistry.getComponent('Query.QueryBar');
  }

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
   * Render the document list.
   *
   * @returns {React.Component} The document list.
   */
  render() {
    return (
      <div className="content-container content-container-documents compass-documents">
        <div className="controls-container">
          <this.queryBar buttonLabel="Find" />
          <Toolbar
            readonly={!this.props.isEditable}
            insertHandler={this.handleOpenInsert.bind(this)}
            viewSwitchHandler={this.props.viewChanged}
            activeDocumentView={this.props.view}
            {...this.props} />
        </div>
        {this.renderContent()}
        <InsertDocumentDialog
          closeInsertDocumentDialog={this.props.closeInsertDocumentDialog}
          closeAllMenus={this.props.closeAllMenus}
          insertDocument={this.props.insertDocument}
          {...this.props.insert} />
      </div>
    );
  }
}

DocumentList.displayName = 'DocumentList';

DocumentList.propTypes = {
  closeAllMenus: PropTypes.func.isRequired,
  closeInsertDocumentDialog: PropTypes.func.isRequired,
  error: PropTypes.object,
  insert: PropTypes.object.isRequired,
  insertDocument: PropTypes.func.isRequired,
  isEditable: PropTypes.bool.isRequired,
  openInsertDocumentDialog: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  viewChanged: PropTypes.func.isRequired
};

DocumentList.defaultProps = {
  error: null,
  view: 'List',
  isEditable: true,
  insert: {}
};

DocumentList.Document = Document;

module.exports = DocumentList;
