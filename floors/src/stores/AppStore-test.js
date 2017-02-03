import AppStore from './AppStore';
import {expect} from 'chai';

describe('AppStore test suite', () => {
  let store;

  beforeEach(()=> {
    store = new AppStore();
    store.data = {
      object: {},
      array: [],
      string: ''
    };
  });

  it('store should be instance of AppStore', () => {
    expect(store).to.be.an.instanceof(AppStore);
  });

  describe('AppStore emitChange test suite', () => {
    it('AppStore should contain emitChange method', () => {
      expect(store).to.have.property('emitChange')
      .that.is.a('function');
    });

    it('AppStore should respond to emitChange', () => {
      expect(store).to.respondTo('emitChange');
    });
  });

  describe('AppStore onChange test suite', () => {
    it('AppStore should contain onChange method', () => {
      expect(store).to.have.property('onChange')
      .that.is.a('function');
    });

    it('AppStore should respond to onChange', () => {
      expect(store).to.respondTo('onChange');
    });
  });

  describe('AppStore off test suite', () => {
    it('AppStore should contain off method', () => {
      expect(store).to.have.property('off')
      .that.is.a('function');
    });

    it('AppStore should respond to off', () => {
      expect(store).to.respondTo('off');
    });
  });

  describe('AppStore offChange test suite', () => {
    it('AppStore should contain offChange method', () => {
      expect(store).to.have.property('offChange')
      .that.is.a('function');
    });

    it('AppStore should respond to offChange', () => {
      expect(store).to.respondTo('offChange');
    });
  });

  describe('AppStore set test suite', () => {
    it('AppStore should contain set method', () => {
      expect(store).to.have.property('set')
      .that.is.a('function');
    });

    it('AppStore should respond to set', () => {
      expect(store).to.respondTo('set');
    });

    it('AppStore test set on object', () => {
      const mockObject = {
        test: 1,
        foo: 'bar'
      };

      store.set('object', mockObject);
      expect(store.data).to.have.property('object')
      .that.is.deep.equal(mockObject);
    });

    it('AppStore test set on array', () => {
      const mockArray = [1,2,3,'baz'];

      store.set('array', mockArray);
      expect(store.data).to.have.property('array')
      .that.is.deep.equal(mockArray);
    });

    it('AppStore test set on string', () => {
      const mockString = 'baz string';

      store.set('string', mockString);
      expect(store.data).to.have.property('string')
      .that.is.equal(mockString);
    });

    it('AppStore test set string on undefined property', () => {
      const mockString = 'baz string';

      store.set('baz', mockString);
      expect(store.data).to.have.property('baz')
      .that.is.equal(mockString);
    });

    it('AppStore test set array on undefined property', () => {
      const mockArray = [1,2,3,'baz'];

      store.set('baz', mockArray);
      expect(store.data).to.have.property('baz')
      .that.is.deep.equal(mockArray);
    });

    it('AppStore test set object on undefined property', () => {
      const mockObject = {
        test: 1,
        foo: 'bar'
      };

      store.set('baz', mockObject);
      expect(store.data).to.have.property('baz')
      .that.is.deep.equal(mockObject);
    });
  });

  describe('AppStore get test suite', () => {
    it('AppStore should contain get method', () => {
      expect(store).to.have.property('get')
      .that.is.a('function');
    });

    it('AppStore should respond to get', () => {
      expect(store).to.respondTo('get');
    });

    it('AppStore test get on object', () => {
      const mockObject = {
        test: 1,
        foo: 'bar'
      };

      store.set('object', mockObject);
      const getResult = store.get('object');

      expect(getResult).to.deep.equal(mockObject);
    });

    it('AppStore test get all state', () => {

      const getResult = store.get();
      const mockData = {
        object: {},
        array: [],
        string: ''
      };

      expect(getResult).to.deep.equal(mockData);
    });

    it('AppStore test get on array', () => {
      const mockArray = [1,2,3,'baz'];

      store.set('array', mockArray);
      const getResult = store.get('array');

      expect(getResult).to.deep.equal(mockArray);
    });

    it('AppStore test get on string', () => {
      const mockString = 'baz string';

      store.set('string', mockString);
      const getResult = store.get('string');

      expect(getResult).to.deep.equal(mockString);
    });

    it('AppStore test get should throw error on undef property', () => {
      expect(() => {
        store.get('foo');
      }).to.throw('Unknown property foo in store!');
    });
  });

  describe('AppStore get flush suite', () => {
    it('AppStore should contain flush method', () => {
      expect(store).to.have.property('flush')
      .that.is.a('function');
    });

    it('AppStore should respond to flush', () => {
      expect(store).to.respondTo('flush');
    });

    it('AppStore flush should clean data object', () => {
      store.flush();
      expect(store.data).to.deep.equal({});
    });
  });

  describe('AppStore filter suite', () => {
    it('AppStore should contain filter method', () => {
      expect(store).to.have.property('filter')
      .that.is.a('function');
    });

    it('AppStore should respond to filter', () => {
      expect(store).to.respondTo('filter');
    });

    it('AppStore filter should throw error on undef property', () => {
      expect(() => {
        store.filter('foo');
      }).to.throw('Property foo not found!');
    });

    it('AppStore filter retrun filtered collections', () => {
      const mockArray = [1,2,3,'baz'];

      store.set('array', mockArray);
      const result = store.filter('array', (item) => item === 'baz');

      expect(result).to.deep.equal(['baz']);
    });
  });

  describe('AppStore del suite', () => {
    it('AppStore should contain del method', () => {
      expect(store).to.have.property('flush')
      .that.is.a('function');
    });

    it('AppStore should respond to del', () => {
      expect(store).to.respondTo('flush');
    });

    it('AppStore del should remove elements from collection', () => {
      const mockArray = [1,2,3,'baz'];

      store.set('array', mockArray);
      store.del('array', ['baz', 3]);
      const getResult = store.get('array');

      expect(getResult).to.deep.equal([1,2]);
    });

    it('AppStore del should remove property from store', () => {
      const mockArray = [1,2,3,'baz'];

      store.set('array', mockArray);
      store.del('array');


      expect(store.data).to.deep.equal({
        object: {},
        string: ''
      });
    });
  });

});
