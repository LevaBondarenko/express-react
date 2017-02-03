/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
/* Widgets */
var fqTitle = Object.create(require("../../../Widgets/FilterQuarterTitle_Widget.js"));
var fq = Object.create(require("../../../Widgets/FilterQuarterNew_Widget.js"));
var fi = Object.create(require("../../../Widgets/FilterQuarterFlatNew_Widget.js"));

var limit = browser.params.smoke ? browser.params.limitSmoke.nhFlats : browser.params.limit.nhFlats;

module.exports = require("../../../Common/Element.js").extend({
  verify: function() {
    h.setErrorMsg(4, 'Шахматка (заголовок)');
    expect(fi.info.getUpdated())
      .toMatch("Обновлено: [0-9]{1,2} .+ [0-9]{4} г.",
        h.getErrorMsg('Дата обновления должна иметь корректный формат'));

    expect(fqTitle.getTitle())
      .toBe('Выбрать квартиру',
        h.getErrorMsg('Должен отображаться корректный заголовок'));

    fqTitle.getItemTitle(0).then(function(qDeadline) {
      browser.manage().getCookie("E2E_nh_deadline").then(function(deadline) {
        expect(qDeadline)
          .toMatch("(Срок сдачи: [1-4]{1} кв. [0-9]{4}|Дом сдан)",
            h.getErrorMsg('Срок сдачи должен иметь корректный формат'));
        expect(qDeadline)
          .toContain(deadline.value.split(' г.')[0],
            h.getErrorMsg('Срок сдачи в фильтре должен совпадать со сроком '
              + 'сдачи в параметрах в шапке новостройки'));
      });
    });
    expect(fqTitle.getItemTitle(1))
      .toBe('Количество комнат',
            h.getErrorMsg('Заголовок первого параметра в фильтре'));
    expect(fqTitle.getItemTitle(2))
      .toBe('Площадь квартиры, м²',
            h.getErrorMsg('Заголовок второго параметра в фильтре'));
    expect(fqTitle.getItemTitle(3))
      .toContain('Стоимость, ',
            h.getErrorMsg('Заголовок третьего параметра в фильтре'));

    expect(fqTitle.getSliderFrom(0))
      .toMatch("от [0-9]+ м2",
            h.getErrorMsg('Формат слайдера площади (от)'));
    expect(fqTitle.getSliderTo(0))
      .toMatch("до [0-9]+ м2",
            h.getErrorMsg('Формат слайдера площади (до)'));
    h.getCurrency();
    browser.manage().getCookie("E2E_currency")
      .then(function(currency) {
        expect(fqTitle.getSliderFrom(1))
          .toMatch("от [0-9, ]+ " + currency.value,
            h.getErrorMsg('Формат слайдера цены (от)'));
        expect(fqTitle.getSliderTo(1))
          .toMatch("до [0-9, ]+ " + currency.value,
            h.getErrorMsg('Формат слайдера цены (до)'));
      });



    var verifyQuarter = function(i) {
      //Количество подъездов
      expect(fq.sections.getFilterLabel())
        .toBe('ПОДЪЕЗДЫ: ', h.getErrorMsg('Заголовок фильтра подъездов'));
      fq.sections.getCount().then(function(count) {
        fq.sections.getFilterCount().then(function(countFilter) {
          expect(count).toBe(countFilter,
            h.getErrorMsg('Количество подъездов в фильтре и шахматке должно совпадать'));
        });
      });

      //Нумерация подъездов
      fq.sections.getFilter().each(function(elem, index) {
        h.setErrorMsg(2, 'Подъезд: ' + (index + 1));
        fq.sections.getFilterText(elem).then(function(sNum) {
          if (index > 0) {
            browser.manage().getCookie("E2E_nh_prevSection")
              .then(function(prev) {
                expect(sNum).toBeGreaterThan(prev.value,
                  h.getErrorMsg('Номера подъездов в фильтре должны быть расположены по возрастанию'));
              });
          }
          browser.manage().addCookie("E2E_nh_prevSection", sNum);
          expect(fq.sections.getTitle(index))
            .toBe(sNum + " ПОДЪЕЗД",
              h.getErrorMsg('Подпись подъезда в шахматке'));

          //Нумерация этажей
          fq.sections.getFloorTexts(index).each(function(elem, sIndex) {
            fq.sections.getFloorText(elem).then(function(floor) {
              if (sIndex > 0) {
                browser.manage().getCookie("E2E_nh_prevFloor")
                  .then(function(prev) {
                    expect(parseInt(floor)).toBe(prev.value - 1,
                        h.getErrorMsg('Номера этажей в подъезде должны быть расположены по убыванию'));
                  });
              }
              browser.manage().addCookie("E2E_nh_prevFloor", floor);
            });
          });
        });
        h.setErrorMsg(2, '');
      });

      h.getCurrency(1);

      switch (i) {
        case 0: //Шахматка по количеству комнат
          h.setErrorMsg(4, 'Шахматка по количеству комнат');
          expect(fq.view.getTypeText(i))
            .toBe('количество комнат',
              h.getErrorMsg('Название 1-го вида шахматки'));

          //Площади квартир
          fq.sections.getMinSquares().each(function(sq, index) {
            expect(fq.sections.getSquareText(sq))
              .toMatch("([0-9]+|)", h.getErrorMsg('Формат площадей комнат'));
          });

          //Фильтр по количеству комнат и подписи ячеек
          fqTitle.getRooms().each(function(elem, index) {
            fqTitle.getFlatsCount().then(function(countStrAll) {
              fq.flats.getCount().then(function(countAll) {
                expect(countStrAll)
                  .toBe("ПОДХОДЯЩИХ КВАРТИР: " + countAll,
                    h.getErrorMsg('Количество квартир в фильтре и шахматке должно совпадать'));
                fqTitle.clickRoom(index + 1);
                fqTitle.getFlatsCount()
                  .then(function(countStrFiltered) {
                    fq.flats.getCount(index + 1)
                      .then(function(countFiltered) {
                        expect(countStrFiltered)
                          .toBe("ПОДХОДЯЩИХ КВАРТИР: " + countFiltered,
                            h.getErrorMsg('Количество квартир в фильтре и шахматке должно совпадать, комнат: '
                            + (index + 1)));
                        expect(countFiltered)
                          .not.toBeGreaterThan(countAll,
                            h.getErrorMsg('Количество квартир в шахматке после применения фильтра не должно быть большего общего количества, комнат: ' + (index + 1)));
                        fq.flats.get(index + 1)
                          .each(function(flat, fIndex) {
                            fq.flats.getCode(fIndex, index + 1).then(function(id) {
                              h.setErrorMsg(2, 'Квартира: ' + id);
                              if (!limit || fIndex < limit) {
                                expect(fq.flats.getText(fIndex, index + 1))
                                  .toMatch(("(" + (index + 1) + "к| )"),
                                    h.getErrorMsg('Формат текста в ячейке, комнат: '
                                    + (index + 1)));
                              }
                            });
                          });
                      });
                  });
                fqTitle.clickRoom(index + 1);
              });
            });
          });
          break;

        case 1: //Шахматка по цене
          h.setErrorMsg(4, 'Шахматка по цене');
          expect(fq.view.getTypeText(i)).toBe('цену',
            h.getErrorMsg('Название 2-го вида шахматки'));
          //Площади квартир
          fq.sections.getMinSquaresFull().each(function(sq, index) {
            expect(fq.sections.getSquareText(sq))
              .toMatch("([0-9]+[,]?[0-9]* м|)",
                h.getErrorMsg('Формат мин. площадей комнат'));
          });
          browser.manage().getCookie("E2E_currency")
            .then(function(currency) {
              fq.flats.get().each(function(flat, fIndex) {
                fq.flats.getCode(fIndex).then(function(id) {
                  h.setErrorMsg(2, 'Квартира: ' + id);
                  if (!limit || fIndex < limit) {
                    expect(fq.flats.getText(fIndex))
                      .toMatch("([0-9, ]+ т." + currency.value + "| )",
                        h.getErrorMsg('Формат текста в ячейке'));
                  }
                });
              });
            });
          break;

        case 2: //Шахматка по цене за м2
          h.setErrorMsg(4, 'Шахматка по цене за м2');
          expect(fq.view.getTypeText(i))
            .toBe('цену за м²',
            h.getErrorMsg('Название 3-го вида шахматки'));
          //Площади квартир
          fq.sections.getMinSquaresFull().each(function(sq, index) {
            expect(fq.sections.getSquareText(sq))
              .toMatch("([0-9]+[,]?[0-9]* м|)",
                h.getErrorMsg('Формат мин. площадей комнат'));
          });
          browser.manage().getCookie("E2E_currency")
            .then(function(currency) {
              fq.flats.get().each(function(flat, fIndex) {
                fq.flats.getCode(fIndex).then(function(id) {
                h.setErrorMsg(2, 'Квартира: ' + id);
                  if (!limit || fIndex < limit) {
                    expect(fq.flats.getText(fIndex))
                      .toMatch("([0-9, ]+ т." + currency.value + "/м²| )",
                        h.getErrorMsg('Формат текста в ячейке'));
                  }
                });
              });
            });
          break;
      }
    };

    fq.view.getTypes().each(function(elem, index) {
      fq.view.clickType(index);
      verifyQuarter(index);
    });
  },
});