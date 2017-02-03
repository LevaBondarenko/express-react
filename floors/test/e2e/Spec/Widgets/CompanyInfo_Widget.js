module.exports = require("./Widget.js").extend({
  content: $('.companyinfo--wrapper'),

  getContent: function() {
    return this.getText(this.content);
  }
});