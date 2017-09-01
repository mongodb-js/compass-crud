const React = require('react');
const PropTypes = require('prop-types');
const HadronDocument = require('hadron-document');
const Element = require('./element');
const ExpansionBar = require('./expansion-bar');
const marky = require('marky');

/**
 * The base class.
 */
const BASE = 'document';

/**
 * The elements class.
 */
const ELEMENTS = `${BASE}-elements`;

/**
 * The initial field limit.
 */
const INITIAL_FIELD_LIMIT = 25;

/**
 * The test id.
 */
const TEST_ID = 'readonly-document';

/**
 * Component for a single readonly document in a list of documents.
 */
class ReadonlyDocument extends React.Component {

  /**
   * Initialize the readonly document.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
    this.doc = new HadronDocument(props.doc);
    this.state = {
      renderSize: INITIAL_FIELD_LIMIT
    };
  }

  setRenderSize(newLimit) {
    marky.mark('ReadonlyDocument - Show/Hide N fields');
    this.setState({
      renderSize: newLimit
    }, () => {
      marky.stop('ReadonlyDocument - Show/Hide N fields');
    });
  }

  /**
   * Get the elements for the document.
   *
   * @returns {Array} The elements.
   */
  renderElements() {
    const components = [];
    let index = 0;
    for (const element of this.doc.elements) {
      components.push((
        <Element
          key={element.uuid}
          element={element}
          expandAll={this.props.expandAll}
        />
      ));
      index++;
      if (index >= this.state.renderSize) {
        break;
      }
    }
    return components;
  }

  /**
   * Render the expander bar.
   *
   * @returns {React.Component} The expander bar.
   */
  renderExpansion() {
    const totalSize = this.doc.elements.size;
    return (
      <ExpansionBar
        initialSize={INITIAL_FIELD_LIMIT}
        renderSize={this.state.renderSize}
        setRenderSize={this.setRenderSize.bind(this)}
        totalSize={totalSize}
      />
    );
  }

  /**
   * Render a single document list item.
   *
   * @returns {React.Component} The component.
   */
  render() {
    return (
      <div className={BASE} data-test-id={TEST_ID}>
        <ol className={ELEMENTS}>
          {this.renderElements()}
          {this.renderExpansion()}
        </ol>
      </div>
    );
  }
}

ReadonlyDocument.displayName = 'ReadonlyDocument';

ReadonlyDocument.propTypes = {
  doc: PropTypes.object.isRequired,
  expandAll: PropTypes.bool
};

module.exports = ReadonlyDocument;
