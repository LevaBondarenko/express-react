/**
 * MSearcherSave2 test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MSearcherSave2 from './MSearcherSave2';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<MSearcherSave2 />', () => {
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
      redux: {
        searcher: {collections: {}, fields: []}
      },
      options: {
        cityId: 23,
        lkSettings: {modules: []}
      },
      userData: {
        isAuthorized: false
      }
    };
    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store,
    };

    component = shallow(<MSearcherSave2 {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
