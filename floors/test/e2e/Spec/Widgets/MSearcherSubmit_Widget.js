var Widget = require("./Widget.js");
var wh = Object.create(require("../Helpers/waitHelpers.js"));

var MSearcherSubmitWidget = Widget.extend({
  submitButton: $('button.btn-searchform'),
  submitButtonDisabled: $('button.btn-searchform[disabled]'),

  submit: function() {
    this.click(this.submitButton);
    wh.waitClickable(this.submitButton, 'Не кликабельна кнопка "Найти" после поиска');
    wh.logCurrentPageUrl();
  },

  getDiasbled: function() {
    return this.isPresent(this.submitButtonDisabled);
  }
});

module.exports = MSearcherSubmitWidget;
