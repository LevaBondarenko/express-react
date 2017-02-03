/**
 * ObjectRating test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import ObjectRating from './ObjectRating';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {cloneDeep} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';

describe('<ObjectRating />', () => {
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
    props = {
      context: {
        insertCss: emptyFunction
      }
    };

    data = {
      object: {
        info: {
          id: 5,
          ratings: `{"124": {"name":"Местоположение","value":"6.41646"},
            "123":{"name":"Инфраструктура","value":"6.80387"},
            "122":{"name":"Информация о доме","value":"7.86925"},
            "0":{"value":"7.02373"}}`
        }
      },
      options: {
        minRating: 6
      }
    };


    component = mount(<ObjectRating {...props}/>);
  });

  afterEach(() => {
    component.unmount();
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });
});
