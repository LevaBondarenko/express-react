/**
 * MobileMenu test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MobileMenu from './MobileMenu';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<MobileMenu />', () => {
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
      options: {cityId: 23, lkSettings: {}},
      collections: {}
    };

    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store
    };

    component = shallow(<MobileMenu {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
