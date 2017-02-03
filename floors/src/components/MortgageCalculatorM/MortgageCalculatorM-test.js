/**
 * MortgageCalculatorM test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MortgageCalculatorM from './MortgageCalculatorM';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {cloneDeep} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';

describe('<MortgageCalculatorM />', () => {
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
        mortgage: {},
      },
      ui: {
        currency: {
          current: {}
        }
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

    component = mount(<MortgageCalculatorM {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
