var h = Object.create(require("../../../Helpers/helpers.js"));
/* STEPS */
var SearchBySquareSteps = require("../Search/SearchBySquare_Steps.js");
var searchBySquare = new SearchBySquareSteps();
var SearchByAreaLandSteps = require("../Search/SearchByAreaLand_Steps.js");
var searchByAreaLand = new SearchByAreaLandSteps();
/* Widgets */
var searchLayout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var searcherSubmit = Object.create(require("../../../Widgets/MSearcherSubmit_Widget.js"));
var f = Object.create(require("../../../Widgets/FilterRange_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  verify: function(f, min, max, page) {
    var addParams = function() {
      var minPart, maxPart;

      if (min) {
        minPart = f.param + '_min=' + min;
      }
      if (max) {
        maxPart = f.param + '_max=' + max;
      }

      return (min ? minPart : '') + (min && max ? '&' : '') + (max ? maxPart : '');
    };

    var verifyFilter = function() {
      browser.getCurrentUrl().then(function(url) {
        if (min) {
          expect(url).toContain(f.param + '_min=' + min,
            h.getErrorMsg('URL должен содержать выбранный параметр фильтра (мин.)'));
        } else {
          expect(url).not.toContain(f.param + '_min=',
            h.getErrorMsg('URL не должен содержать параметр фильтра (мин.)'));
        }
        if (max) {
          expect(url).toContain(f.param + '_max=' + max,
            h.getErrorMsg('URL должен содержать выбранный параметр фильтра (макс.)'));
        } else {
          expect(url).not.toContain(f.param + '_max=',
            h.getErrorMsg('URL не должен содержать параметр фильтра (макс.)'));
        }
      });
      f.getValues().then(function(values) {
        if (min) {
          expect(values).toContain(min + ' -',
            h.getErrorMsg('В слайдере должно быть задано минимальное значение'));
        }
        if (max) {
          expect(values).toContain('- ' + max,
            h.getErrorMsg('В слайдере должно быть задано максимальное значение'));
        }
      });
      switch (f.param) {
        case 'square':
          searchBySquare.verify([min, max], page);
          break;
        case 'area_land':
          searchByAreaLand.verify([min, max], page);
          break;
        case 'floor':
        case 'floors':
          searchLayout.getObjectFloors().each(function(elem) {
            elem.getText().then(function(text) {
              if (f.param === 'floor') {
                var floor = text.split(': ')[1].split('/')[0];
              } else {
                var floor = text.split(': ')[1].split('/')[1];
              }
              if (min) {
                expect(floor).not.toBeLessThan(min,
                  h.getErrorMsg('Этаж/этажность объекта в выдаче не должны быть меньше минимальной границы'));
              }
              if (max) {
                expect(floor).not.toBeGreaterThan(max,
                  h.getErrorMsg('Этаж/этажность объекта в выдаче не должны быть больше максимальной границы'));
              }
            });
          });
          break;
        case 'tocenter':
          searchLayout.getObjectLocations().each(function(elem) {
            elem.getText().then(function(text) {
              var distance = text.split(' (')[1].split(' км')[0];

              if (min) {
                expect(distance).not.toBeLessThan(min,
                  h.getErrorMsg('Расстояние до центра в выдаче не должно быть меньше минимальной границы'));
              }
              if (max) {
                expect(distance).not.toBeGreaterThan(max,
                  h.getErrorMsg('Расстояние до центра в выдаче не должно быть больше максимальной границы'));
              }
            });
          });
          break;
      }
    };

    browser.getCurrentUrl().then(function(url) {
      browser.get(url + (url.indexOf('?') === -1 ? '?' : '&') + addParams());
      verifyFilter();
      searcherSubmit.getDiasbled().then(function(result){
        if(!result){
          searcherSubmit.submit();
          verifyFilter();
        }
      });
    });
  }
});