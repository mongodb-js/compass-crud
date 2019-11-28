import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Ace from 'react-ace';

import 'brace/ext/language_tools';
import 'mongodb-ace-mode';
import 'mongodb-ace-theme';

import 'brace/mode/json';

import styles from './insert-json-document.less';

const EDITOR_COMMENT = '/** \n* Paste one or more documents here\n*/\n';

class InsertJsonDocument extends Component {
  /**
   * The component constructor.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
    this.state = { isCommentNeeded: true };
  }

  shouldComponentUpdate(nextProps) {
    return (nextProps.jsonDoc !== this.props.jsonDoc);
  }

  onChange(value) {
    if (!value.includes(EDITOR_COMMENT)) {
      this.setState({ isCommentNeeded: false });
    }

    this.props.updateJsonDoc(value.split('*/\n').pop());
  }

  render() {
    const OPTIONS = {
      tabSize: 2,
      fontSize: 11,
      minLines: 2,
      maxLines: Infinity,
      showGutter: true,
      readOnly: false,
      highlightActiveLine: true,
      highlightGutterLine: true,
      useWorker: false
    };

    const queryStyle = classnames(styles.editor);
    let value = this.props.jsonDoc;

    if (this.state.isCommentNeeded) {
      value = `${EDITOR_COMMENT}${this.props.jsonDoc}`;
    }

    return (
      <div className={queryStyle}>
        <Ace
          mode="json"
          defaultValue={EDITOR_COMMENT}
          value={value}
          onChange={this.onChange.bind(this)}
          theme="mongodb"
          width="100%"
          editorProps={{$blockScrolling: Infinity}}
          setOptions={OPTIONS}
          onLoad={(editor) => { this.editor = editor; }}/>
      </div>
    );
  }
}

InsertJsonDocument.displayName = 'InsertJsonDocumentComponent';

InsertJsonDocument.propTypes = {
  updateJsonDoc: PropTypes.func,
  jsonDoc: PropTypes.string
};

export default InsertJsonDocument;
