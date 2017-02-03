import {
  addUiState,
  flushUiState,
  removeUiState,
  setInUiState,
  updateInUiState
} from '../../actionCreators/UiActions';
import reducer from './ui';
import initReducer from '../utils/initReducer';
import {expect} from 'chai';


describe('UI reducer', () => {
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
      reducer(undefined, addUiState(component)).toJS()
    ).to.deep.equal(
      initReducer(component).toJS()
    );

    expect(
      reducer(
        initReducer(component),
        addUiState(component2)
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
        flushUiState()
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
        removeUiState('Component')
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
        setInUiState(['Component', 'custom'], 0)
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
        setInUiState(['Component', 'custom', 'newValue'], 0)
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
        updateInUiState(['Component', 'state'], (s) => parseInt(s))
      ).toJS()
    ).to.deep.equal(
      initReducer({
        ...{Component: {state: NaN}},
        ...component2
      }).toJS()
    );
  });
});
