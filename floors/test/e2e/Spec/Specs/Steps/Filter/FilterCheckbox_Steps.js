var h = Object.create(require("../../../Helpers/helpers.js"));
var wh = Object.create(require("../../../Helpers/waitHelpers.js"));
/* Widgets */
var searchLayout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var searcherSubmit = Object.create(require("../../../Widgets/MSearcherSubmit_Widget.js"));
var f = Object.create(require("../../../Widgets/FilterCheckbox_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({

  verify: function(f) {
    var param, value, urlPart;

    var verifyUrl = function(str, not) {
      browser.getCurrentUrl().then(function(url) {
        var encode = function(text) {
          return text.split("'").join("%27").split(">").join("%3E");
        };
        if (!not) {
          expect(encode(url)).toContain(encode(str),
             h.getErrorMsg('URL должен содержать выбранный параметр фильтра'));
        } else {
          expect(encode(url)).not.toContain(encode(str),
            h.getErrorMsg('URL не должен содержать выбранный параметр фильтра'));
        }
      });
    };

    var verifyFilter = function() {
      verifyUrl(urlPart);
      switch (param) {
        case 'rating_min':
        case 'rating_max':
          searchLayout.getObjectRatings().each(function(rating) {
            rating.getText().then(function(r) {
              if (param.indexOf('min') > 0) {
                expect(r).not.toBeLessThan(value,
                  h.getErrorMsg('Рейтинг объекта должен быть выше выбранного рейтинга'));
              } else {
                expect(r).not.toGreaterThan(value,
                  h.getErrorMsg('Рейтинг объекта должен быть ниже выбранного рейтинга'));
              }
            });
          });
          break;
        case 'type':
          var texts = [];
          texts['flat'] = '.+ КВАРТИРА';
          texts['pansion'] = 'ПАНСИОНАТ';
          texts['room'] = 'КОМНАТА';
          texts['malosem'] = 'МАЛОСЕМЕЙКА';
          texts['obshaga'] = 'ОБЩЕЖИТИЕ';
          searchLayout.getObjectHeaders().each(function(header) {
            expect(header.getText()).toMatch("^" + texts[value] + "$",
              h.getErrorMsg('Заголовок объекта должен соответствовать выбранному в фильтре типу'));
          });
          break;
        case 'old_price_min':
          searchLayout.getObjectsCount().then(function(count) {
            searchLayout.getObjectsDiscountCount().then(function(countD) {
              expect(count).toBe(countD,
                h.getErrorMsg('Количество объектов со скидкой должно быть равно общему количеству объектов'));
            });
          });
          break;
        case 'floor':
          searchLayout.getObjectFloors().each(function(elem) {
            elem.getText().then(function(text) {
              var floor = text.split(': ')[1].split('/')[0];
              var floors = text.split(': ')[1].split('/')[1];

              if (value === '!1') {
                expect(floor).not.toBe(1,
                  h.getErrorMsg('Этаж объекта в выдаче не должен быть 1'));
              } else {
                expect(floor).not.toBe(floors,
                  h.getErrorMsg('Этаж объекта в выдаче не должны быть равен этажности'));
              }
            });
          });
          break;
        case 'survey':
          searchLayout.getObjectParams().each(function(elem) {
            elem.getText().then(function(text) {
              expect(text).toContain('Межевание:  выполнено',
                h.getErrorMsg('В списке параметров объекта должно быть указано, что межевание выполнено'));
            });
          });
          break;
      }
    };

    h.setErrorMsg(3, 'Выбор параметров на странице');
    // wh.waitPresence(f);

    f.getItems().each(function(item, index) {
      f.getDataType(index).then(function(param1) {
        f.getValue(index).then(function(value1) {
          param = param1;
          value = value1;
          h.setErrorMsg(4, 'параметр: ' + param + ', значение: ' + value);
          browser.getCurrentUrl().then(function(url) {
            if (!browser.params.prevUrlPart) {
              verifyUrl(param + '=', 1);
            }
          });

          f.clickItem(index);

          urlPart = param + '=' + value;

          verifyFilter();
          h.setErrorMsg(3, 'Открытие страницы по url');
          browser.refresh();
          verifyFilter();
          h.setErrorMsg(3, 'Страница после нажатия "Найти" в поисковике');
          searcherSubmit.getDiasbled().then(function(result){
            if(!result){
              searcherSubmit.submit();
              verifyFilter();
            }
          });
          browser.getCurrentUrl().then(function(url) {
            if (f.radio) {
              if (browser.params.prevUrlPart) {
                verifyUrl(browser.params.prevUrlPart, 1);
              }
              browser.params.prevUrlPart = urlPart;
            } else {
              f.clickItem(index);
              browser.getCurrentUrl().then(function(url) {
                verifyUrl(urlPart, 1);
              });
            }
          });
        });
      });
    });
    browser.params.prevUrlPart = null;
  }
});