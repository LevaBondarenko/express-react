/* Helpers */
var ph = Object.create(require("../Helpers/pageHelpers.js"));
var sh = Object.create(require("../Helpers/specHelpers.js"));
/* Pages */
var page = Object.create(require("../Pages/Page.js"));
/* Steps */
var checkbox = Object.create(require("./Steps/Filter/FilterCheckbox_Steps.js"));
var range = Object.create(require("./Steps/Filter/FilterRange_Steps.js"));

var fCheckbox = Object.create(require("../Widgets/FilterCheckbox_Widget.js"));
var fRange = Object.create(require("../Widgets/FilterRange_Widget.js"));


sh.getCities().forEach(function(city) {
  describe('Фильтр объектов', function() {
    var filter = function(page, city, data) {
      if (sh.forPage(page)) {
        describe(page.getName() + ' - ' + ph.getCityParams(city)['name'], function() {
          beforeEach(function() {
            sh.getPage(page, city);
            ph.setErrorMsg(0);
          });
          data.forEach(function(item) {
            if (sh.notForSmoke || !item['skipSmoke']) {
              it(item['name'], function() {
                eval(item['func']);
              });
            }
          });
        });
      }
    };

    filter(page.realty, city, [
      {name: 'Рейтинг объекта', func: 'checkbox.verify(fCheckbox.rating)'},
      {name: 'Тип недвижимости', func: 'checkbox.verify(fCheckbox.type)'},
      {name: 'Площадь (от и до)', func: 'range.verify(fRange.square, 50, 60, page.realty)'},
      {name: 'Площадь (до)', func: 'range.verify(fRange.square, 0, 60, page.realty)', skipSmoke: 1},
      {name: 'Площадь (от)', func: 'range.verify(fRange.square, 50, 0, page.realty)', skipSmoke: 1},
      {name: 'Площадь кухни (от и до)', func: 'range.verify(fRange.rating, 10, 15)'},
      {name: 'Площадь кухни (до)', func: 'range.verify(fRange.rating, 0, 15)', skipSmoke: 1},
      {name: 'Площадь кухни (от)', func: 'range.verify(fRange.rating, 10, 0)', skipSmoke: 1},
      {name: 'Интересные предложения', func: 'checkbox.verify(fCheckbox.interesting)'},
      {name: 'Этаж (от и до)', func: 'range.verify(fRange.floor, 5, 7)'},
      {name: 'Этаж (до)', func: 'range.verify(fRange.floor, 0, 7)', skipSmoke: 1},
      {name: 'Этаж (от)', func: 'range.verify(fRange.floor, 5, 0)', skipSmoke: 1},
      {name: 'Этажность (от и до)', func: 'range.verify(fRange.floors, 9, 12)'},
      {name: 'Этажность (до)', func: 'range.verify(fRange.floors, 0, 12)', skipSmoke: 1},
      {name: 'Этажность (от)', func: 'range.verify(fRange.floors, 9, 0)', skipSmoke: 1},
      {name: 'Не первый этаж', func: 'checkbox.verify(fCheckbox.notFirstFloor)'},
      {name: 'Не последний этаж', func: 'checkbox.verify(fCheckbox.notLastFloor)'},
      {name: 'Ремонт', func: 'checkbox.verify(fCheckbox.keep)'},
      {name: 'Окна', func: 'checkbox.verify(fCheckbox.windows)'},
      {name: 'Медиа', func: 'checkbox.verify(fCheckbox.media)'}
    ]);

    filter(page.zastr, city, [
      {name: 'Рейтинг объекта', func: 'checkbox.verify(fCheckbox.rating)'},
      {name: 'Площадь (от и до)', func: 'range.verify(fRange.square, 50, 60, page.realty)'},
      {name: 'Площадь (до)', func: 'range.verify(fRange.square, 0, 60, page.realty)', skipSmoke: 1},
      {name: 'Площадь (от)', func: 'range.verify(fRange.square, 50, 0, page.realty)', skipSmoke: 1},
      {name: 'Этаж (от и до)', func: 'range.verify(fRange.floor, 5, 7)'},
      {name: 'Этаж (до)', func: 'range.verify(fRange.floor, 0, 7)', skipSmoke: 1},
      {name: 'Этаж (от)', func: 'range.verify(fRange.floor, 5, 0)', skipSmoke: 1},
      {name: 'Этажность (от и до)', func: 'range.verify(fRange.floors, 9, 12)'},
      {name: 'Этажность (до)', func: 'range.verify(fRange.floors, 0, 12)', skipSmoke: 1},
      {name: 'Этажность (от)', func: 'range.verify(fRange.floors, 9, 0)', skipSmoke: 1},
      {name: 'Не первый этаж', func: 'checkbox.verify(fCheckbox.notFirstFloor)'},
      {name: 'Не последний этаж', func: 'checkbox.verify(fCheckbox.notLastFloor)'},
      {name: 'Медиа', func: 'checkbox.verify(fCheckbox.media)'}
    ]);

    filter(page.realtyOut, city, [
      {name: 'Интересные предложения', func: 'checkbox.verify(fCheckbox.interesting)'},
      {name: 'Площадь участка (от и до)', func: 'range.verify(fRange.areaLand, 10, 15, "realty_out")'},
      {name: 'Площадь участка (до)', func: 'range.verify(fRange.areaLand, 0, 15, "realty_out")', skipSmoke: 1},
      {name: 'Площадь участка (от)', func: 'range.verify(fRange.areaLand, 10, 0, "realty_out")', skipSmoke: 1},
      {name: 'Площадь дома (от и до)', func: 'range.verify(fRange.areaHouse, 100, 150)'},
      {name: 'Площадь дома (до)', func: 'range.verify(fRange.areaHouse, 0, 150)', skipSmoke: 1},
      {name: 'Площадь дома (от)', func: 'range.verify(fRange.areaHouse, 100, 0)', skipSmoke: 1},
      {name: 'До центра (от и до)', func: 'range.verify(fRange.toCenter, 10, 20)'},
      {name: 'До центра (до)', func: 'range.verify(fRange.toCenter, 0, 20)', skipSmoke: 1},
      {name: 'До центра (от)', func: 'range.verify(fRange.toCenter, 10, 0)', skipSmoke: 1},
      {name: 'В черте города', func: 'checkbox.verify(fCheckbox.inCity)'},
      {name: 'Канализация', func: 'checkbox.verify(fCheckbox.kanalizacija)'},
      {name: 'Отопление', func: 'checkbox.verify(fCheckbox.heating)'},
      {name: 'Водопровод', func: 'checkbox.verify(fCheckbox.waterline)'},
      {name: 'Медиа', func: 'checkbox.verify(fCheckbox.media)'}
    ]);

    filter(page.realtyRent, city, [
      {name: 'Рейтинг объекта', func: 'checkbox.verify(fCheckbox.rating)'},
      {name: 'Тип недвижимости', func: 'checkbox.verify(fCheckbox.type)'},
      {name: 'Площадь (от и до)', func: 'range.verify(fRange.square, 50, 60, page.realty)'},
      {name: 'Площадь (до)', func: 'range.verify(fRange.square, 0, 60, page.realty)', skipSmoke: 1},
      {name: 'Площадь (от)', func: 'range.verify(fRange.square, 50, 0, page.realty)', skipSmoke: 1},
      {name: 'Интересные предложения', func: 'checkbox.verify(fCheckbox.interesting)'},
      {name: 'Этаж (от и до)', func: 'range.verify(fRange.floor, 5, 7)'},
      {name: 'Этаж (до)', func: 'range.verify(fRange.floor, 0, 7)', skipSmoke: 1},
      {name: 'Этаж (от)', func: 'range.verify(fRange.floor, 5, 0)', skipSmoke: 1},
      {name: 'Этажность (от и до)', func: 'range.verify(fRange.floors, 9, 12)'},
      {name: 'Этажность (до)', func: 'range.verify(fRange.floors, 0, 12)', skipSmoke: 1},
      {name: 'Этажность (от)', func: 'range.verify(fRange.floors, 9, 0)', skipSmoke: 1},
      {name: 'Не первый этаж', func: 'checkbox.verify(fCheckbox.notFirstFloor)'},
      {name: 'Не последний этаж', func: 'checkbox.verify(fCheckbox.notLastFloor)'},
      {name: 'Ремонт', func: 'checkbox.verify(fCheckbox.keep)'},
      {name: 'Окна', func: 'checkbox.verify(fCheckbox.windows)'},
      {name: 'Медиа', func: 'checkbox.verify(fCheckbox.media)'}
    ]);

    filter(page.commerce, city, [
      {name: 'Тип недвижимости', func: 'checkbox.verify(fCheckbox.type)'},
      {name: 'Площадь (от и до)', func: 'range.verify(fRange.square, 50, 60, page.realty)'},
      {name: 'Площадь (до)', func: 'range.verify(fRange.square, 0, 60, page.realty)', skipSmoke: 1},
      {name: 'Площадь (от)', func: 'range.verify(fRange.square, 50, 0, page.realty)', skipSmoke: 1},
      {name: 'Интересные предложения', func: 'checkbox.verify(fCheckbox.interesting)'},
      {name: 'Этаж (от и до)', func: 'range.verify(fRange.floor, 5, 7)'},
      {name: 'Этаж (до)', func: 'range.verify(fRange.floor, 0, 7)', skipSmoke: 1},
      {name: 'Этаж (от)', func: 'range.verify(fRange.floor, 5, 0)', skipSmoke: 1},
      {name: 'Этажность (от и до)', func: 'range.verify(fRange.floors, 9, 12)'},
      {name: 'Этажность (до)', func: 'range.verify(fRange.floors, 0, 12)', skipSmoke: 1},
      {name: 'Этажность (от)', func: 'range.verify(fRange.floors, 9, 0)', skipSmoke: 1},
      {name: 'Не первый этаж', func: 'checkbox.verify(fCheckbox.notFirstFloor)'},
      {name: 'Не последний этаж', func: 'checkbox.verify(fCheckbox.notLastFloor)'},
      {name: 'Медиа', func: 'checkbox.verify(fCheckbox.media)'}
    ]);
  })
})