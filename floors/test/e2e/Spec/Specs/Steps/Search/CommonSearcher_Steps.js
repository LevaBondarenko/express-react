var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);
/* Widgets */
var MSearcherCountWidget = require("../../../Widgets/MSearcherCount_Widget.js");

var counter = Object.create(MSearcherCountWidget);

var CommonSearcherSteps = function() {
  this.getCount = function() {
    h.wait();
    return counter.getCount();
  };

  this.verifyCommonCount = function(prev) {
    h.wait(2);
    counter.getCount().then(function(result){
      expect(parseInt(result.replace(' ',''))).toBeLessThan(parseInt(prev.replace(' ','')));
      expect(parseInt(result.replace(' ',''))).toBeGreaterThan(0);
    });
    return counter.getCount();
  };
};

module.exports = CommonSearcherSteps;