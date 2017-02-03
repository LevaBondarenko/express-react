var Widget = require("./Widget.js");

var BuilderObjectsWidget = Widget.extend({
  builderTitle: $('.builder-objects .widget-name'),

  getBuilderName: function() {
    return this.builderTitle.getText();
  },

  objects: {
    objects: $$('.builder-objects-menu li'),
    get: function() {
      return this.objects;
    },
    getName: function(index) {
      return this.objects.get(index).$('.obj-name').getText();
    },
    getFlatsCount: function(index) {
      return this.objects.get(index).$('.obj-name > span').getText();
    },
    click: function(index) {
      this.objects.get(index).click();
    }
  },
  active: {
    name: $('.builder-object-details h3'),
    priceMin: $('.builder-object-details .item--price'),
    description: $('.builder-object-details .item--description'),
    tableHeader: $$('.builder-object-details th'),
    tableCounts: $$('.builder-object-details tbody tr td:nth-child(4)'),
    more: $('.builder-object-details .item--controls a:first-child'),

    getName: function() {
      return this.name.getText();
    },
    getPriceMin: function() {
      return this.priceMin.getText();
    },
    getDescription: function() {
      return this.description.getText();
    },
    getHeaders: function(index) {
      return this.tableHeader.get(index).getText();
    },
    getCounts: function() {
      return this.tableCounts;
    }
  }
});

module.exports = BuilderObjectsWidget;