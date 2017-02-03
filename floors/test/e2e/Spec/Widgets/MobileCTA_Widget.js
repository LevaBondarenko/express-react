module.exports = require("./Widget.js").extend({
  buttons: $$('.mobilecta--wrapper > div > *'),

  getButtons: function() {
    return this.buttons;
  },
  getButtonsCount: function() {
    return this.buttons.count();
  },
  getButtonText: function(buttonIndex) {
    return this.getText(this.buttons.get(buttonIndex));
  }
});