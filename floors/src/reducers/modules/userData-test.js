import {flushUserDataState} from '../../actionCreators/UserDataActions';
import initReducer from '../utils/initReducer';
import {expect} from 'chai';
import {cloneDeep} from 'lodash';

/*global data*/

describe('USERDATA reducer', () => {
  const reducer = require('./userData');
  let initialData;

  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {userdata: {isAuthorized: true}}; // eslint-disable-line no-unused-vars
  });

  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}).toJS()
    ).to.deep.equal(
      initReducer(data.userdata).toJS()
    );
  });

  it('should handle FLUSH', () => {
    expect(
      reducer(undefined, flushUserDataState()).toJS()
    ).to.deep.equal(
      initReducer({}).toJS()
    );
  });

});
