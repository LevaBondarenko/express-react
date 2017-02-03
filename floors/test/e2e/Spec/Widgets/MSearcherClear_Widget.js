module.exports = require("./Widget.js").extend({
  button: $('.msearcher-clearall'),

  clickBtn: function() {
    return this.click(this.button);
  }
});