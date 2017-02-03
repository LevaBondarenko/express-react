var FilterCheckbox = require("./Widget.js").extend({
  radio: false,
  all: $$('section.filtercheckbox--wrapper'),

  getAllWidgets: function() {
    return this.all;
  },
  getHint: function(wIndex) {
    return this.getText(this.all.get(wIndex).$('.filtercheckbox-hint'));
  },
  getName: function(wIndex) {
    return this.getText(this.all.get(wIndex).$('.filter-block-title'));
  },
  getItems: function(wIndex) {
    return this.all.get(wIndex).$$('label');
  },
  clickItem: function(wIndex, index) {
    return this.click(this.all.get(wIndex).$$('label').get(index));
  },
  getItemName: function(wIndex, index) {
    return this.getText(this.all.get(wIndex).$$('label').get(index));
  },
  getDataType: function(wIndex, index) {
    return this.getAttribute(this.all.get(wIndex).$$('input').get(index), 'data-type');
  },
  getValue: function(wIndex, index) {
    return this.getAttribute(this.all.get(wIndex).$$('input').get(index), 'value');
  },
  getValues: function(wIndex) {
    return this.all.get(wIndex).$$('input');
  },
  isRadio: function(wIndex) {
    return this.isPresent(this.all.get(wIndex).$('i.fa-circle'));
  },
  clear: function(wIndex) {
    this.click(this.all.get(wIndex).$('h3 a'));
  },
  hasClearBtn: function(wIndex) {
    return this.isPresent(this.all.get(wIndex).$('h3 a'));
  },
  getDataProp: function(wIndex) {
    return this.getAttribute(this.all.get(wIndex), 'data-prop');
  }
});

module.exports = FilterCheckbox;

module.exports.builderType = FilterCheckbox.extend({
  builderCheckbox: $('.filtercheckbox--wrapper label[for="dolshik--f"]'),

  clickBuilder: function() {
    return this.click(this.builderCheckbox);
  }
});