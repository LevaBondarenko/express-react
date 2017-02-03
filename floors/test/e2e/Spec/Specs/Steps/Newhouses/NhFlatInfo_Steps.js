/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
/* Steps*/
var legendSteps = Object.create(require("./NhLegend_Steps.js"));
/* Widgets */
var fq = Object.create(require("../../../Widgets/FilterQuarterNew_Widget.js"));
var fi = Object.create(require("../../../Widgets/FilterQuarterFlatNew_Widget.js"));

var limit = browser.params.smoke ? browser.params.limitSmoke.nhFlats : browser.params.limit.nhFlats;
var limitOpen = browser.params.smoke ? browser.params.limitSmoke.nhFlatsOpen : browser.params.limit.nhFlatsOpen;

module.exports = require("../../../Common/Element.js").extend({
  verify: function() {
    h.setErrorMsg(4, 'Информация о квартире');
    var legend = legendSteps.getLegend();
    // Выбираем тип шахматки по цене
    fq.view.clickType(1);
    h.getCurrency();
    fq.flats.clickSome();

    // Цикл по квартирам
    fq.flats.get(0).filter(function(flat, fIndex) {
      return (!limitOpen || fIndex < limitOpen) && fq.flats.isClickable(flat);
    }).each(function(flat, fIndex) {
      flat.$('span').getAttribute('id').then(function(fId) {
        flat.click();
        h.wait();
        // Этаж (шахматка - информация о квартире)
        fq.flats.getFloor(fIndex, 0).then(function(floor) {
          expect(fi.info.getTitle())
            .toMatch("Этаж: " + floor + "/[0-9,-]+$",
              h.getErrorMsg('этаж квартиры в шахматке и виджете информации о квартире должен совпадать'));
        });
        // Площадь
        expect(fi.info.getPropLabel(0)).toBe('Площадь',
          'площадь квартиры (название параметра)',
          h.getErrorMsg('Название первого параметра'));
        expect(fi.info.getPropValue(0)).toMatch("[0-9,.]+ м²",
          'площадь квартиры (формат)', h.getErrorMsg('Формат площади квартиры'));

        fi.info.getPropsCount().then(function(propsCount) {
          expect(propsCount === 3 || propsCount === 4)
            .toBe(true,
              h.getErrorMsg('количество параметров квартиры - 3 или 4'));
          // Цена за м2
          expect(fi.info.getPropLabel(propsCount - 2))
            .toBe('Стоимость за м2',
              h.getErrorMsg('цена м2 (название параметра'));
          browser.manage().getCookie("E2E_currency")
            .then(function(currency) {
              expect(fi.info.getPropValue(propsCount - 2))
                .toMatch("[0-9, ]+ " + currency.value,
                  h.getErrorMsg('цена м2 (формат)'));
              // Цена
              expect(fi.info.getPropLabel(propsCount - 1))
                .toBe('Стоимость', h.getErrorMsg('цена (название параметра)'));
              expect(fi.info.getPrice())
                .toMatch("[0-9, ]+ " + currency.value,
                  h.getErrorMsg('цена (формат)'));
              fi.info.hasOldPrice().then(function(result) {
                if (result) {
                  expect(fi.info.getOldPrice())
                    .toMatch("[0-9, ]+ " + currency.value,
                      h.getErrorMsg('скидка (формат)'));
                }
              });
              if (propsCount === 4) {
                // Цена ипотеки
                expect(fi.info.getPropLabel(1))
                  .toBe('В ипотеку',
                    h.getErrorMsg('цена ипотеки (название параметра)'));
                expect(fi.info.getPropValue(1))
                  .toMatch("[0-9, ]+ " + currency.value + "/мес.",
                    h.getErrorMsg('цена ипотеки (формат)'));
              }
            });
        });
        var label = '';
        fq.flats.getClass(fIndex, 0).then(function(cl) {
          // Планировки
          fi.info.getLayoutLinksCount().then(function(count) {
            if (cl.indexOf(legend['Квартира от дольщика'].class) > -1) {
              expect(count).toBe(1,
                h.getErrorMsg('у квартиры от дольщтка - только план квартиры'));
            } else {
              expect(count === 2 || count === 3).toBe(true,
                h.getErrorMsg('у квартиры от застройщика - 2 или 3 планировки'));
              expect(fi.info.getLayoutLinkText(0))
                .toBe('План этажа',
                  h.getErrorMsg('первый - план этажа'));
              expect(fi.info.getLayoutLinkText(1))
                .toBe('План квартиры',
                  h.getErrorMsg('второй - план квартиры'));
              if (count === 3) {
                expect(fi.info.getLayoutLinkText(2))
                  .toBe('3D планировка',
                    h.getErrorMsg('третий - 3д планировка'));
              }
            }
          });
          // Количество комнат (загловок квартиры)
          if (cl.indexOf(legend['1К'].class) > -1) {
            label = "^1-комнатная квартира";
          } else if (cl.indexOf(legend['2К'].class) > -1) {
            label = "^2-комнатная квартира";
          } else if (cl.indexOf(legend['3К'].class) > -1) {
            label = "^3-комнатная квартира";
          } else if (cl.indexOf(legend['4К+'].class) > -1) {
            label = "^([4-9]{1}|[0-9]{2,*})-комнатная квартира";
          }
          expect(fi.info.getTitle()).toMatch(label,
            h.getErrorMsg('заголовок квартиры (количество комнат)'));

          if (cl.indexOf(legend['Квартира от дольщика'].class) === -1) {
            // Модальное окно
            fi.popup.show();
            h.wait();


            // Этаж
            fq.flats.getFloor(fIndex, 0).then(function(floor) {
              expect(fi.popup.getFloor())
                .toContain(floor, h.getErrorMsg('этаж квартиры PopUp'));
              expect(fi.popup.getBookParam(2))
                .toContain('Этаж: ' + floor,
                  h.getErrorMsg('этаж квартиры PopUp (бронирование)'));
            });
            // Подъезд
            fq.flats.getSection(fIndex, 0).then(function(section) {
              expect(fi.popup.getSection())
                .toBe(section + ' ПОДЪЕЗД',
                  h.getErrorMsg('подъезд квартиры PopUp'));
              expect(fi.popup.getBookParam(2))
                .toContain('Подъезд: ' + section,
                  h.getErrorMsg('подъезд квартиры PopUp (бронирование)'));
            });
            // Количество комнат
            expect(fi.popup.getPropLabel(0)).toMatch("КОМНАТ",
              h.getErrorMsg('количество комнат PopUp (подпись)'));
            fi.info.getTitle().then(function(title) {
              fi.popup.getPropValue(0).then(function(res) {
                expect(res).toContain(title.split('-')[0],
                    h.getErrorMsg('количество комнат PopUp'));
              });
              expect(fi.popup.getBookParam(0))
                .toBe('Тип: ' + title.split('-')[0] + '-комнатная',
                  h.getErrorMsg('количество комнат PopUp (бронирование)'));
            });
            // Площадь
            expect(fi.popup.getPropLabel(1)).toMatch("ОБЩАЯ ПЛОЩАДЬ",
              h.getErrorMsg('площадь квартиры PopUp (название параметра)'));
            fi.info.getPropValue(0).then(function(sqaure) {
              fi.popup.getPropValue(1).then(function(res) {
                expect(res.split(' ')[0]).toBe(sqaure.split(' ')[0],
                  h.getErrorMsg('площадь квартиры PopUp'));
              });
              expect(fi.popup.getBookParam(1))
                .toBe('Общая площадь: ' + sqaure.split(' ')[0] + ' м2',
                  h.getErrorMsg('площадь квартиры PopUp (бронирование)'));
            });

            fi.popup.getPropsCount().then(function(propsCount) {
              fi.info.getPropsCount().then(function(propsCount0) {
                expect(propsCount0 + 1).toBe(propsCount,
                  h.getErrorMsg('количество параметров PopUp'));
              });
              // Цена м2
              expect(fi.popup.getPropLabel(propsCount - 2))
                .toMatch("СТОИМОСТЬ ЗА М2",
                  h.getErrorMsg('цена м2 PopUp (подпись)'));
              expect(fi.info.getPropValue(propsCount - 3))
                .toContain(fi.popup.getPropValueSpan(propsCount - 2),
                  h.getErrorMsg('цена м2 PopUp'));

              // Цена
              expect(fi.popup.getPropLabel(propsCount - 1))
                .toMatch("СТОИМОСТЬ", h.getErrorMsg('цена PopUp (подпись)'));
              expect(fi.popup.getPropValueSpan(propsCount - 1))
                .toContain(fi.info.getPrice(), h.getErrorMsg('цена PopUp'));
              fi.info.hasOldPrice().then(function(result) {
                if (result) {
                  expect(fi.popup.getPropValueSpan(propsCount - 1))
                    .toContain(fi.info.getOldPrice(),
                      h.getErrorMsg('скидка PopUp'));
                }
              });
              // Цена ипотеки
              if (propsCount === 5) {
                expect(fi.popup.getPropLabel(2))
                  .toMatch("В ИПОТЕКУ ЗА МЕСЯЦ",
                    h.getErrorMsg('цена ипотеки (подпись)'));
                expect(fi.info.getPropValue(1))
                  .toContain(fi.popup.getPropValueSpan(2),
                    h.getErrorMsg('цена PopUp'));
              }
            });

            // Закладки
            expect(fi.popup.getTabText(0))
              .toMatch("Информация\nо квартире",
                h.getErrorMsg('название первой закладки PopUp'));
            expect(fi.popup.getTabText(1))
              .toMatch("Записаться на\nпросмотр",
                h.getErrorMsg('название второй закладки PopUp'));
            expect(fi.popup.getTabText(2))
              .toMatch("Забронировать\nквартиру",
                h.getErrorMsg('название третьей закладки PopUp'));

            // Информация о квартире
            fi.popup.clickTab(0);
            h.wait();

            fi.popup.layouts.getLinksCount().then(function(count) {
              fi.info.getLayoutLinksCount().then(function(count0) {
                expect(count).toBe(count0,
                  h.getErrorMsg('количество планировок в PopUp окне и без него должно совпадать'));
              });
              expect(fi.popup.layouts.getLinkText(0))
                .toBe('Планировка квартиры', 'первая - план квартиры');
              fi.popup.layouts.clickLink(0);
              expect(fi.popup.layouts.hasFlat()).toBe(true,
                'план квартиры должен быть');

              expect(fi.popup.layouts.getLinkText(count - 1))
                .toBe('План этажа', 'последняя - план этажа');
              fi.popup.layouts.clickLink(count - 1);

              fi.popup.layouts.hasFloor().then(function(hasFloor) {
                fi.popup.layouts.hasFloorCanvas().then(function(hasFloorC) {
                  expect(hasFloor || hasFloorC).toBe(true,
                    ', должен быть план этажа (обрисованный или нет), ');
                });
              });

              if (count === 3) {
                expect(fi.popup.layouts.getLinkText(1))
                  .toBe('3D планировка', 'вторая - 3D планировка');
                fi.popup.layouts.clickLink(1);
                expect(fi.popup.layouts.has3D()).toBe(true,
                  '3D планировка должна быть (фрейм)');
              }
            });

            expect(fi.lk.getAddToFavBtnCount())
              .toBe(2, 'должно быть 2 кнопки добавления в избранное');
            expect(fi.lk.getAddToCompareCount())
              .toBe(2, 'должно быть 2 кнопки добавления к сравнению');

            fi.popup.hide();
            h.wait();
          } else {
            expect(fi.info.getButtonsCount()).toBe(1,
              'дольщик: одна кнопка (подробнее)');
            expect(fi.info.getButtonText(0)).toBe('ПОДРОБНЕЕ О КВАРТИРЕ',
              'дольщик: текст кнопки перехода к объекту вторички');
            expect(fi.info.getDolshikLabelText())
              .toBe('Квартира от собственника', 'дольщик: подпись');
            browser.getCurrentUrl().then(function(url) {
              expect(fi.info.getButtonLink(0))
                .toContain('/realty/' + url.split('#')[1],
                  'дольщик: ссылка на квартиру');
            });
          }
        });
        // Элементы ЛК
        expect(fi.lk.getAddToFavBtnCount())
          .toBe(1, 'должна быть 1 кнопка добавления в избранное');
        expect(fi.lk.getAddToCompareCount())
          .toBe(1, 'должна быть 1 кнопка добавления к сравнению');

      });

    });
  }
});