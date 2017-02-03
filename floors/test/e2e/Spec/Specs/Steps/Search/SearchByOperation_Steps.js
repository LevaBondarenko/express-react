var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherSelectWidget = require("../../../Widgets/MSearcherSelect_Widget.js");

var opertaion = Object.create(MSearcherSelectWidget).operation;
var layout = Object.create(SearchLayoutWidget);

var label1 = 'Купить';
var label2 = 'Снять'; 

var SearchByFurnitureSteps = function() {
  this.select = function() {
    expect(opertaion.getLabel()).toContain(label1);
    opertaion.openList();
    opertaion.selectLease();
    expect(opertaion.getLabel()).toContain(label2);
    return true;
  };

  this.verify = function() {
    expect(opertaion.getLabel()).toContain(label2);
  };
};

module.exports = SearchByFurnitureSteps;