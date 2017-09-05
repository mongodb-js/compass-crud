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
    let displayName = this.props.displayName;
    if (this.props.isRowNumber) {
      return null;
    }
    if (this.props.displayName === '$new') {
      displayName = 'New Field';
    }
    return (
      <div className="table-view-header-cell">
        <b>{displayName}</b> {this.props.bsonType}
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
