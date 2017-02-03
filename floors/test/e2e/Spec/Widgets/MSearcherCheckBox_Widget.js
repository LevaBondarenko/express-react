module.exports = require("./Widget.js").extend({
  checkbox: $('.msearchercheckbox--wrapper input + label'),
  checkboxChecked: $('.msearchercheckbox--wrapper input:checked'),

  toggle: function(){
    this.click(this.checkbox);
    this.wh.wait();
  },
  isSelected: function(){
    return this.isPresent(this.checkboxChecked);
  }
});

module.exports.filter = require("./Widget.js").extend({
  all: $$('section.msearchercheckbox--wrapper.filterwidget-wrapper'),

  getAllWidgets: function() {
    return this.all;
  },
  getHint: function(wIndex) {
    return this.getText(this.all.get(wIndex).$('.filtercheckbox-hint span'));
  },
  getDataType: function(wIndex) {
    return this.getAttribute(this.all.get(wIndex).$('input'), 'data-field');
  },
  getValue: function(wIndex) {
    return this.getAttribute(this.all.get(wIndex).$('input'), 'value');
  },
  getName: function(wIndex) {
    return this.getText(this.all.get(wIndex).$('label > span'));
  },
  clickItem: function(wIndex) {
    return this.click(this.all.get(wIndex).$('i'));
  },
  getId: function(wIndex) {
    return this.getAttribute(this.all.get(wIndex), "id");
  }
});
