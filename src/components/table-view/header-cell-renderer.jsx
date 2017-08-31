const React = require('react');
const PropTypes = require('prop-types');

/**
  Custom cell renderer for the headers.
 */
class HeaderCellRenderer extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.isRowNumber) return null;
    return (
      <div className="table-view-header-cell">
        <b>{this.props.displayName}</b> {this.props.bsonType}
      </div>
    );
  }
}

HeaderCellRenderer.propTypes = {
  displayName: PropTypes.string.isRequired,
  bsonType: PropTypes.string,
  isRowNumber: PropTypes.bool
};

HeaderCellRenderer.displayName = 'HeaderCellRenderer';

module.exports = HeaderCellRenderer;
