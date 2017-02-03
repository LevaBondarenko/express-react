var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherSelectWidget = require("../../../Widgets/MSearcherSelect_Widget.js");

var builder = Object.create(MSearcherSelectWidget).builder;
var layout = Object.create(SearchLayoutWidget);
var label = 'Застройщик';

var SearchByBuilderSteps = function() {
  this.select = function() {
    expect(builder.getLabel()).toContain(label);
    builder.openList();
    builder.selectItem();
    expect(builder.getLabel()).not.toContain(label);
    browser.manage().addCookie("builder", builder.getLabel());
    return true;
  };

  this.verify = function() {
    expect(builder.getLabel()).not.toContain(label);
    builder.openList();
    browser.manage().getCookie("builder").then(function(activeBuilder) {
      layout.getObjectBuilders().each(function(element, index) {
        element.getText().then(function (builder) {
          expect(builder).toBe(activeBuilder.value);
        });
      });
    });
  };
};

module.exports = SearchByBuilderSteps;