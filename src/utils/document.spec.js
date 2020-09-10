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

    context('when an element is named empty string', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('');
      });

      it('does not include the change in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({ });
      });
    });

    context('when an added element is named empty string', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.insertEnd('aa', '333');
        doc.elements.at(1).rename('');
      });

      it('does not include the change in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({ });
      });
    });

    context('when an element is added', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(() => {
        doc.insertEnd('pineapple', 'hat');
      });

      it('includes the change in the object', function() {
        expect(getSetUpdateForDocumentChanges(doc)).to.deep.equal({
          pineapple: 'hat'
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

    context('when the document is undefined', function() {
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

    context('when an element is renamed empty string', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('');
      });

      it('has the original key in the object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({
          name: true
        });
      });
    });

    context('when an added element is named empty string', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.insertEnd('aa', '333');
        doc.elements.at(1).rename('');
      });

      it('does not include the change in the object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({ });
      });
    });

    context('when an element is added', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(() => {
        doc.insertEnd('pineapple', 'hat');
      });

      it('does not have any change in the object', function() {
        expect(getUnsetUpdateForDocumentChanges(doc)).to.deep.equal({ });
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

    context('when the document is undefined', function() {
      it('returns an empty object', function() {
        expect(getUnsetUpdateForDocumentChanges(undefined)).to.deep.equal({});
      });
    });
  });

  describe('#getOriginalKeysAndValuesForFieldsThatWereUpdated', () => {
    context('when an element is removed', function() {
      const object = { name: 'test', another: 'ok' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).remove();
      });

      it('includes the key in the object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({
          name: 'test'
        });
      });
    });

    context('when nothing is changed', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      it('returns an empty object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({});
      });
    });

    context('when an element named to empty string', function() {
      const object = { name: 'test', another: 'ok' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('');
      });

      it('includes the original in the object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({
          name: 'test'
        });
      });
    });

    context('when an element is renamed', function() {
      const object = { name: 'test', another: 'ok' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('aa');
      });

      it('includes the original in the object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({
          name: 'test'
        });
      });
    });

    context('when a nested element is edited', function() {
      const object = {
        name: {
          first: 'jimmy',
          last: 'hendrix'
        },
        other: 'ok'
      };
      const doc = new HadronDocument(object);

      before(function() {
        doc.get('name').get('last').edit('aa');
      });

      it('returns the original element in the object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({
          name: {
            first: 'jimmy',
            last: 'hendrix'
          }
        });
      });
    });

    context('when an element is renamed empty string', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.elements.at(0).rename('');
      });

      it('includes the change in the object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({
          name: 'test'
        });
      });
    });

    context('when an added element is named empty string', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(function() {
        doc.insertEnd('aa', '333');
        doc.elements.at(1).rename('');
      });

      it('does not have any element in the object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({ });
      });
    });

    context('when an element is added', function() {
      const object = { name: 'test' };
      const doc = new HadronDocument(object);

      before(() => {
        doc.insertEnd('pineapple', 'hat');
      });

      it('does not include the new element in the object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({ });
      });
    });

    context('when a nested element is removed', function() {
      const object = {
        name: {
          first: 'jimmy',
          last: 'hendrix'
        },
        test: 'ok'
      };
      const doc = new HadronDocument(object);

      before(function() {
        doc.get('name').get('last').remove();
      });

      it('returns the original element in the object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(doc)).to.deep.equal({
          name: {
            first: 'jimmy',
            last: 'hendrix'
          }
        });
      });
    });

    context('when the document is undefined', function() {
      it('returns an empty object', function() {
        expect(getOriginalKeysAndValuesForFieldsThatWereUpdated(undefined)).to.deep.equal({});
      });
    });
  });
});
