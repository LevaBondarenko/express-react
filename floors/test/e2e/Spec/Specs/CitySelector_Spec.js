var request = require("request");
/* Helpers */
var ph = Object.create(require("../Helpers/pageHelpers.js"));
var sh = Object.create(require("../Helpers/specHelpers.js"));
var wh = Object.create(require("../Helpers/waitHelpers.js"));
/* Pages */
var page = Object.create(require("../Pages/Page.js"));
/* Widgets */
var cs = Object.create(require("../Widgets/CitySelectorExtend_Widget.js"));
var order = Object.create(require("../Widgets/Order_Widget.js")).opening;

var smoke = browser.params.smoke;

var pages = {
  realty: '',
  zastr: '',
  realty_out: '',
  realty_rent: '',
  commerce: '',
  ipoteka: '',
  for_the_seller: ''
}

var noPages = {
  realty: '',
  zastr: '',
  realty_out: '',
  realty_rent: '',
  commerce: '',
  ipoteka: '',
  for_the_seller: ''
}

var allPages = ['realty', 'zastr', 'realty_out', 'realty_rent', 'commerce', 'ipoteka', 'for_the_seller']

if (sh.forPage()) {
  describe('Выбор города', function(){
    beforeEach(function(done) {
      browser.manage().deleteAllCookies();
      sh.getCitiesFromApi().then(function() {
        done();
      });
    }, 60000);

    afterAll(function(){
      if (browser.params.showCities) {
        console.log('opened cities: ' + (browser.params.allCitiesAcc.split(',')
          .filter(function(elem) {
          return elem != '';
        }).join(',') || 'no cities'));
        console.log('opening cities: ' + (browser.params.openCitiesAcc.split(',')
          .filter(function(elem) {
          return elem != '';
        }).join(',') || 'no cities'));
        console.log('Pages exist in cities:');
        console.log(pages);

        allPages.forEach(function (page) {
          browser.params.allCitiesAcc.split(',')
            .filter(function(elem) {
            return elem != '';
          }).forEach(function(city) {
            if (pages[page].indexOf(city) === -1) {
              noPages[page] += ", '" + city + "'";
            }
          });
        });

        console.log('Pages don`t exist in cities:');
        console.log(noPages);
      }
    });

    it('Отображение окна', function(){
      var verifyOpened = function() {
        expect(cs.dialogOpened())
          .toBe(true, 'Окно выбора города открыто');
        expect(cs.backShowed())
          .toBe(true, 'Отображается фон модального окна');
      };
      var verifyClosed = function() {
        ph.wait();
        expect(cs.dialogOpened())
          .toBe(false, 'Окно выбора города закрыто');
        expect(cs.backShowed())
          .toBe(false, 'Не отображается фон модального окна');
      };
      page.main.get('www');
      expect(cs.getLabel())
        .toContain('ГОРОД', 'Подпись в закрытом виджете выбора города');
      expect(cs.getCityName())
        .toBe('ТЮМЕНЬ', 'Название города в закрытом виджете выбора города');
      verifyClosed();

      cs.openDialog();
      verifyOpened();

      expect(cs.getModalTitle())
        .toBe('Выберите город из списка', 'Заголовок окна');
      expect(cs.getModalCountryTitle())
        .toBe('Страна', 'Заголовок списка стран');
      expect(cs.getModalCityTitle())
        .toBe('Город', 'Заголовок списка городов');

      cs.closeDialog();
      verifyClosed();
    });

    it('Поиск города в списке', function(){
      var verifySearch = function(text, mustFail){
        cs.clearSearchText();
        cs.setSearchText(text);
        cs.getCountries().each(function(country, countryIndex){
          cs.selectCountry(countryIndex);
          cs.getCityGroups().each(function(group, groupIndex){
            cs.getCities(groupIndex).each(function(city, cityIndex){
              cs.getCityNameList(groupIndex, cityIndex).then(function(cityName){
                if(text.length === 1){
                  cs.getCityGroupLetter(groupIndex).then(function(groupLetter){
                    expect(groupLetter).toBe(text.toUpperCase(),
                      'Первая группа буквы - ' + text);
                  });
                  expect(cityName).toMatch(text + ".+",
                    'Название найденного города начинается с буквы, '
                    + cityName + ', ' + text);
                } else {
                  expect(cityName.toLowerCase()).toContain(text.toLowerCase(),
                    'Название найденного города содержит искомый текст, '
                    + cityName + ', ' + text);
                }
              });
            });
          });
          cs.getCityGroupsCount().then(function(count){
            if(mustFail){
              expect(count).toBe(0, 'Города не должны быть найдены');
            }
            if(count === 0){
              expect(cs.getNotFoundText()).toBe('Ничего не найдено',
                'Текст при отсутствии найденных групп городов');
            }
          });
        });
      };

      page.main.get('www');
      cs.openDialog();
      expect(cs.getSearchInputPlaceholder())
        .toBe('Поиск по городам', 'Подпись в поле поиска');
      verifySearch('а');
      verifySearch('Тюмень');
      verifySearch('12345', true);

      if(!smoke){
        verifySearch('А');
        verifySearch('ас');
        verifySearch('мск');
        verifySearch('тюмень');
        verifySearch('Минск');
        verifySearch('+', true);
      }
    });

    it('Выбор города', function(){
      browser.params.allCitiesAcc = '';
      browser.params.openCitiesAcc = '';

      page.main.get('www');
      cs.openDialog();
      cs.getCountries().each(function(country, countryIndex){
        if(!smoke || (smoke && countryIndex < 1)){
          cs.selectCountry(countryIndex);
          cs.getCountryName(countryIndex).then(function(countryName){
            ph.logStep('Страна', countryName);
            expect(countryName).toMatch(".+",
              'Название страны не пустое');
            expect(countryName).not.toBe("Украина",
              'Украина должна отсутствовать в списке стран!');
            cs.getCityGroups().each(function(group, groupIndex){
              if(!smoke || (smoke && groupIndex < 2)){
                cs.getCityGroupLetter(groupIndex).then(function(groupLetter){
                  browser.params.loggedValue = groupLetter;
                  ph.logStep('Группа', groupLetter);
                  cs.getCities(groupIndex).each(function(city, cityIndex){
                    cs.getCityNameList(groupIndex, cityIndex)
                      .then(function(cityName){
                      ph.logStep('Город', cityName);
                      expect(cityName).toMatch(groupLetter + ".+",
                        'Название города начинается на букву группы');
                      if (cityName !== 'Волжский') {
                        cs.clickCity(groupIndex, cityIndex);
                        expect(cs.getLabel()).toContain('ГОРОД',
                          'Подпись в закрытом виджете выбора города');
                        browser.manage().getCookie("selected_city")
                          .then(function(selectedCity){
                          expect(cs.getCityName())
                            .toContain(cityName.toUpperCase(),
                              'Название города в закрытом виджете выбора города');

                          browser.getCurrentUrl().then(function(url) {
                            var c = url.split('//')[1].split('.')[0];
                            order.displayed().then(function(res) {
                              if (!res) {
                                browser.params.allCitiesAcc += c + ',';
                                $$('.header--navigation .navigation--item a').each(function(elem) {
                                  elem.getAttribute('href').then(function(text) {
                                    var links = text.split('/').filter(function(e) {
                                      return e != false;
                                    });
                                    var link = links[links.length - 1];
                                    if (pages[link] !== undefined) {
                                      pages[link] += ", '" + c + "'";;
                                    }
                                  })
                                });
                              } else {
                                browser.params.openCitiesAcc += c + ',';
                              }
                            });
                          });

                          browser.getCurrentUrl().then(function(url){
                            expect(selectedCity.value)
                              .toBe(url.split('//')[1].split('.')[0],
                                'В cookie записан текущий город');
                            expect(url)
                              .toContain('.' + browser.params.domain + '/',
                                'Город открывается в текущем домене');
                          });

                          cs.openDialog();
                          expect(cs.getCountryClass(countryIndex))
                            .toContain(' ', 'Текущая страна выбрана в списке');
                          expect(cs.getCityClass(groupIndex, cityIndex))
                            .toContain(' ', 'Текущий город выбран в списке');
                        });
                      }
                    });
                  });
                });
              }
            });
          });
        }
      });
    });

    it('Страница открытия города', function() {
       var cities = browser.params.openCitiesAcc
          ? browser.params.openCitiesAcc
          : 'nn,spb,petropavlovsk';

      cities.split(',').filter(function(elem) {
        return elem != '';
      }).forEach(function(city) {
        ph.logStep('Город', ph.getCityParams(city)['name']);
        page.opening.get(city);
        ph.wait();
        page.opening.widgets.concat(page.opening.commonWidgets)
          .forEach(function(widget) {
          wh.waitPresence(widget.keyElement.get(0));
          expect(widget.displayed()).toBe(true);
          widget.verify();
        });
      });
    });
  })
}