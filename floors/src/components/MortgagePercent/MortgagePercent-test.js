/**
 * MortgagePercent test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MortgagePercent from './MortgagePercent';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';

describe('<MortgagePercent />', () => {
  let component;

  beforeEach(() => {
    const props = {
      context: {
        insertCss: emptyFunction
      }
    };

    component = shallow(<MortgagePercent {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
