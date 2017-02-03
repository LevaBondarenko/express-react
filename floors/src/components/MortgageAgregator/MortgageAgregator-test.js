import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';

import emptyFunction from 'fbjs/lib/emptyFunction';
import configureStore from '../../core/configureStore';
import {cloneDeep} from 'lodash';

import MortgageAgregator from './MortgageAgregator';
import MortgageAgregatorForm from './MortgageAgregatorForm';

describe('<MortgageAgregator />', () => {
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
        object: {
          field: {}
        }
      }
    };
    const store = configureStore({});

    props = {
      context: {
        insertCss: emptyFunction,
        store: store
      },
      store: store,
      fieldName: 'field',
      objectName: 'object'
    };

    component = mount(<MortgageAgregator {...props}/>);
  });

  describe('MortgageAgregator rendering test suite', () => {
    it('should render without errors', () => {
      expect(component).to.not.be.undefined;
    });

    it('contains an <MortgageAgregatorForm /> component', () => {
      expect(component.find(MortgageAgregatorForm)).to.have.length(1);
    });
  });

  describe('MortgageAgregator props availability test suite', () => {
    it('should pass correct padding value to <MortgageAgregatorForm />', () => { // eslint-disable-line max-len
      props.padding = '10';

      const component = mount(<MortgageAgregator {...props}/>);

      expect(component.find(MortgageAgregatorForm).prop('alignmentPadding'))
      .to.have.string('10');
    });
  });

  describe('MortgageAgregator beginningWith and endingWith props word selecting test suite', () => { // eslint-disable-line max-len
    it('should pass correct value to <MortgageAgregatorForm /> when count === 0 and zeroCountMessage is not defined', () => { // eslint-disable-line max-len
      props.beginningWith = 'example|examples|something';

      const component = mount(<MortgageAgregator {...props}/>);

      expect(component.find(MortgageAgregatorForm).prop('beginning'))
      .to.have.string('something');
    });
  });

});
