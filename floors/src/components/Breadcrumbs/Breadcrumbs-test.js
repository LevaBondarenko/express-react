/**
 * SearchSubscribe test suite
 *
 */

import React from 'react';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {cloneDeep} from 'lodash';
import emptyFunction from 'fbjs/lib/emptyFunction';

import Breadcrumbs from './Breadcrumbs';
import BreadcrumbsView from './BreadcrumbsView';

import bs from '../../stores/BlogStore';
import Dispatcher from '../../core/Dispatcher';

/* global data */

describe('<Breadcrumbs />', () => {
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
            name: 'Тюмень',
            name_tr: 'Tyumen' // eslint-disable-line camelcase
          }
        },
        districts: {
          801: {
            name: '2-й Заречный мкр',
            name_tr: '2-jj-Zarechnyjj-mkr', // eslint-disable-line camelcase
            trakt_id: 7 // eslint-disable-line camelcase
          }
        },
        streets: {
          271: {
            name: 'Газовиков',
            name_tr: 'Gazovikov' // eslint-disable-line camelcase
          }
        }
      },
      options: {
        cityId: 23
      },
      seo: {
        layoutHeader: {
          defaults: {
            cottages: 'Загородная недвижимость',
            flats: 'Вторичное жилье',
            nh_flats: 'Квартиры в новостройках', // eslint-disable-line camelcase
            offices: 'коммерческой недвижимости',
            rent: 'Аренда жилья'
          },
          searchDefaults: {
            cottages: 'Поиск загородной недвижимости',
            flats: 'Поиск вторичного жилья',
            nh_flats: 'Поиск новостроек', // eslint-disable-line camelcase
            offices: 'Поиск коммерческой недвижимости',
            rent: 'Поиск квартир в аренду'
          }
        },
        requestSingleParams: []
      },
      page: {}
    };

    props = {
      context: {
        insertCss: emptyFunction
      }
    };

    component = mount(<Breadcrumbs {...props}/>);
  });

  afterEach(() => {
    component.unmount();
  });

  describe('Breadcrumbs rendering test suite', () => {
    it('should render without errors', () => {
      expect(component).to.not.be.undefined;
    });

    it('should render without insertCss in props context object', () => {
      props.context = {};

      component = mount(<Breadcrumbs {...props}/>);

      expect(component).to.not.be.undefined;
    });

    it('contains an <BreadcrumbsView /> component', () => {
      expect(component.find(BreadcrumbsView)).to.have.length(1);
    });
  });

  describe('Breadcrumbs main items test suite', () => {
    it('should render MAIN', () => {
      props.wpTitle = 'Блог';

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('li').first().text()).to.equal('Главная');
    });

    it('should render custom MAIN when mainTitle is set', () => {
      props.mainTitle = 'MAIN';

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('li').first().text()).to.equal('MAIN');
    });

    it('should render custom last breadcrumb when userTitle is set', () => {
      props.userTitle = 'USER';
      props.mainTitle = 'MAIN';

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('li').last().text()).to.equal('USER');
    });

    it('should render main > BLOG (or other main section breadcrumbs) using wp_title from WP', () => { // eslint-disable-line max-len
      props.wpTitle = 'Блог';

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('li').last().text()).to.equal('Блог');
    });

    it('should render main > FLATS (or others) > ... from ancestors props', () => { // eslint-disable-line max-len
      props.ancestors = [
        {
          href: 'http://www.etagi.dev/realty',
          title: 'Вторичная'
        }
      ],

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.equal('Вторичная');
    });
  });

  describe('Breadcrumbs main > flats(omitted) > CITY items test suite', () => {
    it('should render ... > CITY > ... (in object)', () => {
      data.collections.cities[27] = {
        name: 'Ишим',
        name_tr: 'Ishim' // eslint-disable-line camelcase
      };
      data.object = {
        info: {
          city_id: '27' // eslint-disable-line camelcase
        }
      };
      data.options.associated_cities = '27'; // eslint-disable-line camelcase

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.equal('Ишим');
    });

    it('should not render ... > CITY > ... (in object) when there are no such city in cities collection', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '27' // eslint-disable-line camelcase
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.not.equal('Тюмень');
    });
  });

  describe('Breadcrumbs main > commerce(omitted) > city(omitted) > ACTION items test suite', () => { // eslint-disable-line max-len
    it('should render ... > ACTION > ... (in object) when action is an array', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          action_sl: ['sale'], // eslint-disable-line camelcase
          city_id: '23' // eslint-disable-line camelcase
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.equal('Купить');
    });

    it('should render ... > ACTION > ... (in object) when action is not an array', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          action_sl: 'lease', // eslint-disable-line camelcase
          city_id: '23' // eslint-disable-line camelcase
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.equal('Снять');
    });

    it('should render main > realty(omitted) > city(omitted) > ROOMS > ... (in object)', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          rooms: '1',
          type: 'flat'
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text())
       .is.equal('Однокомнатные квартиры');
    });
  });

  describe('Breadcrumbs main > realty(omitted) > city(omitted) > ROOMS items test suite', () => { // eslint-disable-line max-len
    it('should render ... > ROOMS > ... (in object) when rooms === ">4"', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          rooms: '>4',
          type: 'flat'
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text())
       .is.equal('Четырехкомнатные квартиры');
    });

    it('should render ... > ROOMS > ... (in object) when type is an array', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          rooms: '1',
          type: ['flat']
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text())
       .is.equal('Однокомнатные квартиры');
    });

    it('should not render ... > ROOMS > ... (in object) when there are no rooms or no type', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          type: 'flat'
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text())
       .is.not.equal('Однокомнатные квартиры');
    });
  });

  describe('Breadcrumbs main > realty_out(omitted) > city(omitted) > TRAKT items test suite', () => { // eslint-disable-line max-len
    it('should render ... > TRAKT > ... (in object)', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          trakt_id: '4' // eslint-disable-line camelcase
        }
      };
      data.collections.trakts = {
        4: {
          name: 'Салаирский тракт',
          name_tr: 'Salairskijj-trakt' // eslint-disable-line camelcase
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.equal('Салаирский тракт');
    });

    it('should not render ... > TRAKT > ... (in object) when there is district_id', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          district_id: '801', // eslint-disable-line camelcase
          trakt_id: '4' // eslint-disable-line camelcase
        }
      };
      data.collections.trakts = {
        4: {
          name: 'Салаирский тракт',
          name_tr: 'Salairskijj-trakt' // eslint-disable-line camelcase
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text())
       .is.not.equal('Салаирский тракт');
    });
  });

  describe('Breadcrumbs main > realty(omitted) > city(omitted) > DISTRICT items test suite', () => { // eslint-disable-line max-len
    it('should render ... > DISTRICT > ... (in object) when size(model) is 0', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          district_id: '801' // eslint-disable-line camelcase
        }
      };
      data.collections.trakts = {
        4: {
          name: 'Салаирский тракт',
          name_tr: 'Salairskijj-trakt' // eslint-disable-line camelcase
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.equal('2-й Заречный мкр');
    });
  });

  describe('Breadcrumbs main > realty(omitted) > city(omitted) > district(omitted) > STREET items test suite', () => { // eslint-disable-line max-len
    it('should render ... > STREET > ... (in object)', () => {
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          class: 'flats', // eslint-disable-line camelcase
          street_id: '271' // eslint-disable-line camelcase
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.equal('Газовиков');
    });

    it('should not render ... > STREET > ... (in object) when there are no such street in streets collection', () => { // eslint-disable-line max-len
      data.object = {
        info: {
          city_id: '23', // eslint-disable-line camelcase
          class: 'flats', // eslint-disable-line camelcase
          street_id: '272' // eslint-disable-line camelcase
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('a').last().text()).is.not.equal('Газовиков');
    });
  });

  describe('Breadcrumbs blog items test suite', () => {
    it('should render main > blog(omitted) > CATEGORY', () => {
      const stubbedPosts = [
        {
          categories: ['Вторичное жилье', 'Новостройки', 'Аренда'],
          categories_tr: ['vtorichnoe-zhile', 'novostrojjki', 'arenda'] // eslint-disable-line camelcase
        }
      ];
      const dPayload = {
        action: {
          actionType: 'BS_SET',
          data: {
            isLoading: false,
            posts: stubbedPosts
          }
        },
        source: 'VIEW_ACTION'
      };

      data.blog = {
        category: 'arenda'
      };

      component = mount(<Breadcrumbs {...props}/>);

      const registerStub = sinon.stub(Dispatcher, 'register');
      const dispatchSpy = sinon.spy(Dispatcher, 'dispatch');

      Dispatcher.register(bs);
      Dispatcher.dispatch(dPayload);

      registerStub.restore();
      dispatchSpy.restore();

      expect(component.find('li').last().text()).is.equal('Аренда');
    });

    it('should render main > blog(omitted) > CATEGORY (short name) when category name amounts to more than 50 symbols', () => { // eslint-disable-line max-len
      const stubbedPosts = [
        {
          categories: ['Вторичное жилье', 'Новостройки', 'ДесятьсимвДесятьсимвДесятьсимвДесятьсимвДесятьсимвДесятьсимв'], // eslint-disable-line camelcase, max-len
          categories_tr: ['vtorichnoe-zhile', 'novostrojjki', 'tensymbolstensymbolstensymbolstensymbolstensymbolstensymbols'] // eslint-disable-line camelcase, max-len
        }
      ];
      const dPayload = {
        action: {
          actionType: 'BS_SET',
          data: {
            isLoading: false,
            posts: stubbedPosts
          }
        },
        source: 'VIEW_ACTION'
      };

      data.blog = {
        category: 'tensymbolstensymbolstensymbolstensymbolstensymbolstensymbols'
      };

      component = mount(<Breadcrumbs {...props}/>);

      const registerStub = sinon.stub(Dispatcher, 'register');
      const dispatchSpy = sinon.spy(Dispatcher, 'dispatch');

      Dispatcher.register(bs);
      Dispatcher.dispatch(dPayload);

      registerStub.restore();
      dispatchSpy.restore();

      expect(component.find('li').last().text()).is.equal('ДесятьсимвДесятьсимвДесятьсимвДесятьсимвДесятьсимв ...'); // eslint-disable-line max-len
    });

    it('should render main > blog(omitted) > category > BLOGPOST TITLE', () => { // eslint-disable-line max-len
      const stubbedPosts = [
        {
          categories: ['Вторичное жилье', 'Новостройки', 'Аренда'], // eslint-disable-line camelcase
          categories_tr: ['vtorichnoe-zhile', 'novostrojjki', 'arenda'], // eslint-disable-line camelcase
          post_title: 'Свое жилье или аренда?', // eslint-disable-line camelcase
        }
      ];
      const dPayload = {
        action: {
          actionType: 'BS_SET',
          data: {
            isLoading: false,
            posts: stubbedPosts
          }
        },
        source: 'VIEW_ACTION'
      };

      data.blog = {
        blogpost: {
          category: 'Вторичное жилье',
          categoryTr: 'vtorichnoe-zhile',
          title: 'Свое жилье или аренда?',
          id: 3961
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      const registerStub = sinon.stub(Dispatcher, 'register');
      const dispatchSpy = sinon.spy(Dispatcher, 'dispatch');

      Dispatcher.register(bs);
      Dispatcher.dispatch(dPayload);

      registerStub.restore();
      dispatchSpy.restore();
      expect(component.find('li').last().text()).is.equal('Свое жилье или аренда?'); // eslint-disable-line max-len
    });

    it('should render main > blog(omitted) > category > BLOGPOST TITLE (short one) when blogpost title amounts to more than 50 symbols', () => { // eslint-disable-line max-len
      const stubbedPosts = [
        {
          categories: ['Вторичное жилье', 'Новостройки', 'Аренда'], // eslint-disable-line camelcase
          categories_tr: ['vtorichnoe-zhile', 'novostrojjki', 'arenda'], // eslint-disable-line camelcase
          post_title: 'ДесятьсимвДесятьсимвДесятьсимвДесятьсимвДесятьсимвДесятьсимв', // eslint-disable-line camelcase, max-len
        }
      ];
      const dPayload = {
        action: {
          actionType: 'BS_SET',
          data: {
            isLoading: false,
            posts: stubbedPosts
          }
        },
        source: 'VIEW_ACTION'
      };

      data.blog = {
        blogpost: {
          category: 'Вторичное жилье',
          categoryTr: 'vtorichnoe-zhile',
          title: 'ДесятьсимвДесятьсимвДесятьсимвДесятьсимвДесятьсимвДесятьсимв',
          id: 3961
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      const registerStub = sinon.stub(Dispatcher, 'register');
      const dispatchSpy = sinon.spy(Dispatcher, 'dispatch');

      Dispatcher.register(bs);
      Dispatcher.dispatch(dPayload);

      registerStub.restore();
      dispatchSpy.restore();

      expect(component.find('li').last().text()).is.equal('ДесятьсимвДесятьсимвДесятьсимвДесятьсимвДесятьсимв ...'); // eslint-disable-line max-len
    });
  });

  describe('Mortgage programs and banks items test suite', () => {
    it('should render main > mortgage > bank name > MORTGAGE PROGRAM', () => {
      props.ancestors = [
        {
          href: 'http://www.etagi.dev/ipoteka',
          title: 'Ипотека'
        },
        {
          href: 'http://www.etagi.dev/ipoteka/bank/',
          title: ''
        }
      ];
      data.redux = {
        mortgage: {
          bank: {
            name: 'Газпромбанк',
            name_tr: 'Gazprombank' // eslint-disable-line camelcase
          },
          program: {
            info: 'some program'
          }
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('li').last().text())
       .is.equal('Ипотечная программа');
    });

    it('should render main > mortgage > BANK NAME', () => {
      props.ancestors = [
        {
          href: 'http://www.etagi.dev/ipoteka',
          title: 'Ипотека'
        }
      ];
      data.redux = {
        mortgage: {
          bank: {
            name: 'Газпромбанк',
            name_tr: 'Gazprombank' // eslint-disable-line camelcase
          }
        }
      };

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('li').last().text()).is.equal('Газпромбанк');
    });
  });

  describe('Builder items test suite', () => {
    it('should render main > zastr(omitted) > BUILDER NAME', () => { // eslint-disable-line max-len
      props.builderName = 'Сибстройсервис';

      component = mount(<Breadcrumbs {...props}/>);

      expect(component.find('li').last().text()).is.equal('Сибстройсервис');
    });
  });

  describe('Items microdata test suite', () => {
    it('content attribute should have correct breadcrumb position', () => {
      expect(component.find('meta').first().prop('content')).is.equal(1);
    });
  });

  // describe('Breadcrumbs styles test suite', () => {
  //   it('should have breadcrumbs__activePage as class for last item', () => { // eslint-disable-line max-len
  //     const props = {
  //       context: {
  //         insertCss: emptyFunction
  //       },
  //       wpTitle: 'Блог'
  //     };

  //     component = mount(<Breadcrumbs {...props}/>);

  //     expect(component.find('li').last().find('span').last()
  //      .hasClass('breadcrumbs__activePage')).to.equal(true); // for now generation scss classes ***__** for tests is bugged (getting 'undefined')
  //   });
  // });

  describe('Breadcrumbs unmounting test suite', () => {
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
