module.exports = require("./Widget.js").extend({
  flats: {
    notDolshikFlats: $$('.build-list-block td[aria-describedby="titleTooltip"] div:not(.dolshik)'),
    flats: $$('.build-list-block td div[aria-describedby="titleTooltip"]'),
    flats0: $$('.build-list-block td[aria-describedby="titleTooltip"] tbody > tr > div > span[id]'),
    flats1: $$('.build-list-block td div[aria-describedby="titleTooltip"].firstRoom:not(.dole)'),
    flats2: $$('.build-list-block td div[aria-describedby="titleTooltip"].secondRoom:not(.dole)'),
    flats3: $$('.build-list-block td div[aria-describedby="titleTooltip"].thirdRoom:not(.dole)'),
    flats4: $$('.build-list-block td div[aria-describedby="titleTooltip"].pluralRooms:not(.dole)'),
    someFlats: $$('.quarter-table td'),
    activeDolshik: $('.build-list-block td div.sale.dolshik.active'),

    clickAnyNotDolshikFlat: function() {
      this.notDolshikFlats.get(0).click();
    },
    getNotDolshikFlatsCount: function() {
      return this.notDolshikFlats.count();
    },
    get: function(i) {
      return eval('this.flats' + (i ? i : ''));
    },
    isDolshikActive: function() {
      return this.activeDolshik.isPresent();
    },
    getText: function(index, i) {
      return eval('this.flats' + (i ? i : '')).get(index).getText();
    },
    getClass: function(index, i) {
      return eval('this.flats' + (i ? i : '')).getAttribute('class');
    },
    getFloor: function(index, i) {
      return eval('this.flats' + (i ? i : '')).get(index).$('span').getAttribute('data-floor');
    },
    getSection: function(index, i) {
      return eval('this.flats' + (i ? i : '')).get(index).$('span').getAttribute('data-section');
    },
    getCode: function(index, i) {
      return eval('this.flats' + (i ? i : '')).get(index).$('span').getAttribute('id');
    },
    getCount: function(i) {
      return eval('this.flats' + (i ? i : '')).count();
    },
    isClickable: function(elem) {
      return elem.isDisplayed();
    },
    click: function(index, i) {
      eval('this.flats' + (i ? i : '')).get(index).click();
    },
    clickSome: function() {
      this.someFlats.get(0).click();
    },
    isClickableSome: function() {
      return this.someFlats.get(0).isDisplayed();
    }
  },
  sections: {
    sections: $$('.build-list .build'),
    sectionTitles: $$('.xxx'),
    sectionsFilter: $$('.sectionPager a'),
    sectionsFilterLabel: $('.sectionPager > div'),
    minSquares: $$('.td-square-min-rooms'),
    minSquaresFull: $$('.td-square-min'),

    get: function() {
      return this.sections;
    },
    getCount: function() {
      return this.sections.count();
    },
    getTitle: function(index) {
      return this.sectionTitles.get(index).getText();
    },
    getFilter: function() {
      return this.sectionsFilter;
    },
    getFilterText: function(sf) {
      return sf.getText();
    },
    getFilterCount: function() {
      return this.sectionsFilter.count();
    },
    getFilterLabel: function() {
      return this.sectionsFilterLabel.getText();
    },

    getMinSquares: function() {
      return this.minSquares;
    },
    getMinSquaresFull: function() {
      return this.minSquaresFull;
    },
    getSquareText: function(sq) {
      return sq.getText();
    },
    getFloorTexts: function(index) {
      return this.sections.get(index).$$('th');
    },
    getFloorText: function(f) {
      return f.getText();
    }
  },
  view: {
    quarterTypes: $$('.menuBuild li a'),

    getTypes: function() {
      return this.quarterTypes;
    },
    clickType: function(index) {
      this.quarterTypes.get(index).click();
    },
    getTypeText: function(index) {
      return this.quarterTypes.get(index).getText();
    }
  },
  legend: {
    legend: $$('.legend li'),

    get: function() {
      return this.legend;
    },
    getText: function(index) {
      return this.legend.get(index).getText();
    },
    hasFlats: function(cl) {
      return $('.build-list-block div[class*=' + cl + ']').isPresent();
    }
  }
});