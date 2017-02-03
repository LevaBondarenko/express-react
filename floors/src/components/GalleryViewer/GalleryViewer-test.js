/**
 * GalleryViewer test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import GalleryViewer from './GalleryViewer';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<GalleryViewer />', () => {
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
    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store
    };

    component = shallow(<GalleryViewer {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
