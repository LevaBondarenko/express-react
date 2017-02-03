module.exports = require("./Widget.js").extend({
  rieltors: $$('.rieltorTab .rieltorTab-ico'),
  label: $('.noticeRieltorTab'),

  getRieltorsCount: function() {
    return this.rieltors.count();
  },
  getRieltors: function() {
    return this.rieltors;
  },
  getLabel: function() {
    return this.label.getText();
  },
  clickRieltor: function(index) {
    this.rieltors.get(index).click();
  },
  getPhoto: function(index) {
    return this.rieltors.get(index).$('img').getAttribute('src');
  }
});