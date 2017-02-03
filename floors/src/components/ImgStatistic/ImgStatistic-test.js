/**
 * ImgStatistic test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import ImgStatistic from './ImgStatistic';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<ImgStatistic />', () => {
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
          fields: ['city_id', 'class', 'district_id'],
          city_id: 23, //eslint-disable-line camelcase
          class: 'flats'
        },
        object: {
          info: {class: 'flats', object_id: 1234567890} //eslint-disable-line camelcase
        }
      }
    };
    const store = configureStore({});

    const props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store
    };

    component = shallow(<ImgStatistic {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
