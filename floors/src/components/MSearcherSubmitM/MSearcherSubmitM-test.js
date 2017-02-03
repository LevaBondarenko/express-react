/**
 * MSearcherSubmitM test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MSearcherSubmitM from './MSearcherSubmitM';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<MSearcherSubmitM />', () => {
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
      redux: {
        searcher: {fields: ['city_id', 'class'], city_id: 23, class: 'flats'}  //eslint-disable-line camelcase
      },
      seo: {redirects: 1}
    };
    const store = configureStore({});

    const props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store
    };

    component = shallow(<MSearcherSubmitM {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
