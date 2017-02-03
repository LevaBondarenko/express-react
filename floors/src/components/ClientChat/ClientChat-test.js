/**
 * ClientChat test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import ClientChat from './ClientChat';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import initReducer from '../../reducers/utils/initReducer';

describe('<ClientChat />', () => {
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
          settings: initReducer({
            selectedCity: {
              'city_id': 23,
            },
            cityId: 23,
            countryCode: {}
          })
        }),
      }
    };

    component = shallow(<ClientChat {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
