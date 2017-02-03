/**
 * MSearcherDistrictsM test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MSearcherSelectM from './MSearcherSelectM';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<MSearcherSelectM />', () => {
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
        searcher: {collections: {}}
      }
    };
    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store,
      field: 'someField'
    };

    component = shallow(<MSearcherSelectM {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
