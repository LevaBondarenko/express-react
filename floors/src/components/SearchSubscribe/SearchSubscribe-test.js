/**
 * SearchSubscribe test suite
 *
 */

import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {cloneDeep} from 'lodash';
import sinon from 'sinon';

import emptyFunction from 'fbjs/lib/emptyFunction';

import SearchSubscribe from './SearchSubscribe';
import SearchSubscribeForm from './SearchSubscribeForm';


describe('<SearchSubscribe />', () => {
  let component;
  let clock;

  let initialData;

  before(() => {
    /* global data*/
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    const  props = {
      context: {
        insertCss: emptyFunction
      }
    };

    data = {
      options: {
        cityId: 23
      }
    };

    component = mount(<SearchSubscribe {...props}/>);
  });

  describe('SearchSubscribe rendering test suite', () => {
    it('should render without errors', () => {
      expect(component).to.not.be.undefined;
    });

    it('should render without insertCss in props context object', () => {
      const props = {
        context: {}
      };
      const component = mount(<SearchSubscribe {...props}/>);

      expect(component).to.not.be.undefined;
    });

    it('contains an <SearchSubscribeForm /> component', () => {
      expect(component.find(SearchSubscribeForm)).to.have.length(1);
    });
  });

  describe('SearchSubscribe link actions test suite', () => {
    it('should call subscribe function once when clicked', () => {
      const props = {
        context: {
          insertCss: emptyFunction
        }
      };
      const spy = sinon.spy();
      const component = mount(<SearchSubscribe subscribe={spy} {...props} />);

      component.find(SearchSubscribeForm).find('a').simulate('click');
      expect(spy.calledOnce).to.equal(true);
    });

    it('should render proper text when clicked and user is authorized', () => {
      component.setState({
        isAuthorized: true
      });

      component.find(SearchSubscribeForm).find('a').simulate('click');
      expect(component.find(SearchSubscribeForm).find('div.searchSubscribe')
       .text()).to.equal('Вы подписались');
    });

    it('should render proper text when clicked and user is not authorized', () => { // eslint-disable-line max-len
      component.setState({
        isAuthorized: false
      });

      component.find(SearchSubscribeForm).find('a').simulate('click');
      expect(component.find(SearchSubscribeForm).find('a')
       .text()).to.equal('Подписаться на обновления');
    });

    it('should render proper text when clicked and user is authorized after a timeout', () => { // eslint-disable-line max-len
      try {
        clock = sinon.useFakeTimers();

        component.setState({
          isAuthorized: true
        });

        component.find(SearchSubscribeForm).find('a').simulate('click');
        clock.tick(3000);

        expect(component.find(SearchSubscribeForm).find('div.searchSubscribe')
         .text()).to.equal('Подписаться на обновления');
      } finally {
        clock.restore();
      }
    });

    it('should set state wasUnauthorized back to false when user authorized and clicked link for the second time', () => { // eslint-disable-line max-len
      component.setState({
        isAuthorized: true,
        wasUnauthorized: true
      });

      component.find(SearchSubscribeForm).find('a').simulate('click');
      expect(component.state('wasUnauthorized')).to.equal(false);
    });
  });

  describe('SearchSubscribe unmounting test suite', () => {
    it('should call componentWillUnmount on unmounting', () => {
      const props = {
        context: {
          insertCss: emptyFunction
        }
      };
      const component = mount(<SearchSubscribe {...props} />);
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
