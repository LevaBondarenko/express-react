import Image from './Image';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import {cloneDeep} from 'lodash';
import React from 'react';

/*global data*/

describe('Image component test suite', () => {
  let initialData;

  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  describe('Image component fullpath test', () => {
    let component, props;

    beforeEach(() => {
      data = {options: {mediaSource: 2}}; // eslint-disable-line no-unused-vars
      props = {
        image: '//cdn-media.etagi.com/300267/photos/55024e2ddf2bc.jpg',
        className: 'img-responsive',
      };

      component = shallow(<Image {...props}/>);
    });

    it('should be render components without errors', () => {
      expect(component).to.not.be.undefined;
    });

    it('should be render image with given fullpath src and className', () => {
      expect(component.html()).to.equal(
        `<img class="${props.className}" src="${props.image}" alt=""/>`
      );
    });
  });

  describe('Image component test cdn test', () => {
    let component, props;

    beforeEach(() => {
      data = {options: {mediaSource: 2}}; // eslint-disable-line no-unused-vars
      props = {
        image: '55024e2ddf2bc.jpg',
        className: 'img-responsive',
        visual: 'photos',
        width: 300,
        height: 267
      };

      component = shallow(<Image {...props}/>);
    });

    it('should be render image with name, type and dimensions cdn', () => {
      expect(component.html()).to.equal(
        `<img class="${props.className}" src="//cdn-media.etagi.com/${props.width}${props.height}/photos/${props.image}" alt=""/>` // eslint-disable-line
      );
    });

  });

  describe('Image component api-media test', () => {
    let component, props;

    beforeEach(() => {
      data = {options: {mediaSource: 2}}; // eslint-disable-line no-unused-vars
      props = {
        image: '55024e2ddf2bc.jpg',
        className: 'img-responsive',
        visual: 'photos',
        width: 300,
        height: 267,
        source: 1
      };

      component = shallow(<Image {...props}/>);
    });

    it('should be render image with name, type and dimensions apimedia', () => {
      expect(component.html()).to.equal(
        `<img class="${props.className}" src="//api-media.etagi.com/${props.width}${props.height}/photos/${props.image}" alt=""/>` // eslint-disable-line
      );
    });
  });

  describe('Image component no_photo test with undefined visual', () => {
    let component, props;

    beforeEach(() => {
      data = {options: {mediaSource: 2}}; // eslint-disable-line no-unused-vars
      props = {
        image: null,
        className: 'img-responsive',
        visual: undefined,
        width: 300,
        height: 267
      };

      component = shallow(<Image {...props}/>);
    });

    it('should be render no_photo image with global source', () => {
      expect(component.html()).to.equal(
        `<img class="${props.className}" src="//cdn-media.etagi.com/content/no_photo/photos.png" alt=""/>` // eslint-disable-line
      );
    });
  });

  describe('Image component no_photo with int 0', () => {
    let component, props;

    beforeEach(() => {
      data = {options: {mediaSource: 2}}; // eslint-disable-line no-unused-vars
      props = {
        image: '0',
        className: 'img-responsive',
        visual: 'photos',
        width: 300,
        height: 267
      };

      component = shallow(<Image {...props}/>);
    });

    it('should be render image with global source', () => {
      expect(component.html()).to.equal(
        `<img class="${props.className}" src="//cdn-media.etagi.com/content/no_photo/photos.png" alt=""/>` // eslint-disable-line
      );
    });
  });

});
