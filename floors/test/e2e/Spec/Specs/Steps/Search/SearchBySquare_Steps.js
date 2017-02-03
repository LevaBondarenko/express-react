var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherRangeWidget = require("../../../Widgets/MSearcherRange_Widget.js");

var range = Object.create(MSearcherRangeWidget).square;
var layout = Object.create(SearchLayoutWidget);

var SearchBySquareSteps = function() {
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
      if (min) {
        expect(h.squareDeFormat(value, page)).not.toBeLessThan(min);
      }

      if (max) {
        expect(h.squareDeFormat(value, page)).not.toBeGreaterThan(max);
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
          element.getText().then(function (square) {
            if (square.indexOf('от') !== -1) {
              compare2(square.split('от ')[1]);
            } else {
              compare2(square);
            }
          });
        });
        break;
      case 'realty_out':
        layout.getObjectParams().each(function(element, index) {
          element.getText().then(function (square) {
            compare2(square);
          });
        });
        break;
      default:
        layout.getObjectSquares().each(function(element, index) {
          element.getText().then(function (square) {
            compare2(square);
          });
        });
    }
  }
};

module.exports = SearchBySquareSteps;