var Widget = require("./Widget.js");

var MSearcherInputWidget = Widget.extend({
  objectCode: $('input[data-field="object_id"]'),
  toCenter: $('input[data-field="tocenter_max"]'),

  setObjectCode: function(value){
    this.objectCode.sendKeys(value);
  },

  getObjectCode: function(){
    return this.objectCode.getAttribute('value');
  },

  setToCenter: function(value){
    this.toCenter.sendKeys(value);
  },

  getToCenter: function(){
    return this.toCenter.getAttribute('value');
  }
});

module.exports = MSearcherInputWidget;
