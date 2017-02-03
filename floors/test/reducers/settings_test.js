import chai from '../../node_modules/chai/chai';
import settings from '../../src/reducers/settings';
import Immutable from 'immutable';
import {addSettings, flushSettings} from '../../src/actions/actionCreators';

const expect = chai.expect;

describe('Settings reducer test suite', () => {
  it('should return the initial state', () => {
    expect(settings(undefined, {})).to.equal(new Immutable.Map({}));
  });

  it('should handle ADD_SETTINGS', () => {
    expect(
      settings(undefined, addSettings({cityId: 23}))
    ).to.eql(
      new Immutable.Map({cityId: 23})
    );
  });

  it('should handle FLUSH_SETTINGS', () => {
    expect(
      settings(undefined, flushSettings())
    ).to.eql(
      new Immutable.Map({})
    );
  });
});
