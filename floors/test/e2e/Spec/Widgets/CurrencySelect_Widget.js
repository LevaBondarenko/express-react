module.exports = require("./Widget.js").extend({
  keyElement: $$('.currencyselect-wrapper .dropdown'),
  button: $('.currencyselect-wrapper button'),
  currencies: $$('.currencyselect-wrapper li > a'),

  getCurrency: function() {
    return this.button.getText();
  },
  selectCurrency: function(c) {
    this.button.click();
    this.currencies.filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.indexOf(c) > -1
      });
    }).first().click();
  }
});