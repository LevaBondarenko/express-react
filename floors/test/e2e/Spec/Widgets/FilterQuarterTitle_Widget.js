module.exports = require("./Widget.js").extend({
  title: $('.nh-flat-header'),
  itemTitles: $$('.nh-flat-title-item .nh-flat-title-itemtitle'),
  flatsCount: $('.nh-flat-title-item .nh-flat-title-count'),
  sliderFrom: $$('.nh-flat-title-item .nh-flat-title-price .from'),
  sliderTo: $$('.nh-flat-title-item .nh-flat-title-price .to'),
  sliderFromSquare: $$('.nh-flat-title-item .nh-flat-title-price .from span:nth-child(2)'),
  sliderToSquare: $$('.nh-flat-title-item .nh-flat-title-price .to span:nth-child(2)'),
  sliderFromPrice: $('.nh-flat-title-item .nh-flat-title-price .from span:nth-child(2) > span > span:first-child'),
  sliderToPrice: $('.nh-flat-title-item .nh-flat-title-price .to span:nth-child(2) > span > span:first-child'),
  rooms: $$('.nh-flat-title-item .nh-flat-title-roomsbuttons input'),
  room1: $('.nh-flat-title-item .nh-flat-title-roomsbuttons input#checkbox_one + label'),
  room2: $('.nh-flat-title-item .nh-flat-title-roomsbuttons input#checkbox_two + label'),
  room3: $('.nh-flat-title-item .nh-flat-title-roomsbuttons input#checkbox_three + label'),
  room4: $('.nh-flat-title-item .nh-flat-title-roomsbuttons input#checkbox_four + label'),

  getTitle: function() {
    return this.title.getText();
  },
  getFlatsCount: function() {
    return this.flatsCount.getText();
  },
  getRooms: function() {
    return this.rooms;
  },
  clickRoom: function(i) {
    eval('this.room' + i).click();
    this.wh.wait();
  },
  getItemTitle: function(index) {
    return this.itemTitles.get(index).getText();
  },
  getSliderFrom: function(index) {
    return this.sliderFrom.get(index).getText();
  },
  getSliderTo: function(index) {
    return this.sliderTo.get(index).getText();
  },
  getSliderFromSquare: function(index) {
    return this.sliderFromSquare.get(index).getText();
  },
  getSliderToSquare: function(index) {
    return this.sliderToSquare.get(index).getText();
  },
  getSliderFromPrice: function() {
    return this.sliderFromPrice.getText();
  },
  getSliderToPrice: function() {
    return this.sliderToPrice.getText();
  }
});