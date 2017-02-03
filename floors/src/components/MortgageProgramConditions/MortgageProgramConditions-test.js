/**
 * MortgageProgramConditions test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MortgageProgramConditions from './MortgageProgramConditions';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import {cloneDeep} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';

describe('<MortgageProgramConditions />', () => {
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
            percents: [
              {
                income: '{1, 2}',
                'avanse_max': 30,
                'avanse_min': 20,
                'years_max': 10,
                'years_min': 1,
                pref: 0.5,
                percent: 13.5
              },
              {
                income: '{2}',
                'avanse_max': 40,
                'avanse_min': 25,
                'years_max': 15,
                'years_min': 5,
                percent: 14
              },
              {
                income: '{1}',
                'avanse_max': 30,
                'avanse_min': 20,
                'years_max': 30,
                'years_min': 10,
                percent: 12
              }
            ]
          }
        }
      }
    };

    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      tableTitle: 'Условия кредита',
      store: store
    };

    component = shallow(<MortgageProgramConditions {...props}/>);
  });

  it('should render without errors', () => {
    expect(component).to.not.be.undefined;
  });

});
