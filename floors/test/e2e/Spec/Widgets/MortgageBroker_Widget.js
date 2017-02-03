var MortgageBroker = require("./Order_Widget.js").modal.extend({
  name: 'Ипотечный брокер',
  button: $$('.mortgagebroker--wrapper button'),
  keyElement: $$('.mortgagebroker--wrapper button'),
  container: $$('.modal-dialog'),
  submitBtn: $('.btn-toolbar button:last-child'),
  phoneInput: $('input[data-name="userPhone"]'),
  nameInput: $('input[data-name="userName"]'),
  phoneFormat: 4,
  hasNameField: true,
  redirectToThankYouPage: false,
  comment: ['brokerName'], //toDo
  widget: 'broker',

  getFio: function(index) {
    return this.getInnerHtml($$('.mortgagebroker--wrapper').get(index ? index : 0).$('p:first-child'));
  }
});

module.exports = MortgageBroker;

module.exports.object = MortgageBroker.extend({
  name: 'объект',
  mayBeMissing: true,
  insideObject: true
});

module.exports.program = MortgageBroker.extend({
  name: 'ипотечная программа',
  button: $$('.mortgagebroker--wrapper > div > div > div:nth-child(4) button'),
  keyElement: $$('.mortgagebroker--wrapper > div > div > div:nth-child(4) button'),
  insideProgram: true
});

module.exports.bank = MortgageBroker.extend({
  name: 'банк',
  insideBank: true
});