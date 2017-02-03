var USubmit = require("./Order_Widget.js").plain.extend({
  name: 'Универсальная кнопка отправки заявки',
  keyElement: $$('.usubmit-container button'),
  container: $$('.usubmit-container'),
  submitBtn: $('button'),
  phoneInput: $('input[data-field="phone"]'),
  nameInput: $('input[data-field="name"]'),
  hasPhoneField: false,
  hasNameField: false,
  noComment: true,
  needAuth: true,
  waitRedirect: true,
  waitNotification: true,
  redirectToThankYouPage: false,
  mayBeMissing: true,
  widget: 'usubmit'
});

module.exports = USubmit;

module.exports.object = USubmit.extend({
  name: 'объект',
  insideObject: true,
  comment: 'broker'
});

module.exports.bank = USubmit.extend({
  name: 'банк',
  insideBank: true,
  comment: 'broker'
});