var h = Object.create(require("../../../Helpers/helpers.js"));
/* WIDGETS */
var group = Object.create(require("../../../Widgets/FilterGroupSwitcher_Widget.js"));
var range = Object.create(require("../../../Widgets/FilterRange_Widget.js"));
var msRange = Object.create(require("../../../Widgets/MSearcherRange_Widget.js"));
var msCount = Object.create(require("../../../Widgets/MSearcherCount_Widget.js"));
var layoutNav = Object.create(require("../../../Widgets/SearchLayout_Widget.js")).navigation;

var SearchFilterSteps = require("../../../Common/Element.js").extend({
  verifyCheckbox: function(params, values, message, not, brackets, seo) {
    // this.verifyUrl('checkbox', [param], [value], message, not, brackets, seo);
    // this.verifyCounters(message + param + ', ' + value);

    this.verifyUrl('checkbox', params, values, message, not, brackets, seo);
    this.verifyCounters(message + params.join(",") + ', ' + values.join(","));
  },
  verifyRange: function(param, min, max, message, not) {
    this.verifyUrl('range', [param], [min, max], message, not);
    this.verifyCounters(message
      + param + '_min=' + min + ', '+ param + '_max=' + max);
    range.getWidgetsByParam(param).then(function(result) {
      result > 0 && !not && range.getLabel(param).then(function(label) {
        SearchFilterSteps.verifyRangeLabels(label, min, max);
      });
    });
    msRange.getWidgetsByParam(param).then(function(result) {
      result > 0 && min && !not && msRange.getValueByParam(param, 'min')
        .then(function(value) {
        expect(h.strToInt(value)).toBe(min,
          'Минимальное значение в поисковике и фильтре должно совпадать, ' +
          param + ', ' + message)
      });
      result > 0 && max && !not && msRange.getValueByParam(param, 'max')
        .then(function(value) {
        expect(h.strToInt(value)).toBe(max,
          'Максимальное значение в поисковике и фильтре должно совпадать, ' +
          param + ', ' + message)

      });
    });
  },
  verifyHint: function(hint) {
    var count = hint.split(': ')[1].split(' вариант')[0];
      msCount.getCount().then(function(countAll) {
        expect(count).toBe(countAll,
          "Количество объектов в подсказке и поисковике должно совпадать");
      });
  },
  verifyClearBtn: function(hasClearBtn) {
    hasClearBtn.then(function(hasClearBtn) {
      expect(hasClearBtn).toBe(false,
        "Кнопка Очистить должна отсутствовать");
    });
  },
  addParams: function(param, min, max) {
    var minPart, maxPart;

    if (min) {
      minPart = param + '_min=' + min;
    }
    if (max) {
      maxPart = param + '_max=' + max;
    }

    return (min ? minPart : '') + (min && max ? '&' : '') + (max ? maxPart : '');
  },
  getMinMaxByParam: function(param) {
    switch (param) {
      case 'price':
        return [2500000, 3700000];
      case 'square':
        return [55, 65];
      case 'square_kitchen':
        return [9, 15];
      case 'floor':
        return [2, 4];
      case 'floors':
        return [5, 9];
      case 'deadline_y':
        return [2017, 2018];
      case 'area_land':
        return [10, 15];
      case 'area_house':
        return [100, 130];
      case 'tocenter':
        return [5, 20];
      case 'building_year':
        return [1950, 2015];
      default:
        return [20, 25];
    }
  },
  getSeoUrl: function(param, value) {
    switch (param) {
      case 'district_id':
        return "\/r-.+\/";
      case 'type':
        switch (value) {
          case 'house':
            return 'doma';
          case 'garden':
            return 'dachnye-uchastki';
          case 'land':
            return 'zemelnye-uchastki';
          case 'cottage':
            return 'cottage';
          case 'townhouse':
            return 'taunhausy';
          case 'dev':
            return 'proizvodstvo';
          case 'base':
            return 'bazy';
          case 'busines':
            return 'gotovyjj-biznes';
          case 'office':
            return 'ofis';
          case 'torg':
            return 'torgovye-pomeshheniya';
          case 'other':
            return 'svobodnoe-naznachenie';
          case 'sklad':
            return 'sklad';
          default:
            return false;
        }
        break;
      default:
        return false;
    }
  },
  //doesn`t work
  getGroupIndex: function(id) {
    var clearIndex = -1;
    var clearIndexFinal = -1;

    group.getAllWidgets().each(function(allWidget, allIndex) {
      group.getId(allIndex).then(function(allId) {
        group.getClass(allIndex).then(function(cl) {
          if (cl.indexOf('filtergroupswitcher--wrapper') > -1) {
            clearIndex = allIndex;
          } else if (id === allId && clearIndexFinal === -1
            && clearIndex !== -1) {
            return clearIndex;
          }
        });
      });
    });
  },
  verifyRangeLabels: function(label, min, max) {
    if (min) {
      expect(label).toContain(min + ' - ');
    }
    if (max) {
      expect(label).toContain(' - ' + max);
    }
  },
  verifyUrl: function(type, params, values, message, not, brackets, seo) {
    var encode = function(text) {
      return text.split("'").join("%27").split(">")
        .join("%3E").split(",").join("%2C");
    };

    var verify = function(str, method) {
      browser.getCurrentUrl().then(function(url) {
        // console.log(url);
        // console.log(str);
        if (!not) {
          expect(encode(url))[method](encode(str),
             h.getErrorMsg('URL должен содержать параметр фильтра: '
              + message));
        } else {
          expect(encode(url)).not[method](encode(str),
            h.getErrorMsg('URL не должен содержать параметр фильтра: '
              + message));
        }
      });
    };

    var str = '';

    if (seo && values.length === 1) {
      verify(this.getSeoUrl(params[0]), 'toMatch');
    } else {
      switch (type) {
        case 'range':
          var min = values[0];
          var max = values[1];
          var minPart, maxPart;

          if (min) {
            minPart = params[0] + '_min=' + min;
          }
          if (max) {
            maxPart = params[0] + '_max=' + max;
          }

          verify((min ? minPart : '') + (min && max ? '&' : '')
            + (max ? maxPart : ''), 'toContain');
          break;
        case 'checkbox':
          values.forEach(function(value, index) {
            var count = 0;
            params.forEach(function(param) {
              if (param === params[index]) {
                count++;
              }
            });
            verify(params[index] + ((count > 1 || brackets) ? "[]" : "")
              + "=" + value, 'toContain');
          });
          break;
      }
    }
  },
  verifyCounters: function(paramsStr) {
    h.wait();
    Promise.all([
      msCount.getCount(),
      layoutNav.getDateCounter()
    ]).then(function(counts){
       expect(counts[1]).toContain('(' + counts[0] + ')',
        'Счетчик модульного поисковика и счетчик фильтра по дате должны совпадать, '
        + paramsStr);
    });
  }
});

module.exports = SearchFilterSteps;