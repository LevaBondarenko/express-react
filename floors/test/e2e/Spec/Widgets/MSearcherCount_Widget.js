module.exports = require("./Widget.js").extend({
  count: $('span[data-field="count"]'),

  getCount: function(){
    return this.getText(this.count);
  }
});