var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherSelectWidget = require("../../../Widgets/MSearcherSelect_Widget.js");

var jk = Object.create(MSearcherSelectWidget).jk;
var layout = Object.create(SearchLayoutWidget);
var label = 'Жилой комплекс';

var SearchByJKSteps = function() {
  this.select = function() {
    expect(jk.getLabel()).toContain(label);
    jk.getDisabled().then(function(result){
      if(!result){
        jk.openList();
        jk.selectItem();
        expect(jk.getLabel()).not.toContain(label);
        return true;
      } else {
        return false;
      }
    });
  };

  this.verify = function() {
    expect(jk.getLabel()).not.toContain(label);
  };
};

module.exports = SearchByJKSteps;