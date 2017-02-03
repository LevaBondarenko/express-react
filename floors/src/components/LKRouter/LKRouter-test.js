/**
 * LKRouter test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import LKRouter from './LKRouter';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<LKRouter />', () => {
  let component;
  let initialData;
  let props;

  /* global data*/
  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {
      ui: {currency: {}},
      intl: {currency: {}},
      options: {cityId: 23, lkSettings: {}, countryCode: {}},
      collections: {},
      userdata: {}
    };
    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store
    };

    component = shallow(<LKRouter {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
