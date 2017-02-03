/**
 * MortgageBroker test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import MortgageBroker from './MortgageBroker';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

describe('<MortgageBroker />', () => {
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

  context('when props not present', () => {
    beforeEach(() => {
      const store = configureStore({});

      props = {
        context: {
          insertCss: emptyFunction,
          store: store
        },
        store: store
      };

      component = shallow(<MortgageBroker {...props}/>);
    });

    it('should render without errors', () => {
      expect(component).to.not.be.undefined;
    });

    it('should render top template withStyles by default', () => {
      // expect(
      //   component.find('WithStyles(MortgageBrokerTopView)')
      // ).to.have.length(1);
    });
  });
  context('when props are present', () => {
    beforeEach(() => {
      const store = configureStore({});

      props = {
        context: {
          insertCss: emptyFunction,
          store: store
        },
        store: store,
        template: 'bottom'
      };

      component = shallow(<MortgageBroker {...props}/>);
    });

    it('should render bottom template ', () => {
      // expect(component.find('WithStyles(MortgageBrokerBottomView)'))
      //   .to.have.length(1);
    });
  });
});
