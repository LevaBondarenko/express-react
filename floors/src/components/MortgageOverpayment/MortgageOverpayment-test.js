/**
 * MortgageOverpayment test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MortgageOverpayment from './MortgageOverpayment';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import {cloneDeep} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';

describe('<MortgageOverpayment />', () => {
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
        mortgage: {
          program: {
            info: {
              'program_title': 'some title',
              'program_text': 'some text'
            },
            percents: [
              {
                income: '{1, 2}',
                'avanse_max': 30,
                'avanse_min': 20,
                'years_max': 10,
                'years_min': 1,
                pref: 0.5,
                percent: 13.5
              }
            ]
          },
          bank: {
            id: 1,
            name: 'bank name',
            'name_tr': 'bank name_tr',
            image: 'src'
          }
        },
        options: {
          mediaSource: 2,
          cityId: 23
        }
      },
      ui: {
        currency: {}
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

    component = shallow(<MortgageOverpayment {...props}/>);
  });

  afterEach(() => {
    component.unmount();
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

  context('should correctly render banner', () => {

  });

  context('should correctly render modal', () => {

  });

  context('should correctly render modal', () => {

  });
});
