/**
 * MobileSlider test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MobileSlider from './MobileSlider';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import initReducer from '../../reducers/utils/initReducer';

describe('<MobileSlider />', () => {
  let component;

  beforeEach(() => {
    const props = {
      context: {
        insertCss: emptyFunction
      },
      store: {
        dispatch: emptyFunction,
        getState: () => ({
          objects: initReducer({}),
        }),
      }
    };

    component = shallow(<MobileSlider {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
