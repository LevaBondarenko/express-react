var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherInputWidget = require("../../../Widgets/MSearcherInput_Widget.js");

var input = Object.create(MSearcherInputWidget);
var layout = Object.create(SearchLayoutWidget);

var SearchByToCenterSteps = function() {
  this.select = function(params, page) {
    var value = params[0];

    expect(input.getToCenter()).toBe('');
    input.setToCenter(value);
    h.wait();
    input.getToCenter().then(function(result) {
      expect(parseInt(result)).toEqual(value);
    });
    return true;
  };

  this.verify = function(params, page) {
    var value = params[0];

    input.getToCenter().then(function(result) {
      expect(h.strToInt(result)).toEqual(value);
    });

    layout.getObjectToCenters().each(function(element, index) {
      element.getText().then(function (toCenter) {

        toCenterInt = toCenter.indexOf('В черте города') > -1 ? 0 : parseInt(toCenter.split('(')[1].split(' км')[0]);
        if (toCenterInt !== value) {
          expect(toCenterInt).toBeLessThan(value);
        }
      });
    });
  }
};

module.exports = SearchByToCenterSteps;