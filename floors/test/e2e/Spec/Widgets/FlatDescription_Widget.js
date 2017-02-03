var Widget = require("./Widget.js");

var FlatDescriptionWidget = Widget.extend({
  description: $('.builder-description'),

  getDescription: function(){
    return this.description.getText();
  }
});

module.exports = FlatDescriptionWidget;