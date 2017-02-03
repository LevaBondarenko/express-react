/**
 * SearchTitle test suite
 *
 */

import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import {cloneDeep} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';

import SearchTitle from './SearchTitle';
import SearchTitleView from './SearchTitleView';

/* global data */


describe('<SearchTitle />', () => {
  let component;
  let initialData;
  let props;

  before(() => {
    initialData = cloneDeep(data);
  });

  after(() => {
    data = initialData;
  });

  beforeEach(() => {
    data = {
      collections: {
        cities: {
          23: {
            office: {
              name_prepositional: 'Тюмени' // eslint-disable-line camelcase
            }
          }
        }
      },
      objects: {
        request: {}
      },
      options: {
        cityId: 23,
      },
      page: {},
      seo: {
        layoutHeader: {
          defaults: {
            cottages: 'Загородная недвижимость',
            flats: 'Вторичное жильё',
            nh_flats: 'Квартиры в новостройках', // eslint-disable-line camelcase
            offices: 'коммерческой недвижимости',
            rent: 'Аренда жилья'
          },
          rooms: {
            1: {
              flats: 'Однокомнатные квартиры',
              nh_flats: 'Однокомнатные квартиры', // eslint-disable-line camelcase
              rent: 'Аренда однокомнатной квартиры'
            },
            2: {
              flats: 'Двухкомнатные квартиры',
              nh_flats: 'Двухкомнатные квартиры', // eslint-disable-line camelcase
              rent: 'Аренда двухкомнатной квартиры'
            },
            3: {
              flats: 'Трехкомнатные квартиры',
              nh_flats: 'Трехкомнатные квартиры', // eslint-disable-line camelcase
              rent: 'Аренда трехкомнатной квартиры'
            },
            '>4': {
              flats: 'Четырехкомнатные квартиры',
              nh_flats: 'Четырехкомнатные квартиры', // eslint-disable-line camelcase
              rent: 'Аренда четырехкомнатной квартиры'
            }
          },
          typesRealtyOut: {
            base: 'базы',
            busines: 'готового бизнеса',
            cottage: 'Коттеджи',
            dev: 'производства',
            dev_land: 'земли под производство', // eslint-disable-line camelcase
            ferma: 'ферм',
            garage: 'гаражей',
            garden: 'Дачи',
            house: 'Дома',
            land: 'земельных участков',
            land_out: 'Земельные участки', // eslint-disable-line camelcase
            office: 'офисов',
            other: 'недвижимости свободного назначения',
            pansion: 'Пансионаты',
            sklad: 'склада',
            torg: 'торговых помещений',
            townhouse: 'Таунхаусы'
          }
        }
      }
    };

    props = {
      context: {
        insertCss: emptyFunction
      }
    };

    component = mount(<SearchTitle {...props}/>);
  });

  afterEach(() => {
    component.unmount();
  });

  describe('SearchTitle rendering test suite', () => {
    it('should render without errors', () => {
      expect(component).to.not.be.undefined;
    });

    it('should render without insertCss in props context object', () => {
      component.setProps({context: {}});

      expect(component).to.not.be.undefined;
    });

    it('contains an <SearchTitleView /> component', () => {
      expect(component.find(SearchTitleView)).to.have.length(1);
    });
  });

  describe('SearchTitle title test suite', () => {
    it('should render header from props', () => {
      component.unmount();

      props = {
        context: {
          insertCss: emptyFunction
        },
        layoutHeader: 'Заголовок из настроек'
      };

      component = mount(<SearchTitle {...props}/>);

      expect(component.find('h1').text()).is.equal('Заголовок из настроек');
    });
  });
});
