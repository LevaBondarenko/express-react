/**
 * MSearcherCheckBox2 test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MSearcherCheckBox2 from './MSearcherCheckBox2';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<MSearcherCheckBox2 />', () => {
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
        searcher: {
          fields: ['city_id', 'class', 'type'],
          city_id: 23,  //eslint-disable-line camelcase
          class: 'flats'
        }
      }
    };
    const store = configureStore({});

    const props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store,
      field: ['type']
    };

    component = shallow(<MSearcherCheckBox2 {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
