/**
 * UProgressBar test suite
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';

import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

import UProgressBar from './UProgressBar';
import UProgressBarForm from './UProgressBarForm';


describe('<UProgressBar />', () => {
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

    component = mount(<UProgressBar {...props}/>);
  });

  describe('UProgressBar rendering test suite', () => {
    it('should render without errors', () => {
      expect(component).to.not.be.undefined;
    });

    it('contains an <UProgressBarForm /> component', () => {
      expect(component.find(UProgressBarForm)).to.have.length(1);
    });
  });

  describe('UProgressBar percentage test suite', () => {
    it('should pass percentage within 0..100 range to <UProgressBarForm /> when 0 <= weights sum <= 100', () => { // eslint-disable-line max-len
      const weights = {
        char_code: 10, // eslint-disable-line camelcase
        id: 20,
        name: 10,
        nominal: 10,
        num_code: 20, // eslint-disable-line camelcase
        symbol: 10,
        value: 10,
        something: 10
      };
      const model = {
        char_code: '', // eslint-disable-line camelcase
        id: '',
        name: 'Rubbles',
        nominal: 1,
        num_code: 12, // eslint-disable-line camelcase
        symbol: 'R',
        value: 4
      };

      component.setState({
        weights: weights,
        model: model
      });

      expect(component.find(UProgressBarForm).prop('percentage'))
      .to.be.within(0,100);
    });

    it('should pass percentage within 0..100 range to <UProgressBarForm /> when weights sum > 100', () => { // eslint-disable-line max-len
      const weights = {
        char_code: 30, // eslint-disable-line camelcase
        id: 20,
        name: 10,
        nominal: 10,
        num_code: 20, // eslint-disable-line camelcase
        symbol: 10,
        value: 10
      };
      const model = {
        char_code: '12', // eslint-disable-line camelcase
        id: '123123',
        name: 'Rubbles',
        nominal: 1,
        num_code: 12, // eslint-disable-line camelcase
        symbol: 'R',
        value: 4,
        something: 0
      };

      component.setState({
        weights: weights,
        model: model
      });

      expect(component.find(UProgressBarForm).prop('percentage'))
      .to.be.within(0,100);
    });

    it('should pass percentage within 0..100 range to <UProgressBarForm /> when weights sum < 0', () => { // eslint-disable-line max-len
      const weights = {
        char_code: -30, // eslint-disable-line camelcase
        id: 20,
        name: 10,
        nominal: 10,
        num_code: 20, // eslint-disable-line camelcase
        symbol: 10,
        value: 10
      };
      const model = {
        char_code: '12', // eslint-disable-line camelcase
        id: '',
        name: {},
        nominal: [],
        num_code: null, // eslint-disable-line camelcase
        symbol: null,
        value: ''
      };

      component.setState({
        weights: weights,
        model: model
      });

      expect(component.find(UProgressBarForm).prop('percentage'))
      .to.be.within(0,100);
    });

    it('should pass percentage equal to 0 to <UProgressBar /> when data from wss is unavailable', () => { // eslint-disable-line max-len
      const store = configureStore({});
      const props = {
        context: {
          insertCss: emptyFunction,
          store: store
        },
        store: store,
        objectName: 'no_such_object'
      };
      const component = mount(<UProgressBar {...props}/>);

      expect(component.find(UProgressBarForm).prop('percentage'))
      .to.be.equal(0);
    });
  });

});
