/**
 * SliderAgregator test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import SliderAgregator from './SliderAgregator';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';

describe('<SliderAgregator />', () => {
  let component;

  beforeEach(() => {
    const props = {
      context: {
        insertCss: emptyFunction
      }
    };

    component = shallow(<SliderAgregator {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
