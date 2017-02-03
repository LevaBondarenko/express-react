var Widget = require("./Widget.js");
var Helpers = require("../Helpers/helpers.js");
var h = Object.create(Helpers);

var MSearcherSettleInYearWidget = Widget.extend({
  settleInYear: $('.msearchersettleinyear--wrapper'),
  settleInYearChecked: $('input[data-field="settleInYear"]:checked'),

  toggle: function() {
    this.settleInYear.click();
  },

  getLabel: function() {
    return this.settleInYear.getText();
  },

  isSelected: function() {
    return this.settleInYearChecked.isPresent();
  }
});

module.exports = MSearcherSettleInYearWidget;
