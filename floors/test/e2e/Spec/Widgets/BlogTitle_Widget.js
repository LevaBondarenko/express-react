module.exports = require("./Widget.js").extend({
  title: $('.blogtitle-wrapper h1 > b'),
  subTitle: $('.blogtitle-wrapper h1 > span'),

  getTitle: function(index) {
    return this.title.getText();
  },
  getSubTitle: function(index) {
    return this.subTitle.getText();
  }
});