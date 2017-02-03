var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherDeadlineWidget = require("../../../Widgets/MSearcherDeadline_Widget.js");
var MSearcherSettleInYearWidget = require("../../../Widgets/MSearcherSettleInYear_Widget.js");
var MSearcherCheckBoxWidget = require("../../../Widgets/MSearcherCheckBox_Widget.js");

var deadline = Object.create(MSearcherDeadlineWidget);
var settleInYear = Object.create(MSearcherSettleInYearWidget);
var onDeadlineCheckbox = Object.create(MSearcherCheckBoxWidget);
var layout = Object.create(SearchLayoutWidget);
var label = 'Срок сдачи';

var getQuarterIncrement = function(year) {
    return year === new Date().getFullYear() ? 4 - Math.floor(new Date().getMonth()/3) : 4;
};

var SearchByDeadlineSteps = function() {
  this.select = function(params, page) {
    var onDeadline = params[0];
    h.wait();

    expect(deadline.getSelected()).toContain(label);
    deadline.toggleList();

    deadline.clickFirstQuarter();

    deadline.getFirstYearNum().then(function(resYear){
      deadline.getFirstQuarterNum().then(function(resQuarter){
        expect(deadline.getSelected())
          .toContain(resQuarter.split(' квартал')[0] + ' кв. ' + resYear + ' г.');
      });
    });

    deadline.isListExpanded().then(function(result) {
      if (!result) {
        deadline.toggleList();
      }
    });

    if (onDeadline) {
      deadline.clickOnDeadline();
      expect(deadline.getSelected()).not.toContain(label);
      expect(onDeadlineCheckbox.isSelected()).toBe(true);
      deadline.clickOnDeadline();
      expect(deadline.getSelected()).not.toContain(label);
      onDeadlineCheckbox.toggle();
      expect(deadline.getSelected()).not.toContain(label);
      // expect(deadline.isOnDeadlineSelected()).toBe(true);
      expect(deadline.getSelected()).toContain(': 2');
    }
    return true;
  };

  this.verify = function(params, page) {
    var onDeadline = params[0];

    var accepltableDeadlines = [];
    deadline.toggleList();

    deadline.getFirstYearNum().then(function(resYear){
      deadline.getFirstQuarterNum().then(function(resQuarter){
        if (onDeadline) {
          accepltableDeadlines.push('Дом сдан');
          // expect(deadline.isOnDeadlineSelected()).toBe(true);
          expect(onDeadlineCheckbox.isSelected()).toBe(true);
          expect(deadline.getSelected()).toContain(': 2');
        } else {
          expect(deadline.getSelected()).toContain(resQuarter + ' кв. ' + resYear + ' г.');
        }
        accepltableDeadlines.push('Срок сдачи ' + resQuarter + ' кв. ' + resYear);
      });
    });

    layout.getObjectDeadlines().each(function(element, index) {
      element.getText().then(function (deadline) {
        expect(accepltableDeadlines).toContain(deadline);
      });
    });
  }
};

module.exports = SearchByDeadlineSteps;