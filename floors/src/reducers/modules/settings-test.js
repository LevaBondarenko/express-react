import {flushSettingsState} from '../../actionCreators/SettingsActions';
import initReducer from '../utils/initReducer';
import {expect} from 'chai';
import {cloneDeep} from 'lodash';

/*global data*/

describe('SETTINGS reducer', () => {
  const reducer = require('./settings');
  let initialData;

  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {options: {mediaSource: 2}}; // eslint-disable-line no-unused-vars
  });

  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}).toJS()
    ).to.deep.equal(
      initReducer(data.options).toJS()
    );
  });

  it('should handle FLUSH', () => {
    expect(
      reducer(undefined, flushSettingsState()).toJS()
    ).to.deep.equal(
      initReducer({}).toJS()
    );
  });

});
