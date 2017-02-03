/* Helpers */
var h = Object.create(require("../../Helpers/helpers.js"));
var sh = Object.create(require("../../Helpers/specHelpers.js"));
var ph = Object.create(require("../../Helpers/pageHelpers.js"));
/* Pages */
var mPage = Object.create(require("../../Pages/MVS_Page.js"));
/* Widgets */
var msr = Object.create(require("../../Widgets/MobileSearchResult_Widget.js"));
var msPaging = Object.create(require("../../Widgets/MSearcherPaging_Widget.js"));
var msSubmit = Object.create(require("../../Widgets/MSearcherSubmitM_Widget.js"));
var msOrder = Object.create(require("../../Widgets/MSearcherOrder_Widget.js"));

if (browser.params.mobile.run) {
  sh.getCities().forEach(function(city) {
    fdescribe('Выдача объектов МВС', function() {
      beforeAll(function(done) {
        // browser.driver.manage().window().setSize(browser.params.mobile.width,
        //   browser.params.mobile.height);
        // mPage.realtySearch.get();
        mPage.main.get();
        msSubmit.clickBtn();
        sh.getCitiesFromApi().then(function() {
          done();
        });
      }, 60000);

      afterAll(function() {
        browser.driver.manage().window().maximize();
      });

      it('Заголовок выдачи', function() {
        expect(msr.title.get()).toMatch("Квартиры: [0-9]+",
          'Загловок выдачи объектов');
        expect(msr.title.hasGoBackBtn()).toBe(true,
          'Должна присутствовать кнопка возврата');
      });

      /*it('Подписка', function() {
        expect(msr.subscription.getBtnText()).toBe('Подписаться',
          'Текст на кнопке подписки')
      });*/

      it('Сортировка', function() {
        msOrder.clickBtn();
        msOrder.getItems().each(function(item, index) {
          msOrder.getItemText(index).then(function(sortingName) {
            msOrder.clickItem(index);
            browser.sleep(2000);
            browser.getCurrentUrl().then(function(url) {
              var sorting = url.split('?')[1].split('&').filter(function(elem) {
                return elem.split('=')[0] === 'order';
              })[0].split('=')[1];
              var field = sorting.split('%20')[0];
              var direction = sorting.split('%20')[1];
              switch (field) {
                case 'price':
                  var prevPrice;
                  msr.objects.getAll().each(function(obj, objIndex) {
                    msr.objects.getPrice(objIndex).then(function(price) {
                      if (objIndex > 0) {
                        if (direction === 'desc') {
                          expect(price).not.toBeGreaterThan(prevPrice,
                            'Сортировка: ' + sortingName +
                            ', объект № ' + (objIndex + 1));
                        } else {
                          expect(price).not.toBeLessThan(prevPrice,
                            'Сортировка: ' + sortingName +
                            ', объект № ' + (objIndex + 1));
                        }
                      }
                      prevPrice = price;
                    });
                  });
                  break;
                case 'rating':
                  var prevRating;
                  msr.objects.getAll().each(function(obj, objIndex) {
                    msr.objects.getRatingValue(objIndex).then(function(rating) {
                      if (objIndex > 0) {
                        if (direction === 'desc') {
                          expect(rating).not.toBeGreaterThan(prevRating,
                            'Сортировка: ' + sortingName +
                            ', объект № ' + (objIndex + 1));
                        } else {
                          expect(rating).not.toBeLessThan(prevRating,
                            'Сортировка: ' + sortingName +
                            ', объект № ' + (objIndex + 1));
                        }
                      }
                      prevRating = rating;
                    });
                  });
                  break;
              }
            });
            msOrder.clickBtn();
          });
        });
      });

      fit('Пагинация', function() {
        var verifiPaging = function(index) {
          var verifyCurrentPage = function(value, message) {
            [0, 1].forEach(function(index) {
              expect(msPaging.getPage(index)).toBe(value,
                message + ', пагинация № ' + (index + 1));
            });
          };

          var getObjects = function() {
            return msr.objects.getLinks().reduce(function(acc, elem) {
              return elem.getAttribute('href').then(function(text) {
                var a = text.split('/');
                return acc + a[a.length - 1] + ' ';
              });
            }, '');
          };

          var otherIndex = index === 0 ? 1 : 0;

          expect(msPaging.getBackLabel(index)).toBe('назад',
            'Текст на кнопке перехода к предыдущей странице');
          expect(msPaging.getForwardLabel(index)).toBe('вперед',
            'Текст на кнопке перехода к следующей странице');
          expect(msPaging.getLabel(index)).toMatch('Страницаиз [0-9]+',
            'Подпись с количеством страниц');
          expect(msPaging.hasInput(index)).toBe(true,
            'Должно присутствовать поле ввода номера страницы');

          verifyCurrentPage('1', 'По умолчанию активна страница 1');

          getObjects().then(function(objects) {
            msPaging.goForward(index);
            expect(getObjects()).not.toBe(objects,
              'Объекты в выдаче должны измениться');
          });

          verifyCurrentPage('2', 'После перехода вперед активна страница 2');

          getObjects().then(function(objects) {
            msPaging.goBack(index);
            expect(getObjects()).not.toBe(objects,
              'Объекты в выдаче должны измениться');
          });

          verifyCurrentPage('1', 'После перехода назад активна страница 1');

          msPaging.getPagesCount(index).then(function(count) {
            getObjects().then(function(objects) {
              msPaging.setPage(index, count);
              expect(getObjects()).not.toBe(objects,
                'Объекты в выдаче должны измениться');
              verifyCurrentPage(count, 'После ввода номера активна страница ' + count);
            });
          });

          getObjects().then(function(objects) {
            msPaging.setPage(index, '1').then(function() {
              verifyCurrentPage('1', 'После ввода номера активна страница 1');
              expect(getObjects()).not.toBe(objects,
                'Объекты в выдаче должны измениться');
            });

          });
        };

        verifiPaging(0);
        verifiPaging(1);
      });

      it('Объекты в выдаче', function() {
        var titles = [
          "[1-9]+-КОМНАТНАЯ",
          "ОБЩЕЖИТИЕ",
          "МАЛОСЕМЕЙКА",
          "КОМНАТА",
          "ПАНСИОНАТ"
        ];
        var ratings = [
          "превосходно",
          "отлично",
          "очень хорошо",
          "хорошо"
        ];

        msr.objects.getAll().each(function(obj, objIndex) {
          expect(msr.objects.getTitle(objIndex))
            .toMatch("(" + titles.join("|") + ")",
              'Заголовок объекта в выдаче');
          msr.objects.hasRating(objIndex).then(function(hasRating) {
            if (hasRating) {
              expect(msr.objects.getRatingValue(objIndex))
                .toMatch("(([5-9]{1}|10)\.[0-9]{1})", 'Рейтинг объекта');
              expect(msr.objects.getRatingLabel(objIndex))
                .toMatch("(" + ratings.join("|") + ")",
                  'Подпись в рейтинге объекта');
            }
          });
          msr.objects.getPrice(objIndex).then(function(price) {
            expect(price).toMatch("([ ]?[0-9]{1,3})+", 'Формат цены объекта');
            msr.objects.hasOldPrice(objIndex).then(function(has) {
              if (has) {
                msr.objects.getOldPrice(objIndex).then(function(oldPrice) {
                  expect(oldPrice).toMatch("([ ]?[0-9]{1,3})+",
                    'Формат старой цены объекта');
                  expect(parseInt(price.split(" ").join()))
                    .toBeLessThan(parseInt(oldPrice.split(" ").join()),
                    'Цена объекта должна быть меньше старой цены');
                });
              }
            });
          });
          msr.objects.getParams(objIndex).each(function(param, paramIndex) {
             expect(param.getText()).toMatch(".+",
              'Параметры объекта №' + (objIndex + 1)
              + ', параметр №' + (paramIndex + 1));
              /*param.getText().then(function(p) {
                console.log('  ' + paramIndex + ') ' + p);
              });*/
          });
          expect(msr.objects.getLeftButtonText(objIndex))
            .toBe('В избранное', 'Левая кнопка в объекте');
          expect(msr.objects.getRightButtonText(objIndex))
            .toBe('Подробнее', 'Правая кнопка в объекте');

          // msr.objects.open(objIndex);
          // browser.navigate().back();
        });
      });
    });
  });
}