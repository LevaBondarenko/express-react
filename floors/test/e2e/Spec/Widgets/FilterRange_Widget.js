var FilterRangeWidget = require("./Widget.js").extend({
  getValues: function() {
    return this.getText(this.container.$('.slider--labels__values'));
  },

  all: $$('section.filterrange--wrapper'),

  getAllWidgets: function() {
    return this.all;
  },
  getName: function(wIndex) {
    return this.getText(this.all.get(wIndex).$('.slider--labels__title'));
  },
  getLabel: function(param) {
    return this.getText(this.all.filter(function(elem) {
      return elem.getAttribute('data-prop').then(function(p) {
        return p == param;
      });
    }).first().$('.slider--labels__values'));
    // return this.getText(this.all.get(wIndex).$('.slider--labels__values'));
  },
  getWidgetsByParam: function(param) {
    return this.all.filter(function(elem) {
      return elem.getAttribute('data-prop').then(function(p) {
        return p == param;
      });
    }).count();
  },
  getDataProp: function(wIndex) {
    return this.getAttribute(this.all.get(wIndex), 'data-prop');
  },
  getId: function(wIndex) {
    return this.getAttribute(this.all.get(wIndex), "id");
  }
});
module.exports = FilterRangeWidget;