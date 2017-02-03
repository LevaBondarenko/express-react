/* Helpers */
var h = Object.create(require("../Helpers/helpers.js"));
var sh = Object.create(require("../Helpers/specHelpers.js"));
var ph = Object.create(require("../Helpers/pageHelpers.js"));
/* Pages */
var mPage = Object.create(require("../Pages/MVS_Page.js"));
/* Widgets */
var header = Object.create(require("../Widgets/MobileHeader_Widget.js"));
var info = Object.create(require("../Widgets/CompanyInfo_Widget.js"));
var cta = Object.create(require("../Widgets/MobileCTA_Widget.js"));
var switcher = Object.create(require("../Widgets/Switcher_Widget.js").mobile);

var verifyDialog = function(hasToBe) {
  header.hasDialog().then(function(has) {
    if (hasToBe) {
      expect(has).toBe(true, "Диалог должен отображаться");
    } else {
      expect(has).toBe(false, "Диалог не должен отображаться");
    }
  });
};

if (browser.params.mobile.run) {
  sh.getCities().forEach(function(city){
    describe('Мобильная версия сайта', function() {
      beforeAll(function(done) {
        browser.driver.manage().window().setSize(browser.params.mobile.width,
          browser.params.mobile.height);
        sh.getCitiesFromApi().then(function() {
          done();
        });
      }, 60000);

      afterAll(function() {
        browser.driver.manage().window().maximize();
      });

      beforeEach(function() {
        mPage.main.get();
      });

      it('Статичные элементы', function() {
        header.hasLogo().then(function(has) {
          expect(has).toBe(true, "В header должен отображаться логотип");
          header.clickLogo();
        });
        header.lk.hasFavorites().then(function(has) {
          expect(has).toBe(true, "В header должна отображаться иконка избранного");
        });
        header.lk.hasAuth().then(function(has) {
          expect(has).toBe(true, "В header должна отображаться иконка входа в ЛК");
        });
        expect(info.getContent()).toMatch(".+",
          'Информация о компании в footer не пустая');
        expect(cta.getButtonsCount()).toBeGreaterThan(2,
          'В виджете призыва к действию должно быть минимум 3 кнопки');
        expect(cta.getButtonsCount()).toBeLessThan(6,
          'В виджете призыва к действию должно быть максимум 5 кнопок');
        cta.getButtons().each(function(button, buttonIndex) {
          buttonIndex < 3 && expect(cta.getButtonText(buttonIndex))
            .toMatch(".+", 'Текст кнопки в виджете призыва к действию не пустой');
        });
      });

      it('Переключатель', function() {
        var buttons = {
          0: 'Купить',
          1: 'Снять',
          2: 'Продать',
          3: 'Сдать'
        };

        var isButtonActive = function(index) {
          return switcher.getButtonClass(index).then(function(cl) {
            return cl.indexOf('active') > -1;
          });
        };

        expect(switcher.getButtonsCount()).toBe(4,
          'В переключателе типов операций должно быть 4 кнопки');
        expect(isButtonActive(0)).toBe(true,
          'В переключателе должна быть активной певрая кнопка');

        switcher.getButtons().each(function(button, buttonIndex) {
          expect(switcher.getButtonText(buttonIndex)).toBe(buttons[buttonIndex],
            'Текст кнопки в переключателе операции');
          switcher.clickButton(buttonIndex);
          expect(isButtonActive(buttonIndex)).toBe(true,
            'В переключателе должна быть активной кнопка #' + buttonIndex);
        });
      });

      describe('Геолокация', function() {
        beforeEach(function() {
          browser.manage().deleteAllCookies();
          mPage.main.get(true);
          header.geoLocation.getLabel().then(function(label) {
            expect(label).toContain('Ищете недвижимость в',
              'Текст подписи в блоке геолокации');
            expect(label).toContain(ph.getCityParams(city).offices[0].name_pp,
              'Текст подписи в блоке геолокации должен содержать текущий город');
          });
        });

        it('Город определен верно', function() {
          header.geoLocation.acceptCity();
          header.geoLocation.isShown().then(function(isShown) {
            expect(isShown).toBe(false,
              'Диалог геолокации не должен отображаться после подтверждения города');
          });
          header.cityList.isShown().then(function(isShown) {
            expect(isShown).toBe(false,
              'Список городов не должен отображаться после подтверждения города');
          });
          browser.manage().getCookie('selected_city').then(function(selectedCity) {
            expect(selectedCity.value).toBe(city,
              'После подтверждения города он должен быть записан в куку selected_city');
          });
        });

        it('Город определен неверно', function() {
          header.geoLocation.declineCity();
          header.geoLocation.isShown().then(function(isShown) {
            expect(isShown).toBe(false,
              'Диалог геолокации не должен отображаться после отклонения города');
          });

          header.cityList.isShown().then(function(isShown) {
            expect(isShown).toBe(true,
              'Список городов должен отображаться после отклонения города');
          });
          browser.manage().getCookie('selected_city').then(function(selectedCity) {
            expect(selectedCity).toBe(null,
              'После отказа от города не должно быть куки selected_city');
          });
          header.closeDialog();
        });

        it('Отказ от выбора города', function() {
          header.geoLocation.close();
          header.geoLocation.isShown().then(function(isShown) {
            expect(isShown).toBe(false,
              'Диалог геолокации не должен отображаться после закрытия диалога');
          });

          header.cityList.isShown().then(function(isShown) {
            expect(isShown).toBe(false,
              'Список городов не должен отображаться после закрытия диалога');
          });

          if (browser.params.mobile.acceptOnGeoCancel) {
            browser.manage().getCookie('selected_city').then(function(selectedCity) {
              expect(selectedCity.value).toBe(city,
                'После закрытия диалога город должен быть записан в куку selected_city');
            });
            browser.refresh();
            header.geoLocation.isShown().then(function(isShown) {
              expect(isShown).toBe(false,
                'Диалог геолокации не должен отображаться после обновления страницы');
            });
          } else {
            browser.manage().getCookie('selected_city').then(function(selectedCity) {
              expect(selectedCity).toBe(null,
                'После закрытия диалога не должно быть куки selected_city');
            });
            browser.refresh();
            header.geoLocation.isShown().then(function(isShown) {
              expect(isShown).toBe(true,
                'Диалог геолокации должен отображаться после обновления страницы');
            });
          }
        });
      });

      describe('Выбор города', function() {
        beforeEach(function() {
          header.cityList.toggle();
        });

        afterEach(function() {
          header.closeDialog();
        });

        it('Открытие диалога', function() {
          verifyDialog(true);
          header.cityList.toggle();
          verifyDialog(false);
          header.cityList.toggle();
          verifyDialog(true);
          header.closeDialog();
          verifyDialog(false);
          header.cityList.toggle();
        });

        it('Список стран и городов', function() {
          expect(header.cityList.getLabel()).toBe('Выберите город',
            'Подпись в диалоге выбора города');
          header.cityList.getCountry().then(function(countries) {
            expect(countries).toContain('Россия',
              'В списке стран есть Россия');
            expect(countries).toContain('Казахстан',
              'В списке стран есть Казахстан');
            expect(countries).toContain('Беларусь',
              'В списке стран есть Беларусь');
          });

          header.cityList.getCountries().each(function(country, countryIndex) {
            header.cityList.clickCounties();
            header.cityList.clickCountry(countryIndex);
            header.cityList.getCountryName(countryIndex).then(function(countryName) {
              header.cityList.getCountryId(countryIndex).then(function(countryId) {
                header.cityList.getCities().each(function(city, cityIndex) {
                  header.cityList.getCityName(cityIndex).then(function(cityName) {
                    header.cityList.getCityId(cityIndex).then(function(id) {
                      expect(ph.getCityParamsById(id).name).toContain(cityName,
                        'Название города в списке совпадает с названием города из API (по ID)');
                      expect(ph.getCityParamsById(id).country.name).toBe(countryName,
                        'Название страны совпадает с названием страны для города из API (по ID города)');
                      expect(ph.getCityParamsById(id).country.id).toBe(countryId,
                        'Код страны совпадает с кодом страны из API');
                    });
                  });
                });
              });
            });
          });
        });

        it('Поиск города', function() {
          var isCountriesListDisables = function() {
            return header.cityList.getCountriesDisabled().then(function(d) {
              return d ? true : false;
            });
          };

          var search = function(searchText) {
            header.cityList.clearSearchField();
            header.cityList.enterSearchText(protractor.Key.BACK_SPACE);
            expect(isCountriesListDisables()).toBe(false,
              'Список стран не должен быть заблокирован');
            browser.sleep(3000);
            header.cityList.enterSearchText(searchText);
            header.cityList.getCities().each(function(city, cityIndex) {
              header.cityList.getCityName(cityIndex).then(function(cityName) {
                expect(cityName.toLowerCase()).toContain(searchText.toLowerCase(),
                  'Найденные города должны содержать искомый текст');
              });
            });

            expect(isCountriesListDisables()).toBe(true,
              'Список стран должен быть заблокирован');

            header.cityList.getCitiesCount().then(function(count) {
              if (count === 0) {
                expect(header.cityList.getNotFoundLabel())
                  .toBe('Ничего не найдено', 'Текст, если города не найдены');
              }
            });
          };

          search('Тюмень');
          search('Астана');
          search('минск');
          search('12345');
          search('аст');
        });
      });

      describe('Главное меню', function() {
        beforeEach(function() {
          header.menu.toggle();
        });

        afterEach(function() {
          header.closeDialog();
        });

        it('Текущий город', function() {
          expect(header.menu.getCity()).toBe(ph.getCityParams(city).name,
            'В главном меню должен быть указан текущий город');
          header.menu.getAddress().then(function(address) {
            expect(ph.getCityParams(city)
              .offices[ph.getCityParams(city).offices.length - 1].name)
              .toContain(address,
              'В главном меню должен быть указан адрес офиса в текущем городе');
          });
          header.menu.clickCity();
          header.cityList.isShown().then(function(isShown) {
            expect(isShown).toBe(true,
              'Список городов должен отображаться после клика на название города в главном меню');
          });
        });

        it('Пункты меню', function() {
          header.menu.getItems().each(function(item, itemIndex) {
            header.menu.getItemText(itemIndex).then(function(name) {
              switch (itemIndex) {
                case 0:
                  expect(name).toBe('Настройки',
                    'Первым пунктом главного меню должен быть Настройки');
                  header.menu.clickItem(itemIndex);
                  header.menu.getCitySelectText().then(function(setting0) {
                    expect(setting0).toContain('Сменить город',
                      'Подпись в первом пункте настроек в главном меню');
                    expect(setting0).toContain(ph.getCityParams(city).name,
                      'Текущий город должен быть в первом пункте настроек в главном меню');
                  });
                  // Выбор города
                  header.menu.clickCitySelect();
                  header.cityList.isShown().then(function(isShown) {
                    expect(isShown).toBe(true,
                      'Список городов должен отображаться после перехода из настроек в главном меню');
                  });
                  header.closeDialog();
                  header.menu.toggle();
                  header.menu.clickItem(itemIndex);
                  // Выбор валюты
                  header.menu.hasCurrencySelect().then(function(has) {
                    expect(has).toBe(true,
                      'Должен быть выбор валюты в главном меню');
                  });
                  break;
                case 1:
                  expect(name).toBe('Личный Кабинет',
                    'Первым пунктом главного меню должен быть Личный Кабинет');
                  header.menu.clickItem(itemIndex);
                  break;
                default:
                  expect(name).toMatch(".+",
                    'Название пункта главного меню не пустое');
                  break;
              }
            });
          });
        });

        it('Переход к полной версии сайта', function() {
          browser.getCurrentUrl().then(function(url) {
            header.menu.openFullVersion();
            browser.getCurrentUrl().then(function(urlFull) {
              expect(url).not.toBe(urlFull,
                'Смена url после перехода к полной версии');
              browser.navigate().back();
            });
          });
        });
      });

      describe('Запоминание текущего диалога', function() {
        it('Выбор города', function() {
          header.cityList.toggle();
          browser.refresh();
          header.cityList.isShown().then(function(isShown) {
            expect(isShown).toBe(true,
              'Список городов должен отображаться после обновления страницы');
          });
          header.cityList.toggle();
        });

        it('Меню', function() {
          header.menu.toggle();
          browser.refresh();
          header.menu.isShown().then(function(isShown) {
            expect(isShown).toBe(true,
              'Главное меню должно отображаться после обновления страницы');
          });
          header.closeDialog();
        });
      });
    });
  });
}