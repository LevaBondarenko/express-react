var Widget = require("./Widget.js");
var Helpers = require("../Helpers/helpers.js");
var h = Object.create(Helpers);

var MSearcherSelectWidget_Dropdown = Widget.extend({
  button: $('button'),
  list: $('button + div'),
  disabled: $('button.disabled'),
  item: $('li:not(.active):first-child'),
  activeItem: $('li.active span:first-child'),
  selectLabel: $('span:first-child'),

  openList: function(){
    this.button.click();
  },

  selectItem: function(){
    this.list.element(this.item.locator()).click();
  },

  getActiveItemText: function(){
    return this.list.element(this.activeItem.locator()).getText();
  },

  getLabel: function(){
     return this.button.element(this.selectLabel.locator()).getText();
  },

  getDisabled: function(){
     return this.disabled.isPresent();
  }
});

var MSearcherSelectWidget_Switcher = Widget.extend({
  field: $('div'),
  
  selectItem: function(item){
    this.field.element($('button[data-value="' + item + '"]').locator()).click();
  },

  isChecked: function(item){
    return this.field.element($('button[data-value="' + item + '"].active').locator()).isPresent();
  }
});

module.exports.builder = MSearcherSelectWidget_Dropdown.extend({
  button: $('button[data-field="builder_id"]'),
  list: $('button[data-field="builder_id"] + div')
});

module.exports.jk = MSearcherSelectWidget_Dropdown.extend({
  button: $('button[data-field="newcomplex_id"]'),
  list: $('button[data-field="newcomplex_id"].disabled'),
  disabled: $('button[data-field="newcomplex_id"] + div')
});

module.exports.furniture = MSearcherSelectWidget_Dropdown.extend({
  button: $('button[data-field="furniture"]'),
  list: $('button[data-field="furniture"] + div')
});

module.exports.operation = MSearcherSelectWidget_Dropdown.extend({
  button: $('button[data-field="action_sl"]'),
  leaseOperation: $('li[data-value="lease"]'),
  selectLease: function(){
    this.leaseOperation.click();
  }
});

module.exports.realtyType = MSearcherSelectWidget_Switcher.extend({
  field: $('div[data-field="type"]')
});
