/**
 * USelect test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import USelect from './USelect';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';

describe('<USelect />', () => {
  let component;

  beforeEach(() => {
    const props = {
      context: {
        insertCss: emptyFunction,
        store: {
          dispatch: emptyFunction,
          getState: emptyFunction,
          replaceReducer: emptyFunction
        }
      }
    };

    component = shallow(<USelect {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
