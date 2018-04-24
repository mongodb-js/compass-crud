import React from 'react';
import { shallow } from 'enzyme';
import HadronDocument from 'hadron-document';
import DocumentListView from 'components/document-list-view';

describe('<DocumentListView />', () => {
  describe('#render', () => {
    context('when the documents have objects for ids', () => {
      const docs = [{ _id: { name: 'test-1' }}, { _id: { name: 'test-2' }}];
      const hadronDocs = docs.map(doc => new HadronDocument(doc));
      const component = shallow(
        <DocumentListView
          docs={hadronDocs}
          version="3.6.0"
          isEditable={false}
          removeDocument={sinon.spy()}
          updateDocument={sinon.spy()}
          openInsertDocumentDialog={sinon.spy()} />
      );

      it('renders all the documents', () => {
        const wrapper = component.find('.document');
        expect(wrapper).to.have.length(2);
      });
    });
  });
});
