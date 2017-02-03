var Widget = require("./Widget.js");
var Helpers = require("../Helpers/helpers.js");
var h = Object.create(Helpers);

var MSearcherDeadlineWidget = Widget.extend({
  deadlineBtn: $('.msearcherdeadline--wrapper button'),
  onDeadline: $('input[data-type="ondeadline"] +  label > i'),
  firstQuarter: $$('#msearcher_deadline .dropdown--deadline').get(2).$('.dropdown--quarters div div:first-child'),
  firstQuarterNum: $$('#msearcher_deadline .dropdown--deadline').get(2).$('.dropdown--quarters div div:first-child'),
  firstYearNum: $$('#msearcher_deadline .dropdown--deadline').get(2).$$('div > .form-group div label span:not(.caret)').first(),

  toggleList: function() {
    this.deadlineBtn.click();
    h.wait();
  },

  clickOnDeadline: function() {
    this.onDeadline.click();
  },

  clickYear: function(year) {
    $('label[for="deadline_year_' + year + '"] i').click();
  },

  clickQuarter: function(year, quarter) {
    $('label[for="quarter_year_' + year + '_' + quarter + '"] i').click();
  },

  expandYear: function(year) {
    $('label[for="deadline_year_' + year + '"] + span.caret').click();
  },

  isQuarterClickable: function(year, quarter) {
    return $('label[for="quarter_year_' + year + '_' + quarter + '"] i').isDisplayed();
  },

  isListExpanded: function() {
    return this.onDeadline.isDisplayed();
  },

  isOnDeadlineSelected: function() {
    return $('input[data-type="ondeadline"] + label > i.icon_arrowChecked').isPresent();
  },

  isYearSelected: function(year) {
    return $('input[id="deadline_year_' + year + '"]:checked').isPresent();
  },

  isQuarterSelected: function(year, quarter) {
    return $('input[id="quarter_year_' + year + '_' + quarter + '"]:checked').isPresent();
  },

  getSelected: function() {
    return this.deadlineBtn.getText();
  },

  clickFirstQuarter: function() {
    this.firstQuarter.click();
  },

  getFirstQuarterNum: function() {
    return this.firstQuarterNum.getText();
  },

  getFirstYearNum: function() {
    return this.firstYearNum.getText();
  },
});

module.exports = MSearcherDeadlineWidget;
