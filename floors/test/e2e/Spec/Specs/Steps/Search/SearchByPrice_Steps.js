var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherRangeWidget = require("../../../Widgets/MSearcherRange_Widget.js");

var range = Object.create(MSearcherRangeWidget).price;
var layout = Object.create(SearchLayoutWidget);

var SearchByPriceSteps = function() {
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
        expect(h.strToInt(result)).toEqual(min);
      });
    }

    if (max > 0) {
      range.setMax(max);
      h.wait();
      range.getMax().then(function(result) {
        expect(h.strToInt(result)).toEqual(max);
      });
    }
    return true;
  };

  this.verify = function(params, page) {
    var min = params[0];
    var max = params[1];

    compare = function (value) {
      if (min) {
        expect(h.strToInt(value)).not.toBeLessThan(min);
      }

      if (max) {
        expect(h.strToInt(value)).not.toBeGreaterThan(max);
      }
    };

    if (min > 0) {
      range.getMin().then(function(result) {
        expect(h.strToInt(result)).toEqual(min);
      });
    }

    if (max > 0) {
      range.getMax().then(function(result) {
        expect(h.strToInt(result)).toEqual(max);
      });
    }

    if (page === 'zastr') {
      layout.getZastrMinPrices().each(function(element, index) {
        element.getText().then(function (price) {
          compare(price);
        });
      });

      layout.getZastrTablePrices().each(function(element, index) {
        element.getText().then(function (price) {
          if (price.indexOf('от') !== -1) {
            compare(price.split('от ')[1]);
          } else {
            compare(price);
          }
        });
      });
    } else {
      layout.getObjectPrices().each(function(element, index) {
        element.getText().then(function (price) {
          compare(price);
        });
      });
    }
  }
};

module.exports = SearchByPriceSteps;