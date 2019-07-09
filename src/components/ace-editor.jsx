import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Ace from 'react-ace';

import 'brace/mode/javascript';
import 'brace/mode/csharp';
import 'brace/mode/python';
import 'brace/mode/java';

import 'mongodb-ace-theme';

import styles from './ace-editor.less';

const EDITOR_COMMENT = '/** \n* Paste one or more documents here\n*/';

class AceEditor extends Component {
  /**
   * The component constructor.
   *
   * @param {Object} props - The properties.
   */
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.jsonDoc !== this.props.jsonDoc
    );
  }

  onChange(value) {
    this.props.updateJsonDoc(value.split('*/').pop());
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
    const value = `${EDITOR_COMMENT}${this.props.jsonDoc}`;

    return (
      <div className={queryStyle}>
        <Ace
          mode="javascript"
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

AceEditor.displayName = 'AceEditorComponent';

AceEditor.propTypes = {
  updateJsonDoc: PropTypes.func,
  jsonDoc: PropTypes.string
};

export default AceEditor;
