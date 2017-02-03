import {flushCollectionsState} from '../../actionCreators/CollectionsActions';
import initReducer from '../utils/initReducer';
import {expect} from 'chai';
import {cloneDeep} from 'lodash';

/*global data*/

describe('COLLECTIONS reducer', () => {
  const reducer = require('./collections');
  let initialData;

  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {collections: {
      cities: [
        {id: 23, name: 'Тюмень'},
        {id: 45, name: 'Екатеринбург'}
      ]
    }};
  });


  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}).toJS()
    ).to.deep.equal(
      initReducer(data.collections).toJS()
    );
  });

  it('should handle FLUSH', () => {
    expect(
      reducer(
        initReducer(undefined, {}),
        flushCollectionsState()
      ).toJS()
    ).to.be.empty;
  });

});
