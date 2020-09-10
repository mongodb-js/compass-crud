import HadronDocument from 'hadron-document';

import {
  getOriginalKeysAndValuesForFieldsThatWereUpdated,
  getSetUpdateForDocumentChanges,
  getUnsetUpdateForDocumentChanges
} from './document';

describe('document utils', () => {
  describe('#getSetUpdateForDocumentChanges', () => {
    context('when an element is removed', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).remove();
      });

      it('does not include the element in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({});
      });
    });

    context('when nothing is changed', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      it('returns an empty object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({});
      });
    });

    context('when an element is blank', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('');
      });

      it('does not include the element in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({});
      });
    });

    context('when an element is renamed', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('aa');
      });

      it('includes the element in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({
          aa: 'test'
        });
      });
    });

    context('when a nested element is edited', function() {
      const object = {
        name: {
          first: 'jimmy',
          last: 'hendrix'
        }
      };
      const doc = new HadronDocument(object);

      before(function() {
        doc.get('name').get('last').edit('aa');
      });

      it('includes the element in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({
          name: {
            first: 'jimmy',
            last: 'aa'
          }
        });
      });
    });

    context('when a nested element is renamed', function() {
      const object = {
        name: {
          first: 'jimmy',
          last: 'hendrix'
        }
      };
      const doc = new HadronDocument(object);

      before(function() {
        doc.get('name').get('last').rename('aa');
      });

      it('includes the element in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({
          name: {
            first: 'jimmy',
            aa: 'hendrix'
          }
        });
      });
    });

    context('when a nested element is removed', function() {
      const object = {
        name: {
          first: 'jimmy',
          last: 'hendrix'
        }
      };
      const doc = new HadronDocument(object);

      before(function() {
        doc.get('name').get('last').remove();
      });

      it('does includes the top level element in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({
          name: {
            first: 'jimmy'
          }
        });
      });
    });

    context('when the element is undefined', function() {
      it('returns an empty object', function() {
        expect(getSetUpdateForDocumentChanges(undefined)).to.deep.equal({});
      });
    });
  });

  describe('#getUnsetUpdateForDocumentChanges', () => {
    context('when an element is removed', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).remove();
      });

      it('includes the key in the object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({
          name: true
        });
      });
    });

    context('when nothing is changed', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      it('returns an empty object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({});
      });
    });

    context('when an element is blank', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('');
      });

      it('includes the original key in the object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({
          name: true
        });
      });
    });

    context('when an element is renamed', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('aa');
      });

      it('includes the original key in the object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({
          name: true
        });
      });
    });

    context('when a nested element is edited', function() {
      const object = {
        name: {
          first: 'jimmy',
          last: 'hendrix'
        }
      };
      const doc = new HadronDocument(object);

      before(function() {
        doc.get('name').get('last').edit('aa');
      });

      it('returns empty object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({});
      });
    });

    context('when a nested element is removed', function() {
      const object = {
        name: {
          first: 'jimmy',
          last: 'hendrix'
        }
      };
      const doc = new HadronDocument(object);

      before(function() {
        doc.get('name').get('last').remove();
      });

      it('does not include the element in the object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({});
      });
    });

    context('when the element is undefined', function() {
      it('returns an empty object', function() {
        expect(getUnsetUpdateForDocumentChanges(undefined)).to.deep.equal({});
      });
    });
  });

  // To test: getOriginalKeysAndValuesForFieldsThatWereUpdated
});
