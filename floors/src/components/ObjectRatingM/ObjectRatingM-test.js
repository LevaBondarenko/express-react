/**
 * ObjectRating test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import ObjectRatingM from './ObjectRatingM';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {cloneDeep} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';

describe('<ObjectRatingM />', () => {
  let component;
  let initialData;
  let props;

  before(() => {
    /* global data*/
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {
      redux: {
        object: {
          info: {
            id: 5,
            ratings: `{"124": {"name":"Местоположение","value":"6.41646"},
              "123":{"name":"Инфраструктура","value":"6.80387"},
              "122":{"name":"Информация о доме","value":"7.86925"},
              "0":{"value":"7.02373"}}`
          }
        }
      },
      options: {
        minRating: 6
      }
    };

    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store
    };

    component = mount(<ObjectRatingM {...props}/>);
  });

  afterEach(() => {
    component.unmount();
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });
});
