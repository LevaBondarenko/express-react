/**
 * MobileObjectInfo test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MobileObjectInfo from './MobileObjectInfo';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import initReducer from '../../reducers/utils/initReducer';

describe('<MobileObjectInfo />', () => {
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
          settings: initReducer({})
        }),
      }
    };

    component = shallow(<MobileObjectInfo {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
