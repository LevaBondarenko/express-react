/**
 * ThreeDimensionDoodah test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import ThreeDimensionDoodah from './ThreeDimensionDoodah';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';

describe('<ThreeDimensionDoodah />', () => {
  let component;

  beforeEach(() => {
    const props = {
      context: {
        insertCss: emptyFunction
      }
    };

    component = shallow(<ThreeDimensionDoodah {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
