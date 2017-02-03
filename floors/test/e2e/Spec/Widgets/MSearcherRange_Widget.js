var Widget = require("./Widget.js");

var MSearcherRangeWidget = Widget.extend({
  min: $('input'),
  max: $('input'),
  all: $$('section.msearcherrange--wrapper'),

  setMin: function(value){
    this.sendKeysByOne(this.min, value);
  },
  setMax: function(value){
    this.sendKeysByOne(this.max, value);
  },
  getMin: function(){
    return this.min.getAttribute('value');
  },
  getMax: function(){
    return this.max.getAttribute('value');
  },
  getAllWidgets: function() {
    return this.all;
  },
  getName: function(wIndex, minMax) {
    return this.getAttribute(this.all.get(wIndex)
      .$('input[data-type="' + minMax + '"]'), "placeholder");
  },
  getDataType: function(wIndex, minMax) {
    return this.getAttribute(this.all.get(wIndex)
      .$('input[data-type="' + minMax + '"]'), "data-field");
  },
  sendValue: function(wIndex, minMax, value) {
    this.sendKeysByOne(this.all.get(wIndex)
      .$('input[data-type="' + minMax + '"]'), value);
  },
  getWidgetsByParam: function(param) {
    return this.all.filter(function(elem) {
      return elem.$$('input').first()
        .getAttribute('data-field').then(function(p) {
        return p == param;
      });
    }).count();
  },
  getValueByParam: function(param, minMax) {
    var a = this.all.filter(function(elem) {
      return elem.$('input[data-type="' + minMax + '"]')
        .getAttribute('data-field').then(function(p) {
        return p == param;
      });
    }).first();
    return this.getAttribute(a.$('input[data-type="' + minMax + '"]'), "value");
  }
});

module.exports = MSearcherRangeWidget;

module.exports.price = MSearcherRangeWidget.extend({
  min: $('.msearcherrange--wrapper input[data-type="min"][data-field="price"]'),
  max: $('.msearcherrange--wrapper input[data-type="max"][data-field="price"]')
});

module.exports.square = MSearcherRangeWidget.extend({
  min: $('.msearcherrange--wrapper input[data-type="min"][data-field="square"]'),
  max: $('.msearcherrange--wrapper input[data-type="max"][data-field="square"]')
});

module.exports.areaLand = MSearcherRangeWidget.extend({
  min: $('.msearcherrange--wrapper input[data-type="min"][data-field="area_land"]'),
  max: $('.msearcherrange--wrapper input[data-type="max"][data-field="area_land"]')
});
