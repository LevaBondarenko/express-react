var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherSelectWidget = require("../../../Widgets/MSearcherSelect_Widget.js");

var furniture = Object.create(MSearcherSelectWidget).furniture;
var layout = Object.create(SearchLayoutWidget);

var label = 'Укомплектованность';

var SearchByFurnitureSteps = function() {
  this.select = function() {
    expect(furniture.getLabel()).toContain(label);
    furniture.openList();
    furniture.selectItem();
    expect(furniture.getLabel()).not.toContain(label);
    return true;
  };

  this.verify = function() {
    expect(furniture.getLabel()).not.toContain(label);
  };
};

module.exports = SearchByFurnitureSteps;