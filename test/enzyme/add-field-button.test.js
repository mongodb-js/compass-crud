const React = require('react');
const chai = require('chai');
const expect = chai.expect;
const chaiEnzyme = require('chai-enzyme');
const { mount } = require('enzyme');
const { getNode, getApi, getColumn, getActions,
  getColumnApi, getContext, notCalledExcept} = require('../aggrid-helper');
const AddFieldButton = require('../../src/components/table-view/add-field-button');
const AppRegistry = require('hadron-app-registry');
const app = require('hadron-app');

chai.use(chaiEnzyme());

describe('<AddFieldButton />', () => {
  before(() => {
    global.hadronApp = app;
    global.hadronApp.appRegistry = new AppRegistry();
    global.hadronApp.instance = {
      build: {
        version: '3.4.0'
      }
    };
  });

  after(() => {
    global.hadronApp.appRegistry = new AppRegistry();
  });

  describe('#render', () => {
    let component;
    let rowNode;
    let value;
    const api = getApi();
    const column = getColumn('field1', { headerName: 'field1' });
    const actions = getActions();
    const columnApi = getColumnApi([]);
    const context = getContext([]);
    describe('object', () => {
      before((done) => {
        rowNode = getNode({field1: {'subfield1': 'value'}});
        value = rowNode.data.hadronDocument.get('field1');
        component = mount(<AddFieldButton api={api} column={column} node={rowNode}
                                      value={value} actions={actions}
                                      columnApi={columnApi}
                                      context={context} displace={0}/>);
        done();
      });
      it('renders add next field', () => {
        expect(component.find({'data-test-id': 'add-field-after'})).to.be.present();
      });
      it('renders add field to object', () => {
        expect(component.find({'data-test-id': 'add-child-to-object'})).to.be.present();
      });
      it('does not render add array element', () => {
        expect(component.find({'data-test-id': 'add-element-to-array'})).to.not.be.present();
      });
    });

    describe('array', () => {
      before((done) => {
        rowNode = getNode({field1: ['item1', 'item2']});
        value = rowNode.data.hadronDocument.get('field1');
        component = mount(<AddFieldButton api={api} column={column} node={rowNode}
                                          value={value} actions={actions}
                                          columnApi={columnApi}
                                          context={context}/>);
        done();
      });
      it('renders add next field', () => {
        expect(component.find({'data-test-id': 'add-field-after'})).to.be.present();
      });
      it('does not render add field to object', () => {
        expect(component.find({'data-test-id': 'add-child-to-object'})).to.not.be.present();
      });
      it('renders add array element', () => {
        expect(component.find({'data-test-id': 'add-element-to-array'})).to.be.present();
      });
    });

    describe('non-expandable element', () => {
      before((done) => {
        rowNode = getNode({field1: 'value'});
        value = rowNode.data.hadronDocument.get('field1');
        component = mount(<AddFieldButton api={api} column={column} node={rowNode}
                                          value={value} actions={actions}
                                          columnApi={columnApi}
                                          context={context}/>);
        done();
      });
      it('renders add next field', () => {
        expect(component.find({'data-test-id': 'add-field-after'})).to.be.present();
      });
      it('does not render add field to object', () => {
        expect(component.find({'data-test-id': 'add-child-to-object'})).to.not.be.present();
      });
      it('does not render add array element', () => {
        expect(component.find({'data-test-id': 'add-element-to-array'})).to.not.be.present();
      });
    });
  });

  describe('#Actions', () => {
    const api = getApi();
    const columnApi = getColumnApi();
    const column = getColumn('field1', { headerName: 'field1' });
    let component;
    let rowNode;
    let value;

    describe('add next field', () => {
      describe('at the top level', () => {
        describe('when current element is empty', () => {
          const context = getContext([]);
          const actions = getActions();
          before((done) => {
            rowNode = getNode({field0: 'value'});
            value = undefined;
            component = mount(<AddFieldButton api={api} column={column}
                                              node={rowNode}
                                              value={value} actions={actions}
                                              columnApi={columnApi}
                                              context={context}/>);
            const wrapper = component.find({'data-test-id': 'add-field-after'});
            expect(wrapper).to.be.present();
            wrapper.simulate('click');
            done();
          });
          it('calls addColumn action', () => {
            expect(actions.addColumn.callCount).to.equal(1);
            expect(actions.addColumn.alwaysCalledWithExactly('field1', 2, []));
            notCalledExcept(actions, ['addColumn']);
          });
          it('adds the new element to the end of the element', () => {
            expect(rowNode.data.hadronDocument.elements.lastElement.currentKey).to.equal('$new');
          });
        });

        describe('when current element is not empty', () => {
          const context = getContext([]);
          const actions = getActions();
          before((done) => {
            rowNode = getNode({field1: 'value', field3: 'value3'});
            value = rowNode.data.hadronDocument.get('field1');
            component = mount(<AddFieldButton api={api} column={column}
                                              node={rowNode}
                                              value={value} actions={actions}
                                              columnApi={columnApi}
                                              context={context}/>);
            const wrapper = component.find({'data-test-id': 'add-field-after'});
            expect(wrapper).to.be.present();
            wrapper.simulate('click');
            done();
          });
          it('calls addColumn action', () => {
            expect(actions.addColumn.callCount).to.equal(1);
            expect(actions.addColumn.alwaysCalledWithExactly('field1', 2, []));
            notCalledExcept(actions, ['addColumn']);
          });
          it('adds the new element after the current element', () => {
            expect(value.nextElement.currentKey).to.equal('$new');
          });
        });
      });

      describe('when in nested view of object', () => {
        const context = getContext(['field0']);
        const actions = getActions();
        before((done) => {
          rowNode = getNode({field0: {field1: 'value'}});
          value = rowNode.data.hadronDocument.getChild(['field0', 'field1']);
          component = mount(<AddFieldButton api={api} column={column}
                                            node={rowNode}
                                            value={value} actions={actions}
                                            columnApi={columnApi}
                                            context={context}/>);
          const wrapper = component.find({'data-test-id': 'add-field-after'});
          expect(wrapper).to.be.present();
          wrapper.simulate('click');
          done();
        });
        it('calls addColumn action', () => {
          expect(actions.addColumn.callCount).to.equal(1);
          expect(actions.addColumn.alwaysCalledWithExactly('field1', 2, ['field1']));
          notCalledExcept(actions, ['addColumn']);
        });
        it('adds the new element to the sub element', () => {
          expect(value.nextElement.currentKey).to.equal('$new');
          expect(rowNode.data.hadronDocument.generateObject()).to.deep.equal({
            _id: '1', field0: {field1: 'value', $new: ''}
          });
        });
      });

      describe('when in nested view of array', () => {
        describe('adding to the end of the array', () => {
          const context = getContext(['field0']);
          const actions = getActions();
          const arraycolumn = getColumn(1, { headerName: 1 });
          before((done) => {
            rowNode = getNode({field0: ['value0', 'value1', 'value2']});
            value = rowNode.data.hadronDocument.getChild(['field0', 1]);
            component = mount(<AddFieldButton api={api} column={arraycolumn}
                                              node={rowNode}
                                              value={value} actions={actions}
                                              columnApi={columnApi}
                                              context={context}/>);
            const wrapper = component.find({'data-test-id': 'add-field-after'});
            expect(wrapper).to.be.present();
            wrapper.simulate('click');
            done();
          });
          it('calls addColumn action', () => {
            expect(actions.addColumn.callCount).to.equal(1);
            expect(actions.addColumn.alwaysCalledWithExactly(1, 2, ['field0']));
            notCalledExcept(actions, ['addColumn']);
          });
          it('adds the new element to the sub element', () => {
            // expect(value.nextElement.currentKey).to.equal('$new');
            // expect(rowNode.data.hadronDocument.generateObject()).to.deep.equal({
            //   _id: '1', field0: ['value0', 'value1', '' ,'value2']});
            // });
          });
        });
        describe('adding to the middle of an array', () => {

        });
        describe('undo for adding to the middle of an array', () => {

        });
      });
    });

    describe('add element to object', () => {
      describe('at the top level', () => {

      });

      describe('when in nested view', () => {

      });
    });

    describe('add array element to array', () => {
      describe('at the top level', () => {

      });

      describe('when in nested view', () => {

      });
    });
  });
});
