/* eslint guard-for-in: 0 */

const { expect } = require('chai');
const PageChangedStore = require('../../../lib/stores/page-changed-store');
const AppRegistry = require('hadron-app-registry');
const Connection = require('mongodb-connection-model');
const DataService = require('mongodb-data-service');
const { expectedDocs, checkPageRange, NUM_DOCS } = require('../../aggrid-helper');

const CONNECTION = new Connection({
  hostname: '127.0.0.1',
  port: 27018,
  ns: 'compass-crud',
  mongodb_database_name: 'admin'
});

describe('PageChangedStore', () => {
  const dataService = new DataService(CONNECTION);
  before((done) => {
    global.hadronApp.appRegistry = new AppRegistry();
    global.hadronApp.appRegistry.registerStore('CRUD.Store', PageChangedStore);
    global.hadronApp.appRegistry.onActivated();
    dataService.connect(() => {
      global.hadronApp.appRegistry.emit('data-service-connected', null, dataService);
      dataService.insertMany('compass-crud.test', expectedDocs, {}, () => {
        done();
      });
    });
  });

  after((done) => {
    dataService.dropCollection('compass-crud.test', () => {
      dataService.disconnect();
      global.hadronApp.appRegistry = undefined;
      done();
    });
  });

  describe('#init', () => {
    it('sets the default filter', () => {
      expect(PageChangedStore.filter).to.deep.equal({});
    });
    it('sets the default counter', () => {
      expect(PageChangedStore.counter).to.equal(0);
    });
  });

  describe('#onCollectionChanged', () => {
    before(() => {
      PageChangedStore.onCollectionChanged('compass-crud.test');
    });

    after(() => {
      PageChangedStore.onCollectionChanged(undefined);
    });

    it('sets the namespace', () => {
      expect(PageChangedStore.ns).to.equal('compass-crud.test');
    });
  });

  describe('#emit collection-changed', () => {
    before(() => {
      global.hadronApp.appRegistry.emit('collection-changed', 'compass-crud.test');
    });

    after(() => {
      PageChangedStore.onCollectionChanged(undefined);
    });

    it('sets the namespace', () => {
      expect(PageChangedStore.ns).to.equal('compass-crud.test');
    });
  });

  describe('#onQueryChanged', () => {
    const filter = { name: 'test' };
    before(() => {
      PageChangedStore.onQueryChanged({ ns: 'compass-crud.test', filter: filter });
    });

    after(() => {
      PageChangedStore.onQueryChanged({ ns: 'compass-crud.test', filter: {}});
    });

    it('sets the filter', () => {
      expect(PageChangedStore.filter).to.deep.equal(filter);
    });
  });

  describe('#emit query-changed', () => {
    const filter = { name: 'test' };
    before(() => {
      global.hadronApp.appRegistry.emit('query-changed', { ns: 'compass-crud.test', filter: filter });
    });

    after(() => {
      PageChangedStore.onQueryChanged({ ns: 'compass-crud.test', filter: {}});
    });

    it('sets the filter', () => {
      expect(PageChangedStore.filter).to.deep.equal(filter);
    });
  });

  describe('#getNextPage', () => {
    describe('get pages of correct size', () => {
      describe('no skip or limit', () => {
        before(() => {
          PageChangedStore.reset();
          PageChangedStore.onCollectionChanged('compass-crud.test');
        });
        after(() => {
          PageChangedStore.onCollectionChanged(undefined);
        });
        for (let i = 0; i < 3; i++) {
          it('gets the next page for ' + i, (done) => {
            const unsubscribe = PageChangedStore.listen(
              (error, documents, start, end, page) => {
                checkPageRange(error, documents, start, end, page, i, 0, 0);
                unsubscribe();
                done();
              });
            PageChangedStore.getNextPage(i);
          });
          it('updates counter correctly', () => {
            expect(PageChangedStore.counter).to.equal(NUM_DOCS * (i + 1));
          });
        }
      });
      describe('with skip', () => {
        const skip = 5;
        before(() => {
          PageChangedStore.reset();
          PageChangedStore.onCollectionChanged('compass-crud.test');
          PageChangedStore.skip = skip;
        });
        after(() => {
          PageChangedStore.onCollectionChanged(undefined);
        });
        for (let i = 0; i < 3; i++) {
          it('gets the next page for ' + i, (done) => {
            const unsubscribe = PageChangedStore.listen(
              (error, documents, start, end, page) => {
                checkPageRange(error, documents, start, end, page, i, skip, 0);
                unsubscribe();
                done();
              });
            PageChangedStore.getNextPage(i);
          });
          it('updates counter correctly', () => {
            expect(PageChangedStore.counter).to.equal(NUM_DOCS * (i + 1));
          });
        }
      });
      describe('with limit', () => {
        const limit = 50;
        before(() => {
          PageChangedStore.reset();
          PageChangedStore.onCollectionChanged('compass-crud.test');
          PageChangedStore.limit = limit;
        });
        after(() => {
          PageChangedStore.onCollectionChanged(undefined);
        });
        for (let i = 0; i < 3; i++) {
          it('gets the next page for ' + i, (done) => {
            const unsubscribe = PageChangedStore.listen(
              (error, documents, start, end, page) => {
                checkPageRange(error, documents, start, end, page, i, 0, limit);
                unsubscribe();
                done();
              });
            PageChangedStore.getNextPage(i);
          });
          it('updates counter correctly', () => {
            expect(PageChangedStore.counter).to.equal(NUM_DOCS * (i + 1));
          });
        }
      });
      describe('with skip and limit', () => {
        const limit = 50;
        const skip = 2;
        before(() => {
          PageChangedStore.reset();
          PageChangedStore.onCollectionChanged('compass-crud.test');
          PageChangedStore.limit = limit;
          PageChangedStore.skip = skip;
        });
        after(() => {
          PageChangedStore.onCollectionChanged(undefined);
        });
        for (let i = 0; i < 3; i++) {
          it('gets the next page for ' + i, (done) => {
            const unsubscribe = PageChangedStore.listen(
              (error, documents, start, end, page) => {
                checkPageRange(error, documents, start, end, page, i, skip, limit);
                unsubscribe();
                done();
              });
            PageChangedStore.getNextPage(i);
          });
          it('updates counter correctly', () => {
            expect(PageChangedStore.counter).to.equal(NUM_DOCS * (i + 1));
          });
        }
      });
    });
    describe('handle deleting documents', () => {

    });
    describe('handle inserting documents', () => {

    });
  });

  describe('#getPrevPage', () => {
    describe('get pages of correct size', () => {

    });
    describe('handle deleting documents', () => {

    });
    describe('handle inserting documents', () => {

    });
  });

  describe('both prev then next', () => {

  });
});
