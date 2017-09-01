const React = require('react');
const PropTypes = require('prop-types');

/**
  Custom cell renderer for the headers.
 */
class HeaderCellRenderer extends React.Component {

  constructor(props) {
    super(props);
    // this.state = {
    //   columns: props.columns,
    //   key: props.key,
    //   type: props.type
    // };
    // mapping of column names to type

  //  componentDidMount() {
  //    // bind typeChanged to some event
  //  }

 // typeChanged(key, type) {
 //   if (this.state.columns[key] !== type) {
 //     this.setState({type: 'mixed'});
 //   }
 // }
  }

  render() {
    if (this.props.isRowNumber) return null;
    return (
      <div className="table-view-header-cell">
        <b>{this.props.name}</b> {this.props.type}
      </div>
    );
  }
}

HeaderCellRenderer.propTypes = {
  displayName: PropTypes.string.isRequired,
  name: PropTypes.string,
  isRowNumber: PropTypes.bool,
  type: PropTypes.string
};

HeaderCellRenderer.displayName = 'HeaderCellRenderer';

module.exports = HeaderCellRenderer;
