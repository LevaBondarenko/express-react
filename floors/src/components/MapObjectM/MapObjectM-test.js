/**
 * MapObjectM test suite
 *
 */

import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

import MapObjectM from './MapObjectM';

/* global data*/
describe('<MapObjectM />', () => {
  let component;
  let initialData;
  let props;

  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {
      options: {
        countryCode: {
          avail: [7, 375, 380],
          current: 7
        }
      },
      redux: {
        realtorsList: {
          0: {
            f: 'testf',
            fMaiden: 'testfm',
            i: 'testn',
            id: '1010111010',
            o: 'testp',
            phone: '89999999999',
            photo: null
          },
          settings: '{"dsMN":0,"sOV":"1","sWP":"1"}'
        },
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

    component = shallow(<MapObjectM {...props}/>);
  });

  describe('MapObjectM rendering test suite', () => {
    it('should render without errors', () => {
      expect(component).to.not.be.undefined;
    });
  });
});
