var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherRangeWidget = require("../../../Widgets/MSearcherRange_Widget.js");

var range = Object.create(MSearcherRangeWidget).areaLand;
var layout = Object.create(SearchLayoutWidget);

var SearchByAreaLandSteps = function() {
  this.select = function(params, page) {
    var min = params[0];
    var max = params[1];

    h.wait();

    expect(range.getMin()).toBe('');
    expect(range.getMax()).toBe('');

    if (min > 0) {
      range.setMin(min);
      h.wait();
      range.getMin().then(function(result) {
        expect(result).toBe(String(min));
      });
    }

    if (max > 0) {
      range.setMax(max);
      h.wait();
      range.getMax().then(function(result) {
        expect(result).toBe(String(max));
      });
    }
    return true;
  };

  this.verify = function(params, page) {
    var min = params[0];
    var max = params[1];

    compare2 = function (value) {
      if ((min > 0) && (h.squareDeFormat(value, page) !== min)) {
        expect(h.squareDeFormat(value, page)).toBeGreaterThan(min);
      }

      if ((max > 0) && (h.squareDeFormat(value, page) !== max)) {
        expect(h.squareDeFormat(value, page)).toBeLessThan(max);
      }
    };

    if (min > 0) {
      range.getMin().then(function(result) {
        expect(result).toBe(String(min));
      });
    }

    if (max > 0) {
      range.getMax().then(function(result) {
        expect(result).toBe(String(max));
      });
    }

    switch (page) {
      case 'zastr':
        layout.getZastrTableSquares().each(function(element, index) {
          element.getText().then(function (areaLand) {
            if (areaLand.indexOf('-') !== -1) {
              compare2(areaLand.split(' - ')[0]);
              compare2(areaLand.split(' - ')[1]);
            } else {
              compare2(areaLand);
            }
          });
        });
        break;
      case 'realty_out':
        layout.getObjectParams().each(function(element, index) {
          element.getText().then(function (areaLand) {
            compare2(areaLand);
          });
        });
        break;
      default:
        layout.getObjectSquares().each(function(element, index) {
          element.getText().then(function (areaLand) {
            compare2(areaLand);
          });
        });
    }
  }
};

module.exports = SearchByAreaLandSteps;