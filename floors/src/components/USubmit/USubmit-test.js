/**
 * USubmit test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import USubmit from './USubmit';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';

describe('<USubmit />', () => {
  let component;

  beforeEach(() => {
    const props = {
      context: {
        insertCss: emptyFunction
      }
    };

    component = shallow(<USubmit {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
