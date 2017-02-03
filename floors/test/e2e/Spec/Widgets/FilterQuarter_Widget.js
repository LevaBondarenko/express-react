var Widget = require("./Widget.js");

var FilterQuarterWidget = Widget.extend({
  gpName: $('.filter-jk h1'),

  getGpName: function(){
    return this.gpName.getText();
  }
});

module.exports = FilterQuarterWidget;