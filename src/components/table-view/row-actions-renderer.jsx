const React = require('react');
const PropTypes = require('prop-types');

const clipboard = require('electron').clipboard;

const { IconButton } = require('hadron-react-buttons');

const BEM_BASE = 'table-view-row-actions';

/**
 * The row of buttons to be shown on mouse over.
 */
class RowActionsRenderer extends React.Component {
  constructor(props) {
    super(props);
    props.api.selectAll();
  }

  handleEdit() {
    this.props.context.addFooter(this.props.node, this.props.data, 'editing');
  }

  handleRemove() {
    this.props.context.addFooter(this.props.node, this.props.data, 'deleting');
  }

  handleClone() {
    this.props.context.handleClone(this.props.node);
  }

  handleCopy() {
    const documentJSON = JSON.stringify(this.props.data.hadronDocument.generateObject());
    clipboard.writeText(documentJSON);
  }

  renderTopLevelActions() {
    if (!this.props.nested) {
      return (
        <div>
          <IconButton
            title="Copy row"
            className={`${BEM_BASE}-panel-button btn btn-default btn-xs`}
            iconClassName={`${BEM_BASE}-button-icon fa fa-copy`}
            clickHandler={this.handleCopy.bind(this)} />
          <IconButton
            title="Clone row"
            className={`${BEM_BASE}-panel-button btn btn-default btn-xs`}
            iconClassName={`${BEM_BASE}-button-icon fa fa-clone`}
            clickHandler={this.handleClone.bind(this)} />
          <IconButton
            title="Delete row"
            className={`${BEM_BASE}-panel-button btn btn-default btn-xs`}
            iconClassName={`${BEM_BASE}-button-icon fa fa-trash-o`}
            clickHandler={this.handleRemove.bind(this)} />
        </div>
      );
    }
  }

  render() {
    /* Don't show actions for rows that are being edited or marked for deletion */
    if (this.props.value.state === 'editing' || this.props.value.state === 'deleting' || this.props.value.state === 'cloned') {
      return null;
    }

    /**
     * Logic dynamically updates the position of the actions panel, but prevents it from breaking off the viewpoint of the screen.
     */
    let left = 40;
    const columnHeaders = this.props.columnApi.getAllColumns();
    for (let i = 0; i < columnHeaders.length - 2; i++) {
      left = left + 200;
      if (left > window.innerWidth) {
        if (this.props.context.path.length === 0) {
          left = window.innerWidth - 95;
        } else {
          left = window.innerWidth - 30;
        }
      }
    }

    return (
      <div className={BEM_BASE} style={{left: `${left}px`}}>
        <div className={`${BEM_BASE}-panel`}>
        <IconButton
          title="Edit Document"
          className={`${BEM_BASE}-panel-button btn btn-default btn-xs`}
          iconClassName={`${BEM_BASE}-button-icon fa fa-pencil`}
          clickHandler={this.handleEdit.bind(this)} />
        {this.renderTopLevelActions()}
      </div>
    </div>
    );
  }
}

RowActionsRenderer.propTypes = {
  api: PropTypes.any,
  columnApi: PropTypes.any,
  value: PropTypes.any,
  node: PropTypes.any,
  context: PropTypes.any,
  data: PropTypes.any,
  nested: PropTypes.bool
};

RowActionsRenderer.displayName = 'RowActionsRenderer';

module.exports = RowActionsRenderer;
