const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const FontAwesome = require('react-fontawesome');

const { Tooltip } = require('hadron-react-components');
const TypeChecker = require('hadron-type-checker');

const initEditors = require('../editor/');
const Types = require('../types');
const AddFieldButton = require('./add-field-button');

// const util = require('util');

/**
 * The document value class.
 */
const VALUE_CLASS = 'editable-element-value';

/**
 * Invalid type class.
 */
const INVALID = `${VALUE_CLASS}-is-invalid-type`;

/**
 * The custom cell editor for the table view.
 */
class CellEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.element = this.props.value;
    this.wasEmpty = false;

    if (this.element === undefined) {
      this.wasEmpty = true;
      let key = this.props.column.colDef.headerName;
      if (key === '$New Field') {
        // TODO: adding a new field
        key = '';
      }
      let type = this.props.column.colDef.headerComponentParams.bsonType;
      if (type === 'mixed') {
        type = 'Undefined';
      }
      this.element = this.props.node.data.hadronDocument.insertEnd(key, '');
      const value = TypeChecker.cast(null, type);
      this.element.edit(value);
    }

    this._editors = initEditors(this.element);
    this.editor().start();
  }

  componentDidMount() {
    // this.props.reactContainer.addEventListener('keydown', this.onKeyDown);
    this.focus();
  }

  componentDidUpdate() {
    this.focus();
  }

  componentWillUnmount() {
    // this.props.reactContainer.removeEventListener('keydown', this.onKeyDown);
  }

  // /**
  //  * This is only required if you are preventing event propagation.
  //  * @param {Object} event
  //  */
  // handleKeyDown(event) {
  // }

  /**
   * AG-Grid API call to get final result of editing. Not being used because
   * changes are tracked with HadronDocument internally, so we don't need to
   * set it using the API (for now).
   *
   * @returns {*} The value that will be set.
   */
  getValue() {
    return this.element;
  }

  /**
   * AG-Grid API call to do a final check before closing the. Returning false
   * will cancel editing.
   */
  isCancelAfterEnd() {
    this.editor().complete();
  }

  /**
   * Determines if the editor can take up more space than just 1 cell.
   * @returns {boolean}
   */
  isPopup() {
    return true;
  }

  focus() {
    // TODO: why this?
    setTimeout(() => {
      const container = ReactDOM.findDOMNode(this.props.reactContainer);
      if (container) {
        container.focus();
      }
    });
  }

  handleAddField() {
    console.log('add field');
  }

  handleRemoveField() {
    console.log('remove field');
    if (this.element.isRemovable()) {
      this.element.remove();
      if (this.wasEmpty) {
        this.element = undefined; // return state to undefined
      }
      this.props.api.stopEditing();
    }
  }

  handleDrillDown() {
    console.log('drill down');
  }

  handleChange(event) {
    if (this._pasting) {
      this._pasteEdit(event.target.value);
    } else {
      this.editor().edit(event.target.value);
    }
    this.forceUpdate();
  }

  handlePaste() {
    this._pasting = true;
  }

  /**
   * Edit the field value when using copy/paste.
   *
   * @param {String} value - The value to paste in.
   */
  _pasteEdit(value) {
    try {
      this.editor().paste(value);
    } catch (e) {
      this.editor().edit(value);
    } finally {
      this._pasting = false;
    }
  }

  /**
   * Get the editor for the current type.
   *
   * @returns {Editor} The editor.
   */
  editor() {
    return this._editors[this.element.currentType] || this._editors.Standard;
  }

  /**
   * Get the style for the value of the element.
   *
   * @returns {String} The value style.
   */
  style() {
    let typeClass = `${VALUE_CLASS}-is-${this.element.currentType.toLowerCase()}`;
    if (!this.element.isCurrentTypeValid()) {
      typeClass = `${typeClass} ${INVALID}`;
    }
    return `${VALUE_CLASS} ${VALUE_CLASS}-is-editing ${typeClass}`;
  }

  /**
   * Get the style for the input wrapper.
   *
   * @returns {String} The class name.
   */
  wrapperStyle() {
    return `${VALUE_CLASS}-wrapper ${VALUE_CLASS}-wrapper-is-${this.element.currentType.toLowerCase()}`;
  }

  /**
   * Render the types column.
   *
   * @returns {React.Component} The component.
   */
  renderTypes() {
    return (
      <Types element={this.element} className="table-view-cell-editor"/>
    );
  }

  /**
   * Render the input field.
   *
   * @returns {React.Component} The component.
   */
  renderInput() {
    if (this.element.currentType !== 'Object' && this.element.currentType !== 'Array') {
      const length = 120; // TODO: styles
      return (
        <span className={this.wrapperStyle()}>
          <Tooltip
            id={this.element.uuid}
            className="editable-element-value-tooltip"
            border
            getContent={() => { return this.element.invalidTypeMessage; }}/>
          <input
            data-tip=""
            data-for={this.element.uuid}
            ref={(c) => {this._node = c;}}
            type="text"
            style={{ width: `${length}px` }}
            className={this.style()}
            onChange={this.handleChange.bind(this)}
            // onKeyDown={this.handleKeyDown.bind(this)}
            onPaste={this.handlePaste.bind(this)}
            value={this.editor().value(true)}/>
        </span>
      );
    }
    return null;
  }

  renderDrillDown() {
    if (this.element.currentType === 'Object' || this.element.currentType === 'Array') {
      return (
        <div
          className="table-view-button"
          onClick={this.handleDrillDown}
        >
          <FontAwesome name="forward" className="table-view-cell-editor-button-icon"/>
        </div>
      );
    }
    return null;
  }

  /**
   * Render the add field/delete field buttons. If the element is an object or
   * an array, provide a "drill down" button.
   *
   * @returns {React.Component} The component.
   */
  renderActions() {
    return (
      <span className="table-view-cell-editor-actions">
        {this.renderDrillDown()}
        <AddFieldButton element={this.element} />
        <div
        className="table-view-button"
        onClick={this.handleRemoveField.bind(this)}
        >
          <FontAwesome name="trash" className="table-view-cell-editor-button-icon"/>
        </div>
      </span>
    );
  }

  render() {
    return (
      <div className="table-view-cell-editor">
        {this.renderInput()}
        {this.renderTypes()}
        {this.renderActions()}
      </div>
    );
  }
}

CellEditor.propTypes = {
  reactContainer: PropTypes.any,
  value: PropTypes.any,
  column: PropTypes.any,
  node: PropTypes.any,
  api: PropTypes.any
};

CellEditor.displayName = 'CellEditor';

module.exports = CellEditor;
