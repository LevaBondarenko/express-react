/**
 * FavButton2 test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import FavButton2 from './FavButton2';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<FavButton2 />', () => {
  let component;
  let initialData;

  /* global data*/
  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {
      userData: {},
      redux: {},
      options: {cityId: 23, lkSettings: {modules: []}}
    };
    const store = configureStore({});
    const props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store
    };


    component = shallow(<FavButton2 {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
