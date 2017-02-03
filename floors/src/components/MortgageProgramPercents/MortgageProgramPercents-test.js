/**
 * MortgageProgramPercents test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

import MortgageProgramPercents from './MortgageProgramPercents';
import MortgageProgramPercentsView from './MortgageProgramPercentsView';
import THead from './THead';
import TRow from './TRow';

describe('<MortgageProgramPercents />', () => {
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

    component = mount(<MortgageProgramPercents {...props}/>);
  });

  afterEach(() => {
    component.unmount();
  });

  describe('MortgageProgramPercents rendering test suite', () => {
    it('should render without errors', () => {
      expect(component).to.not.be.undefined;
    });

    it('contains an <MortgageProgramPercentsView /> component', () => {
      expect(component.find(MortgageProgramPercentsView)).to.have.length(1);
    });

    it('should contain class redPercent when program have pref', () => {
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

      component = mount(<MortgageProgramPercents {...props}/>);

      expect(component.find('.redPercent').text())
        .to.equal('с нами 13 %');
    });

    it('should render th with 40% width when yearsGroup > 2', () => {
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
                  percent: 13.5
                },
                {
                  income: '{1}',
                  'avanse_max': 50,
                  'avanse_min': 30,
                  'years_max': 20,
                  'years_min': 10,
                  percent: 13.5
                },
                {
                  income: '{1}',
                  'avanse_max': 50,
                  'avanse_min': 30,
                  'years_max': 30,
                  'years_min': 10,
                  percent: 13.5
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

      component = mount(<MortgageProgramPercents {...props}/>);

      expect(component.find(THead).find('.cell6840').text())
        .to.equal('Первоначальный взнос');
    });

    it('should render th with 50% width when yearsGroup < 3', () => {
      component = mount(<MortgageProgramPercents {...props}/>);

      expect(component.find('.cell6850').text())
        .to.equal('Первоначальный взнос');
    });
  });

  describe('MortgageProgramPercents logic test suite', () => {
    it('should replace equal rows', () => {
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
                  percent: 13.5
                },
                {
                  income: '{1}',
                  'avanse_max': 50,
                  'avanse_min': 30,
                  'years_max': 20,
                  'years_min': 10,
                  percent: 13.5
                },
                {
                  income: '{1}',
                  'avanse_max': 50,
                  'avanse_min': 30,
                  'years_max': 20,
                  'years_min': 10,
                  percent: 13.5
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

      component = mount(<MortgageProgramPercents {...props}/>);

      expect(component.find(TRow)).to.have.length(2);
    });
  });

  describe('MortgageProgramPercents unmounting test suite', () => {
    it('should call componentWillUnmount on unmounting', () => {
      const instance = component.instance();

      try {
        sinon.spy(instance, 'componentWillUnmount');
        component.unmount();

        expect(instance.componentWillUnmount.calledOnce).to.equal(true);
      } finally {
        instance.componentWillUnmount.restore();
      }
    });
  });

});
