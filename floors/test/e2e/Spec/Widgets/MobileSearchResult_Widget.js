var MSResult = require("./Widget.js").extend({
  title: {
    label: $$('.uagregator-wrapper').get(0),
    backBtn: $('.backButton'),

    get: function() {
      return MSResult.getText(this.label);
    },
    hasGoBackBtn: function() {
      return MSResult.isPresent(this.backBtn);
    }
  },
  objects: {
    objs: $$('.mobilesearchresult--wrap > div > div > div'),

    getAll: function() {
      return this.objs;
    },
    getTitle: function(index) {
      return MSResult.getText(this.objs.get(index).$$('div')
        .first().$$('div').first());
    },
    open: function(index) {
      return MSResult.click(this.objs.get(index)
        .$$('div:last-child > div:last-child > button').first());
    },
    getLinks: function() {
      return $$('.mobilesearchresult--wrap a');
    },
    hasRating: function(index) {
      return MSResult.isPresent(this.objs.get(index).$$('div').first()
        .$$('div').get(1));
    },
    getRatingValue: function(index) {
      return MSResult.getText(this.objs.get(index).$$('div').first()
        .$$('div').get(1).$$('div').first());
    },
    getRatingLabel: function(index) {
      return MSResult.getText(this.objs.get(index).$$('div').first()
        .$$('div').get(1).$$('div').last());
    },
    getPrice: function(index) {
      return MSResult.getText(this.objs.get(index).$$('div:nth-child(3)').first()
        .$$('div > span > span > span:first-child').first());
    },
    getOldPrice: function(index) {
      return MSResult.getText(this.objs.get(index)
        .$$('div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > span > span > span:first-child').first());
    },
    hasOldPrice: function(index) {
      return MSResult.isPresent(this.objs.get(index)
        .$$('div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > span > span > span:first-child').first());
    },
    getLeftButtonText: function(index) {
      return MSResult.getText(this.objs.get(index)
        .$$('div:last-child > div:first-child > button').first());
    },
    getRightButtonText: function(index) {
      return MSResult.getText(this.objs.get(index)
        .$$('div:last-child > div:last-child > button').first());
    },
    getParams: function(index) {
      return $$('.mobilesearchresult--wrap > div > div > div:nth-child(' + index + ') > div:nth-child(3) > div');
    }
  }
});

module.exports = MSResult;