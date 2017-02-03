module.exports = require("./Widget.js").extend({
  btn: $('.msearchersubmitm--wrapper a'),

  clickBtn: function() {
    this.click(this.btn);
  }
});