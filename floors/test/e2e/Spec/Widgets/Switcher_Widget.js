var Switcher = require("./Widget.js").extend({
  buttons: $$('.switcher-wrapper button'),
  keyElement: $$('.switcher-wrapper button'),

  getButtons: function() {
    return this.buttons;
  },
  getButtonsCount: function() {
    return this.buttons.count();
  },
  isButtonDisplayed: function(index) {
    return this.buttons.get(index).isDisplayed();
  },
  clickButton: function(index) {
    this.wh.waitClickable(this.buttons.get(index));
    this.buttons.get(index).click();
  },
  getButtonText: function(index) {
    return this.buttons.get(index).getText();
  },
  activate: function() {
    var self = this;
    this.getButtons().each(function(button, index) {
      self.clickButton(index);
    });
  },
  getButtonClass: function(index) {
    return this.getAttribute(this.buttons.get(index), 'class');
  }
});

module.exports = Switcher;

module.exports.mobile = Switcher.extend({
  buttons: $$('section[id^="switcher_"].switcher-mobile button')
});
