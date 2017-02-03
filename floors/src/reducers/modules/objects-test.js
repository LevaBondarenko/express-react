import {
  flushObjectsState,
  removeObjectsState,
  setInObjectsState,
  massUpdateInObjectsState,
  updateInObjectsState,
  mergeInObjectsState,
} from '../../actionCreators/ObjectsActions';
import initReducer from '../utils/initReducer';
import reducer from './objects';
import {expect} from 'chai';
import {cloneDeep} from 'lodash';

/*global data*/

describe('OBJECTS reducer', () => {
  let initialData;

  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {
      redux: {
        list: [
          {
            object: 0
          },
          {
            object: 1
          },
          {
            object: 2
          }
        ],
        object: {
          field1: 5,
          field2: 'value2'
        }
      }
    };
  });

  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}).toJS()
    ).to.deep.equal(
      initReducer(data.redux).toJS()
    );
  });

  it('should handle FLUSH', () => {
    expect(
      reducer(
        initReducer(undefined, {}),
        flushObjectsState()
      ).toJS()
    ).to.be.empty;
  });

  it('should handle REMOVE', () => {
    expect(
      reducer(
        initReducer(data.redux),
        removeObjectsState('list')
      ).toJS()
    ).to.deep.equal(
      initReducer({
        object: {
          field1: 5,
          field2: 'value2'
        }
      }).toJS()
    );
  });


  it('should handle SETIN', () => {
    expect(
      reducer(
        initReducer(undefined, {}),
        setInObjectsState(['object'], {'newField': 7})
      ).toJS()
    ).to.deep.equal(
      initReducer({
        list: [
          {
            object: 0
          },
          {
            object: 1
          },
          {
            object: 2
          }
        ],
        object: {
          newField: 7
        }
      }).toJS()
    );

    expect(
      reducer(
        initReducer({object: {field: true}}, {}),
        setInObjectsState(['newObject'], {'newField': 7})
      ).toJS()
    ).to.deep.equal(
      initReducer({object: {field: true}, newObject: {'newField': 7}}).toJS()
    );
  });

  it('should handle MASSUPDATEIN', () => {
    expect(
      reducer(
        initReducer({
          objects: {
            object: {
              field: true
            },
            object2: false,
            object3: 3
          }
        }),
        massUpdateInObjectsState(
          ['objects'], {
            object: {
              newField: false
            },
            object3: 2,
          })
      ).toJS()
    ).to.deep.equal(
      initReducer({
        objects: {
          object: {newField: false},
          object2: false,
          object3: 2
        }
      }).toJS()
    );

    expect(
      reducer(
        initReducer({
          objects: {
            object: true,
          }
        }),
        massUpdateInObjectsState(
          ['objects'], {
            object: false,
            object2: 2,
          })
      ).toJS()
    ).to.deep.equal(
      initReducer({
        objects: {
          object: false,
          object2: 2,
        }
      }).toJS()
    );
  });

  it('should handle UPDATEIN', () => {
    expect(
      reducer(
        initReducer({object: {field: true}}, {}),
        updateInObjectsState(['newObject', 'newField'], () => (true))
      ).toJS()
    ).to.deep.equal(
      initReducer({object: {field: true}, newObject: {'newField': true}}).toJS()
    );

    expect(
      reducer(
        initReducer({object: {field: true}}, {}),
        updateInObjectsState(['object', 'field'], () => (false))
      ).toJS()
    ).to.deep.equal(
      initReducer({object: {field: false}}).toJS()
    );

    expect(
      reducer(
        initReducer({object: {field: true}}, {}),
        updateInObjectsState(['object'], () => (false))
      ).toJS()
    ).to.deep.equal(
      initReducer({object: false}).toJS()
    );
  });

  it('should handle MERGEDEEP', () => {
    const newData = {
      field2: false,
      field3: 3
    };

    expect(
      reducer(
        initReducer({object: {field: true}}, {}),
        mergeInObjectsState({object: {...newData}})
      ).toJS()
    ).to.deep.equal(
      initReducer({
        object: {
          field: true,
          field2: false,
          field3: 3
        },
      }).toJS()
    );
  });

});
