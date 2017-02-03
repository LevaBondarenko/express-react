var colors = require('colors');

var Element = require("../Common/Element.js");

var ph = Object.create(require("../Helpers/pageHelpers.js"));
var wh = Object.create(require("../Helpers/waitHelpers.js"));

/* WIDGETS */
var citySelector = Object.create(require("../Widgets/CitySelectorExtend_Widget.js"));
var logo = Object.create(require("../Widgets/Logo_Widget.js"));
var scrollTop = Object.create(require("../Widgets/ScrollTop_Widget.js"));
var workTime = Object.create(require("../Widgets/WorkTime_Widget.js"));

var order = Object.create(require("../Widgets/Order_Widget.js"));
var numberCounter = Object.create(require("../Widgets/NumberCounter_Widget.js"));
var text = Object.create(require("../Widgets/Text_Widget.js"));

var Page = require("../Common/Element.js").extend({
  name: '',
  url: '',
  cities: {
    type: 0, //1 - just enumerated, 0 - all, -1 - all, except enumerated
    items: '' //www,omsk,ishim...
  },
  openingCities: [
    // 'vladimir',
    // 'kostroma',
    // 'vartovsk',
    // 'rostov-na-donu',
    'spb',
    'yakutsk',
    // 'minsk',
    'petropavlovsk'
  ],
  commonWidgets: [
    citySelector,
    logo,
    scrollTop,
    workTime
  ],
  getName: function(){
    return this.name;
  },
  getUrl: function(){
    return this.url;
  },
  getFullUrl: function(city){
    return ph.getFullDomain(city) + '/'
      + (this.url === '/' ? '' : this.url + '/');;
  },
  get: function(city){
    var path = ph.getFullDomain(city) + '/'
      + (this.url === '/' ? '' : this.url + '/');
    return browser.get(path).then(function() {
      ph.logCurrentPageUrl();

      if (!this.skipCitySelect) {
        ph.closeCitySelectDialog(city);
      }

      return Promise.all([
        $('.e404-info').isPresent(),
        $('.e404object-title').isPresent()
      ]).then(function(error) {
        if (error[0] || error [1]) {
          browser.params.pageNotFound = true;
        }
      });
    });
  },
  getChildren: function() {
    return this.children;
  },
  getChild: function(child, city) {
    var path = ph.getFullDomain(city) + '/'
      + (this.url === '/' ? '' : this.url + '/'
      + (typeof(child) == "string" ? child : child.url) + '/');
    browser.get(path);
    ph.logCurrentPageUrl();
    $('.e404-info').isPresent().then(function(res){
      if (res) {
        console.log(('Страница не найдена! ' + path ).red.bold);
      }
    });
    ph.closeCitySelectDialog(city);
  },
  exists: function(city){
    var result = false;
    switch (this.cities.type) {
      case 1:
        result = this.cities.items.indexOf(city) > -1;
        break;
      case 0:
        result = true;
        break;
      case -1:
        result = this.cities.items.indexOf(city) === -1;
        break;
    }

    if(this.openingCities.indexOf(city) > -1){
      result = false;
    }
    return result;
  }
});

module.exports = Page;

module.exports.common = Page.extend({
  get: function(path){
    browser.get(path);
    ph.logCurrentPageUrl();
    ph.closeCitySelectDialog();
  },
  getInDomain: function(url, city){
    browser.get(ph.getFullDomain(city) + url);
    ph.logCurrentPageUrl();
    ph.closeCitySelectDialog(city);
  },
});

var ObjectPage = Page.extend({
  get: function(city, objectCode){
    var path = ph.getFullDomain(city) + '/' + this.url + '/'
      + (objectCode ? objectCode : this.defaultCode) + '/';
    browser.get(path);
    ph.logCurrentPageUrl();
    $('.e404object').isPresent().then(function(res){
      if(res){
        console.log(('Объект не найден! ' + path ).red.bold);
      }
    });
    ph.closeCitySelectDialog();
  },
  getName: function(objectCode){
    objectCode = objectCode ? objectCode : this.defaultCode;
    return this.name + ' ' + objectCode;
  }
});

var ZastrObjectPage = ObjectPage.extend({
  get: function(city, objectCode){
    var path = ph.getFullDomain(city) + '/' + this.url
      + (objectCode ? objectCode : this.defaultCode);
    browser.get(path);
    ph.logCurrentPageUrl();
    $('.e500-header').isPresent().then(function(res){
      if(res){
        console.log(('Объект не найден! ' + path ).red.bold);
      }
    });
    ph.closeCitySelectDialog();
  }
});

/* ГЛАВНАЯ */

module.exports.main = Page.extend({
  name: 'Главная',
  url: '/'
});

module.exports.opening = Page.extend({
  name: 'Скоро открытие',
  url: '/',
  widgets: [order.opening, numberCounter],
  isOpeningCity: function(city){
    return this.openingCities.indexOf(city) > -1 ? true : false;
  }
});

/* НЕДВИЖИМОСТЬ */

module.exports.realty = Page.extend({
  name: 'Вторичная недвижимость',
  url: 'realty',
  children: [{
    name: 'Поиск',
    url: 'search'
  }, {
    name: 'Вторичное жилье',
    url: 'vtorichnoe'
  }, {
    name: 'Пансионаты',
    url: 'pansionaty'
  }, {
    name: 'Однокомнатные квартиры',
    url: 'odnokomnatnye-kvartiry'
  }, {
    name: 'Двухкомнатные квартиры',
    url: 'dvuhkomnatnye-kvartiry'
  }, {
    name: 'Трехкомнатные квартиры',
    url: 'trehkomnatnye-kvartiry'
  }, {
    name: 'Четырехкомнатные квартиры',
    url: 'chetirehkomnatnye-kvartiry'
  }, {
    name: 'Поиск похожих объектов',
    url: 'search_similar'
  }, /*{
    name: 'Поиск по карте',
    url: 'search/map'
  },*/ {
    name: 'Объект вторичной',
    url: '',
    addID: true
  }, {
    name: 'Рейтинг объекта вторичной',
    url: 'rating/',
    addID: true
  }]
});

module.exports.zastr = Page.extend({
  name: 'Новостройки',
  url: 'zastr',
  children: [{
    name: 'Поиск',
    url: 'search'
  }, {
    name: 'Однокомнатные квартиры',
    url: 'odnokomnatnye-kvartiry'
  }, {
    name: 'Двухкомнатные квартиры',
    url: 'dvuhkomnatnye-kvartiry'
  }, {
    name: 'Трехкомнатные квартиры',
    url: 'trehkomnatnye-kvartiry'
  }, {
    name: 'Четырехкомнатные квартиры',
    url: 'chetirehkomnatnye-kvartiry'
  }, /*{
    name: 'Поиск по карте',
    url: 'search/map'
  }, */{
    name: 'Застройщик',
    url: 'builder/GK-Meridian-16'
  }, {
    name: 'Новостройка',
    url: 'jk/ZHK-Garmoniya-GP-2-1-ul-Zakaluzhskaya-',
    addID: true
  }, {
    name: 'Рейтинг новостройки',
    url: 'rating/',
    addID: true
  }],
  cities: {
    type: -1,
    items: ['kaluga', 'kna', 'kostroma', 'nk', 'tomsk', 'sakhalin', 'yakutsk']
  }
});

module.exports.realtyOut = Page.extend({
  name: 'Загородная недвижимость',
  url: 'realty_out',
  children: [{
    name: 'Поиск',
    url: 'search'
  }, {
    name: 'Дачи',
    url: 'dachnye-uchastki'
  }, {
    name: 'Дома',
    url: 'doma'
  }, {
    name: 'Земельные участки',
    url: 'zemelnye-uchastki'
  }, {
    name: 'Коттеджи',
    url: 'cottage'
  }, {
    name: 'Таунхаусы',
    url: 'taunhausy'
  }, {
    name: 'Объект загородной',
    url: '',
    addID: true
  }],
  cities: {
    type: -1,
    items: ['vladimir', 'kaluga', 'norilsk']
  }
});

module.exports.realtyRent = Page.extend({
  name: 'Аренда недвижимости',
  url: 'realty_rent',
    children: [{
    name: 'Поиск',
    url: 'search'
  }, {
    name: 'Однокомнатные квартиры',
    url: 'odnokomnatnye-kvartiry'
  }, {
    name: 'Двухкомнатные квартиры',
    url: 'dvuhkomnatnye-kvartiry'
  }, {
    name: 'Трехкомнатные квартиры',
    url: 'trehkomnatnye-kvartiry'
  }, {
    name: 'Четырехкомнатные квартиры',
    url: 'chetirehkomnatnye-kvartiry'
  }, {
    name: 'Поиск похожих объектов',
    url: 'search_similar'
  }, {
    name: 'Объект аренды',
    url: '',
    addID: true
  }, {
    name: 'Рейтинг объекта аренды',
    url: 'rating/',
    addID: true
  }],
  cities: {
    type: -1,
    items: ['astrakhan', 'vladimir', 'vlg', 'vologda', 'voronezh', 'gk', 'irk',
      'kazan', 'kaliningrad', 'kaluga', 'kostroma', 'krasnodar', 'kras',
      'lipetsk', 'murom', 'chelny', 'vartovsk', 'nk', 'novosibirsk', 'perm',
      'rostov-na-donu', 'saratov', 'sterlitamak', 'tomsk', 'tula', 'ulan-ude',
      'ufa', 'chel', 'yakutsk', 'almaty', 'astana', 'minsk']
  }
});

module.exports.commerce = Page.extend({
  name: 'Коммерческая недвижимость',
  url: 'commerce',
  children: [{
    name: 'Поиск',
    url: 'search'
  }, {
    name: 'Объект коммерческой',
    url: '',
    addID: true
  }],
  cities: {
    type: -1,
    items: ['vladimir', 'kaluga', 'kostroma', 'lipetsk', 'novosibirsk',
      'norilsk', 'tomsk', 'yakutsk']
  }
});

/* ИПОТЕКА */

module.exports.ipoteka = Page.extend({
  name: 'Ипотека',
  url: 'ipoteka',
  children: [{
    name: 'Программа',
    url: browser.params.mortgage.program
  }],
  cities: {
    type: -1,
    items: ['minsk']
  }
});

/* ЛЭНДИНГИ */

module.exports.mortgagelanding = Page.extend({
  name: 'Лэндинг по ипотеке',
  url: 'ipoteka_s_gospodderzhkoy'
});

module.exports.students = Page.extend({
  name: 'Аренда для студентов',
  url: 'realty_rent/students',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.rentNh = Page.extend({
  name: 'Аренда + новостройки',
  url: 'realty_rent/newhouses',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.forTheLandlord = Page.extend({
  name: 'Арендодателю',
  url: 'for_the_landlord',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.forTheSeller = Page.extend({
  name: 'Продавцу',
  url: 'for_the_seller'
});

module.exports.deals = Page.extend({
  name: 'Встречные сделки',
  url: 'deals'
});

module.exports.action = Page.extend({
  name: 'Акция',
  url: 'action'
});

module.exports.actionResults = Page.extend({
  name: 'Итоги розыгрыша квартиры 2016',
  url: 'action_results',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.vtb = Page.extend({
  name: 'Ипотека от ВТБ',
  url: 'offer-vtb24',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.turnkey = Page.extend({
  name: 'Ипотека под ключ',
  url: 'ipoteka_turnkey',
  cities: {
    type: 1,
    items: ['www','astana','almaty']
  }
});

module.exports.burningMortgage = Page.extend({
  name: 'Горящая ипотека',
  url: 'for_the_seller/burning-mortgage'
});

module.exports.crossRegion = Page.extend({
  name: 'Межрегиональные сделки',
  url: 'cross-region'
});

module.exports.ipotekaAbsolut = Page.extend({
  name: 'Ипотека Абсолют банка',
  url: 'ipoteka_absolut'
});

module.exports.ipotekaBank = Page.extend({
  name: 'Ипотека дешевле, чем в банке',
  url: 'ipoteka_bank'
});

module.exports.kvartiraVPodarok = Page.extend({
  name: 'Квартира в подарок',
  url: 'kvartira_v_podarok_2017'
});

module.exports.kvartiryDvuhStolic = Page.extend({
  name: 'Квартиры двух столиц',
  url: 'kvartiry-dvuh-stolic'
});

module.exports.yarmarka = Page.extend({
  name: 'Распродажа квартир',
  url: 'yarmarka',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.plekhanovo = Page.extend({
  name: 'Квартиры с ремонтом в ЖК «Плеханово»',
  url: 'zastr/kvartiry-s-remontom-v-zhk-plehanovo',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.elitCottage = Page.extend({
  name: 'Элитные коттеджи',
  url: 'realty_out/elit-house-tmn',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.olimpijskieSkidki = Page.extend({
  name: 'Олимпийские скидки',
  url: 'zastr/olimpijskie-skidki-na-novostrojki',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.domSoSkidkoy = Page.extend({
  name: 'Собирай урожай',
  url: 'realty_out/dom_so_skidkoy',
  cities: {
    type: 1,
    items: ['www']
  }
});

module.exports.franch = Page.extend({
  name: 'Франшиза',
  url: '/#',
  skipCitySelect: true,
  cities: {
    type: 1,
    items: ['franch']
  }
});

/* ОБЩИЕ */

module.exports.thankYou = Page.extend({
  name: 'Спасибо за заявку',
  url: 'thank-you',
  goBackBtn: $('.thankYouBtn'),

  getUrlThankYou: function(from, city){
    return ph.getFullDomain(city) + '/' + this.url + '/?from=' + from;
  },

  goBack: function(){
    this.goBackBtn.click();
  },

  waitGoBackBtn: function(){
    return wh.waitClickable(this.goBackBtn,
      'Ожидание кнопки возврата на странице "Спасибо за заявку"', 120000);
  }
});

module.exports.analytics = Page.extend({
  name: 'Биржа недвижимости',
  url: 'my/analytics'
});

module.exports.compare = Page.extend({
  name: 'Сравнение объектов',
  url: 'compare'
});

module.exports.rejected = Page.extend({
  name: 'Отклоненные объекты',
  url: 'rejected'
});

/* РАБОТА */

module.exports.job = Page.extend({
  name: 'Работа в компании Этажи',
  url: 'job'
});

module.exports.profile = Page.extend({
  name: 'Анкета соискателя',
  url: 'jobseeker-profile'
});

module.exports.openDay = Page.extend({
  name: 'День открытых дверей',
  url: 'open-day'
});

/* БЛОГ */

module.exports.blog = Page.extend({
  name: 'Блог',
  url: 'news',
  children: [{
    name: 'Категория статей',
    url: 'novosti-kompanii'
  }, {
    name: 'Статья',
    url: 'novosti-kompanii/imya-lyubimoe-moe-u-kakikh-zhilykh-2-3823'
  }],
});

/* ЛК */

module.exports.lk = Page.extend({
  name: 'Личный кабинет',
  url: 'my/#'
});

module.exports.confirmEmail = Page.extend({
  name: 'Подтверждение почты',
  url: 'confirmemail'
});

module.exports.changePassword = Page.extend({
  name: 'Смена пароля',
  url: 'changepassword'
});

module.exports.rules = Page.extend({
  name: 'Правила размещения объекта в ЛК',
  url: 'rules'
});

module.exports.unsubscribe = Page.extend({
  name: 'Отписаться от рассылки',
  url: 'unsubscribe'
});

module.exports.userAgreement = Page.extend({
  name: 'Пользовательское соглашение',
  url: 'user_agreement'
});

/* ???????????? */

module.exports.realtySearch = Page.extend({
  name: 'Выдача вторичной',
  url: 'realty/vtorichnoe'
});
module.exports.realtyObject = ObjectPage.extend({
  name: 'Объект вторичной',
  defaultCode: browser.params.objects.realty,
  url: 'realty'
});
module.exports.realtyOutSearch = Page.extend({
  name: 'Выдача загородной (участки)',
  url: 'realty_out/zemelnye-uchastki'
});
module.exports.realtyOutObject = ObjectPage.extend({
  name: 'Объект загородной',
  defaultCode: browser.params.objects.realtyOut,
  url: 'realty_out'
});
module.exports.realtyRentSearch = Page.extend({
  name: 'Выдача аренды (однокомнатные)',
  url: 'realty_rent/odnokomnatnye-kvartiry'
});
module.exports.realtyRentObject = ObjectPage.extend({
  name: 'Объектаренды',
  defaultCode: browser.params.objects.realtyRent,
  url: 'realty_rent'
});
module.exports.commerceSearch = Page.extend({
  name: 'Выдача коммерческой (офисы)',
  url: 'commerce/pokupka/ofis'
});
module.exports.commerceObject = ObjectPage.extend({
  name: 'Объект коммерческой',
  defaultCode: browser.params.objects.commerce,
  url: 'commerce'
});
module.exports.zastrSearch = Page.extend({
  name: 'Выдача новостроек (однокомнатные)',
  url: 'zastr/odnokomnatnye-kvartiry'
});
module.exports.zastrObject = ZastrObjectPage.extend({
  name: 'Объект новостройки',
  defaultCode: browser.params.objects.zastr,
  url: 'zastr/jk/ZHK-'
});
module.exports.objectNotFound = Page.extend({
  name: 'Объект не найден',
  url: 'realty/1234564545'
});