import {
  addIntlState,
  flushIntlState,
  removeIntlState,
  setInIntlState,
  updateInIntlState
} from '../../actionCreators/IntlActions';
import initReducer from '../utils/initReducer';
import {expect} from 'chai';

const data = global.data = {}; //eslint-disable-line no-unused-vars

describe('INTL reducer', () => {
  const reducer = require('./intl');
  const component = {Component: {state: true}};
  const component2 = {Component2: {state2: false}};

  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}).toJS()
    ).to.deep.equal(
      initReducer({}).toJS()
    );
  });

  it('should handle ADD', () => {
    expect(
      reducer(undefined, addIntlState(component)).toJS()
    ).to.deep.equal(
      initReducer(component).toJS()
    );

    expect(
      reducer(
        initReducer(component),
        addIntlState(component2)
      ).toJS()
    ).to.deep.equal(
      initReducer({
        ...component,
        ...component2
      }).toJS()
    );
  });

  it('should handle FLUSH', () => {
    expect(
      reducer(
        initReducer(component),
        flushIntlState()
      ).toJS()
    ).to.be.empty;
  });

  it('should handle REMOVE', () => {
    expect(
      reducer(
        initReducer({
          ...component,
          ...component2
        }),
        removeIntlState('Component')
      ).toJS()
    ).to.deep.equal(
      initReducer({
        ...component2
      }).toJS()
    );
  });

  it('should handle SETIN', () => {
    expect(
      reducer(
        initReducer({
          ...component,
          ...component2
        }),
        setInIntlState(['Component', 'custom'], 0)
      ).toJS()
    ).to.deep.equal(
      initReducer({
        ...{Component: {state: true, custom: 0}},
        ...component2
      }).toJS()
    );

    expect(
      reducer(
        initReducer({
          ...component,
          ...component2
        }),
        setInIntlState(['Component', 'custom', 'newValue'], 0)
      ).toJS()
    ).to.deep.equal(
      initReducer({
        ...{Component: {state: true, custom: {newValue: 0}}},
        ...component2
      }).toJS()
    );
  });

  it('should handle UPDATEIN', () => {
    expect(
      reducer(
        initReducer({
          ...component,
          ...component2
        }),
        updateInIntlState(['Component', 'state'], (s) => parseInt(s))
      ).toJS()
    ).to.deep.equal(
      initReducer({
        ...{Component: {state: NaN}},
        ...component2
      }).toJS()
    );
  });
});
