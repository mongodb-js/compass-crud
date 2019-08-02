import React from 'react';
import PropTypes from 'prop-types';
import DocumentFooter from 'components/document-footer';
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
import DocumentActions from 'components/document-actions';
import RemoveDocumentFooter from 'components/remove-document-footer';

hljs.registerLanguage('javascript', javascript);

/**
 * The base class.
 */
const BASE = 'json';

/**
 * The contents class.
 */
const CONTENTS = `${BASE}-contents`;

/**
 * The test id.
 */
const TEST_ID = 'editable-json';

/**
 * Component for a single editable document in a list of json documents.
 */
class EditableJson extends React.Component {
  /**
   * The component constructor.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      deleting: false,
      deleteFinished: false,
      expandAll: false
    };

    this.boundForceUpdate = this.forceUpdate.bind(this);
    this.boundHandleCancel = this.handleCancel.bind(this);
    this.boundHandleUpdateSuccess = this.handleUpdateSuccess.bind(this);
    this.boundHandleRemoveSuccess = this.handleRemoveSuccess.bind(this);
  }

  /**
   * Subscribe to the update store on mount.
   */
  // componentDidMount() {
  //   this.subscribeToDocumentEvents(this.props.doc);
  // }

  /**
   * Refreshing the list updates the doc in the props so we should update the
   * json document on the instance.
   *
   * @param {Object} prevProps - The previous props.
   */
  // componentDidUpdate(prevProps) {
  //   if (prevProps.doc !== this.props.doc) {
  //     this.unsubscribeFromDocumentEvents(prevProps.doc);
  //     this.subscribeToDocumentEvents(this.props.doc);
  //   }
  // }

  /**
   * Unsubscribe from the update store on unmount.
   */
  // componentWillUnmount() {
  //   this.unsubscribeFromDocumentEvents(this.props.doc);
  // }


  /**
   * Fires when the json document update was successful.
   */
  handleUpdateSuccess() {
    if (this.state.editing) {
      setTimeout(() => {
        this.setState({ editing: false });
      }, 500);
    }
  }

  /**
   * Handle the successful remove.
   */
  handleRemoveSuccess() {
    if (this.state.deleting) {
      setTimeout(() => {
        this.setState({ deleting: false, deleteFinished: true });
      }, 500);
    }
  }

  /**
   * Handles canceling edits to the json document.
   */
  handleCancel() {
    this.setState({ editing: false });
  }

  /**
   * Handle copying JSON to clipboard of the json document.
   */
  handleCopy() {
    this.props.copyToClipboard(this.props.doc);
  }

  /**
   * Handle cloning of the json document.
   */
  handleClone() {
    this.props.openInsertDocumentDialog(this.props.doc.generateObject(), true);
  }

  /**
   * Handles json document deletion.
   */
  handleDelete() {
    this.setState({
      deleting: true,
      editing: false
    });
  }

  /**
   * Handles canceling a delete.
   */
  handleCancelRemove() {
    this.setState({ deleting: false, deleteFinished: false });
  }

  /**
   * Handle the edit click.
   */
  handleEdit() {
    this.setState({ editing: true });
  }

  /**
   * Get the current style of the json document div.
   *
   * @returns {String} The json document class name.
   */
  style() {
    let style = BASE;
    if (this.state.editing) {
      style = style.concat(' json-document-is-editing');
    }
    if (this.state.deleting && !this.state.deleteFinished) {
      style = style.concat(' json-document-is-deleting');
    }
    return style;
  }

  /**
   * Render the actions component.
   *
   * @returns {Component} The actions component.
   */
  renderActions() {
    if (!this.state.editing && !this.state.deleting) {
      return (
        <DocumentActions
          allExpanded={this.state.expandAll}
          edit={this.handleEdit.bind(this)}
          copy={this.handleCopy.bind(this)}
          remove={this.handleDelete.bind(this)}
          clone={this.handleClone.bind(this)}/>
      );
    }
  }

  /**
   * Render Parsed and prettified view of json documents
   *
   * @returns {Component} The footer component.
   */
  renderJson() {
    return (
      hljs.highlight('javascript', JSON.stringify(this.props.doc.generateObject())).value
    );
  }


  /**
   * Render the footer component.
   *
   * @returns {Component} The footer component.
   */
  renderFooter() {
    if (this.state.editing) {
      return (
        <DocumentFooter
          doc={this.props.doc}
          updateDocument={this.props.updateDocument} />
      );
    } else if (this.state.deleting) {
      return (
        <RemoveDocumentFooter
          doc={this.props.doc}
          removeDocument={this.props.removeDocument}
          cancelHandler={this.handleCancelRemove.bind(this)} />
      );
    }
  }

  /**
   * Render a single document list item.
   *
   * @returns {React.Component} The component.
   */
  render() {
    return (
      <div className={this.style()} data-test-id={TEST_ID}>
        <div className={CONTENTS}>
          {this.renderJson()}
          {this.renderActions()}
        </div>
        {this.renderFooter()}
      </div>
    );
  }
}

EditableJson.displayName = 'EditableJson';

EditableJson.propTypes = {
  doc: PropTypes.object.isRequired,
  removeDocument: PropTypes.func.isRequired,
  updateDocument: PropTypes.func.isRequired,
  version: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  tz: PropTypes.string,
  expandAll: PropTypes.bool,
  openInsertDocumentDialog: PropTypes.func.isRequired,
  openImportFileDialog: PropTypes.func.isRequired,
  copyToClipboard: PropTypes.func.isRequired
};

export default EditableJson;
