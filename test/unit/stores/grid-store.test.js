/* eslint guard-for-in: 0 */

const { expect, assert } = require('chai');
const GridStore = require('../../../lib/stores/grid-store');

describe('GridStore', () => {
  const showing = {
    field1: 'Object', field2: 'Array', field3: 'Int32',
    field4: 'Binary', field5: 'Mixed'
  };
  const columns = {
    field1: { '1': 'Object', '2': 'Object', '3': 'Object' },
    field2: { '1': 'Array', '2': 'Array', '3': 'Array' },
    field3: { '1': 'Int32', '2': 'Int32', '3': 'Int32' },
    field4: { '1': 'Binary', '2': 'Binary', '3': 'Binary'},
    field5: { '1': 'Int32', '2': 'Int32', '3': 'String' }
  };

  describe('#columns', () => {
    it('calling addColumn triggers with correct params', (done) => {
      const unsubscribe = GridStore.listen((params) => {
        expect(params).to.deep.equal({add: {colId: 'field1', rowIndex: 1, path: ['field2']}});
        unsubscribe();
        done();
      });
      GridStore.addColumn('field1', 1, ['field2']);
    });

    it('calling removeColumn triggers with correct params', (done) => {
      const unsubscribe = GridStore.listen((params) => {
        expect(params).to.deep.equal({remove: {colIds: ['field3']}});
        unsubscribe();
        done();
      });
      GridStore.removeColumn('field3');
    });
  });

  describe('#resetCols', () => {
    before((done) => {
      showing.field5 = 'Mixed';
      done();
    });
    after((done) => {
      showing.field5 = 'Int32';
      done();
    });
    it('resets columns to empty', () => {
      GridStore.resetColumns({});
      expect(GridStore.columns).to.deep.equal({});
      expect(GridStore.showing).to.deep.equal({});
      expect(GridStore.stageRemove).to.deep.equal({});
    });
    it('resets columns to values', () => {
      GridStore.resetColumns(columns);
      expect(GridStore.columns).to.deep.equal(columns);
      expect(GridStore.showing).to.deep.equal(showing);
      expect(GridStore.stageRemove).to.deep.equal({});
    });
  });

  describe('#elementAdded', () => {
    before((done) => {
      GridStore.resetColumns({});
      done();
    });
    describe('Adding a new column', () => {
      for (const key in columns) {
        it('triggers correctly', (done) => {
          const unsubscribe = GridStore.listen((params) => {
            const show = {};
            show[key] = columns[key][1];
            expect(params).to.deep.equal({updateHeaders: {showing: show}});
            unsubscribe();
            done();
          });
          GridStore.elementAdded(key, columns[key]['1'], '1');
        });
      }
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field1: {1: 'Object'},
          field2: {1: 'Array'},
          field3: {1: 'Int32'},
          field4: {1: 'Binary'},
          field5: {1: 'Int32'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal(showing);
      });
    });

    describe('Adding to a column that already exists with the same type', () => {
      for (const key in columns) {
        it('does not trigger', () => {
          const unsubscribe = GridStore.listen(() => {
            assert.fail();
          });
          GridStore.elementAdded(key, columns[key]['2'], '2');
          if (key !== 'field5') {
            GridStore.elementAdded(key, columns[key]['3'], '3');
          }
          unsubscribe();
        });
      }
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field1: {1: 'Object', 2: 'Object', 3: 'Object'},
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'},
          field5: {1: 'Int32', 2: 'Int32'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field5 = 'Int32';
        expect(GridStore.showing).to.deep.equal(showing);
        showing.field5 = 'Mixed';
      });
    });
    describe('Adding to a column that already exists with a new type', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({updateHeaders: {showing: {field5: 'Mixed'}}});
          unsubscribe();
          done();
        });
        GridStore.elementAdded('field5', 'String', '3');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal(columns);
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal(showing);
      });
    });
  });

  describe('#elementRemoved', () => {
    before((done) => {
      GridStore.resetColumns(columns);
      done();
    });
    describe('Removing from a column that already exists with the same type', () => {
      for (const key in columns) {
        it('does not trigger', () => {
          const unsubscribe = GridStore.listen(() => {
            assert.fail();
          });
          GridStore.elementRemoved(key, '1');
          if (key !== 'field5') {
            GridStore.elementRemoved(key, '2');
          }
          unsubscribe();
        });
      }
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field1: {3: 'Object'},
          field2: {3: 'Array'},
          field3: {3: 'Int32'},
          field4: {3: 'Binary'},
          field5: {2: 'Int32', 3: 'String'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal(showing);
      });
    });
    describe('Removing from a Mixed column', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({updateHeaders: {showing: {field5: 'Int32'}}});
          unsubscribe();
          done();
        });
        GridStore.elementRemoved('field5', '3');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field1: {3: 'Object'},
          field2: {3: 'Array'},
          field3: {3: 'Int32'},
          field4: {3: 'Binary'},
          field5: {2: 'Int32'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field5 = 'Int32';
        expect(GridStore.showing).to.deep.equal(showing);
      });
    });
    describe('Removing the last item from a column', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({remove: {colIds: ['field5']}});
          unsubscribe();
          done();
        });
        GridStore.elementRemoved('field5', '2');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field1: {3: 'Object'},
          field2: {3: 'Array'},
          field3: {3: 'Int32'},
          field4: {3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        delete showing.field5;
        expect(GridStore.showing).to.deep.equal(showing);
      });
    });
  });

  describe('#elementTypeChanged', () => {
    before((done) => {
      GridStore.resetColumns({field1: {3: 'Object'}});
      done();
    });
    describe('Changing the type of the last item', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({updateHeaders: {showing: {field1: 'Date'}}});
          unsubscribe();
          done();
        });
        GridStore.elementTypeChanged('field1', 'Date', '3');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({field1: {3: 'Date'}});
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal({field1: 'Date'});
      });
    });
    describe('Casted to the same type', () => {
      it('does not trigger', () => {
        const unsubscribe = GridStore.listen(() => {
          assert.fail();
        });
        GridStore.elementTypeChanged('field1', 'Date', '3');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({field1: {3: 'Date'}});
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal({field1: 'Date'});
      });
    });
    describe('Changing the type to Mixed', () => {
      before((done) => {
        GridStore.resetColumns({field1: {3: 'Date', 2: 'Date'}});
        done();
      });
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({updateHeaders: {showing: {field1: 'Mixed'}}});
          unsubscribe();
          done();
        });
        GridStore.elementTypeChanged('field1', 'Double', '3');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({field1: {3: 'Double', 2: 'Date'}});
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal({field1: 'Mixed'});
      });
    });
    describe('Changing the type from Mixed', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({updateHeaders: {showing: {field1: 'Double'}}});
          unsubscribe();
          done();
        });
        GridStore.elementTypeChanged('field1', 'Double', '2');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({field1: {3: 'Double', 2: 'Double'}});
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal({field1: 'Double'});
      });
    });
  });

  describe('#elementMarkRemoved', () => {
    before((done) => {
      GridStore.resetColumns(columns);
      showing.field1 = 'Object';
      showing.field5 = 'Mixed';
      expect(GridStore.columns).to.deep.equal(columns);
      expect(GridStore.showing).to.deep.equal(showing);
      expect(GridStore.stageRemove).to.deep.equal({});
      done();
    });
    describe('marking an element as removed with the same type', () => {
      it('does not trigger', () => {
        const unsubscribe = GridStore.listen(() => {
          assert.fail();
        });
        GridStore.elementMarkRemoved('field1', '1');
        GridStore.elementMarkRemoved('field1', '2');
        GridStore.elementMarkRemoved('field1', '3');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'},
          field5: {1: 'Int32', 2: 'Int32', 3: 'String'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(GridStore.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}});
      });
    });
    describe('marking an element as removed with a different type but still Mixed', () => {
      it('does not trigger', () => {
        const unsubscribe = GridStore.listen(() => {
          assert.fail();
        });
        GridStore.elementMarkRemoved('field5', '1');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'},
          field5: {2: 'Int32', 3: 'String'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(GridStore.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}, field5: {1: true}});
      });
    });
    describe('marking an element as removed with a different type no longer Mixed', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({updateHeaders: {showing: {field5: 'Int32'}}});
          unsubscribe();
          done();
        });
        GridStore.elementMarkRemoved('field5', '3');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'},
          field5: {2: 'Int32'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field5 = 'Int32';
        expect(GridStore.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(GridStore.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}, field5: {1: true, 3: true}});
      });
    });
    describe('marking the last element in a column as removed', () => {
      it('does not trigger', () => {
        const unsubscribe = GridStore.listen(() => {
          assert.fail();
        });
        GridStore.elementMarkRemoved('field5', '2');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(GridStore.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(GridStore.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}, field5: {1: true, 2: true, 3: true}});
      });
    });
    describe('calling elementAdded for a marked removed element adds it back', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({updateHeaders: {showing: {field1: 'String'}}});
          unsubscribe();
          done();
        });
        GridStore.elementAdded('field1', 'String', '1');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field1: {1: 'String'},
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field1 = 'String';
        expect(GridStore.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(GridStore.stageRemove).to.deep.equal({field1: {2: true, 3: true}, field5: {1: true, 2: true, 3: true}});
      });
    });
    describe('calling elementRemoved for a marked remove element removes it', () => {
      it('does not trigger if there are marked removed elements in the column', () => {
        const unsubscribe = GridStore.listen(() => {
          assert.fail();
        });
        GridStore.elementRemoved('field1', '1');
        GridStore.elementRemoved('field1', '2');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field5 = 'Int32';
        expect(GridStore.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(GridStore.stageRemove).to.deep.equal({field1: {3: true}, field5: {1: true, 2: true, 3: true}});
      });
      it('triggers if there are no  more marked removed elements in the column', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({remove: {colIds: ['field1']}});
          unsubscribe();
          done();
        });
        GridStore.elementRemoved('field1', '3');
      });
      it('sets this.columns correctly', () => {
        expect(GridStore.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        delete showing.field1;
        expect(GridStore.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(GridStore.stageRemove).to.deep.equal({field5: {1: true, 2: true, 3: true}});
      });
    });
  });

  describe('#cleanCols', () => {
    describe('columns have elements marked for deletion', () => {
      before((done) => {
        GridStore.resetColumns({field1: {1: 'Object', 2: 'Object', 3: 'Object'}});
        GridStore.elementMarkRemoved('field1', 1);
        GridStore.elementMarkRemoved('field1', 2);
        GridStore.elementMarkRemoved('field1', 3);
        expect(GridStore.columns).to.deep.equal({});
        expect(GridStore.showing).to.deep.equal({field1: 'Object'});
        expect(GridStore.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}});
        done();
      });
      it('does not trigger', () => {
        const unsubscribe = GridStore.listen(() => {
          assert.fail();
        });
        GridStore.cleanCols();
        unsubscribe();
      });
      it('does not make internal changes', () => {
        expect(GridStore.columns).to.deep.equal({});
        expect(GridStore.showing).to.deep.equal({field1: 'Object'});
        expect(GridStore.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}});
      });
    });
    describe('all elements in column are removed', () => {
      before((done) => {
        GridStore.resetColumns({field1: {3: 'Object'}, field2: {3: 'Array'}});
        delete GridStore.columns.field1;
        delete GridStore.columns.field2;
        expect(GridStore.columns).to.deep.equal({});
        expect(GridStore.showing).to.deep.equal({field1: 'Object', field2: 'Array'});
        expect(GridStore.stageRemove).to.deep.equal({});
        done();
      });
      it('triggers correctly', (done) => {
        const unsubscribe = GridStore.listen((params) => {
          expect(params).to.deep.equal({remove: {colIds: ['field1', 'field2']}});
          unsubscribe();
          done();
        });
        GridStore.cleanCols();
      });
      it('makes internal changes', () => {
        expect(GridStore.columns).to.deep.equal({});
        expect(GridStore.showing).to.deep.equal({});
        expect(GridStore.stageRemove).to.deep.equal({});
      });
    });
  });
});
