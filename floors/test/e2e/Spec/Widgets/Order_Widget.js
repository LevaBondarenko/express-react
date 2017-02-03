var h = Object.create(require("../Helpers/helpers.js"));

var OrderWidget = require("./Widget.js").extend({
  container: $$('*'),
  submitBtn: $('button[type="submit"]'),
  phoneInput: $('input[data-name="phone"]'),
  nameInput: $('input[data-name="name"]'),
  customInput: $('input[data-name="custom"]'),
  button: null,
  mayBeMissing: false,
  hasPhoneField: true,
  hasNameField: false,
  hasCustomField: false,
  redirectToThankYouPage: true,
  phoneFormat: 1,
  insideObject: false,
  insideLayout: false,
  insideBuilder: false,
  comment: [],
  widget: 'order',

  fillPhone: function(phone, index){
    // phone = '2' + phone;
    index = this.button ? 0 : index;
    var ph = this.container.get(index ? index : 0)
      .element(this.phoneInput.locator());
    // ph.clear();
    this.clear(ph);
    // this.wh.waitPresence(ph);
    this.sendKeys(ph, phone);
  },
  fillName: function(name, index){
    index = this.button ? 0 : index;
    this.sendKeys(this.container.get(index ? index : 0)
      .element(this.nameInput.locator()), name);
  },
  fillCustom: function(custom, index){
    var self = this;
    index = this.button ? 0 : index;
    var input = this.container.get(index ? index : 0).element(this.customInput.locator());
    input.isPresent().then(function(result){
      if(result){
        self.sendKeys(input, custom);
        return true;
      } else {
        return false;
      }
    });
  },
  submitFrm: function(index){
    index = this.button ? 0 : index;
    return this.click(this.container.get(index ? index : 0).element(this.submitBtn.locator()));
  },
  activate: function(){
    this.submitFrm();
  }
});

var ModalOrderWidget = OrderWidget.extend({
  openModal: function(index){
    this.wh.waitPresence(this.button.get(index ? index : 0));
    this.click(this.button.get(index ? index : 0));
    this.wh.waitPresence(this.container.get(0).element(this.phoneInput.locator()));
  },
  activate: function(){
    this.openModal();
    this.submitFrm();
  }
});

module.exports.plain = OrderWidget;
module.exports.modal = ModalOrderWidget;

module.exports.mortgage = OrderWidget.extend({
  name: 'Заявка (Ипотека)',
  container: $$('.mortgage--wrap'),
  keyElement: $$('.mortgage--wrap'),
  hasNameField: true,
  hasCustomField: true,
  mayBeMissing: true
});

module.exports.callMe = OrderWidget.extend({
  name: 'Заявка (Перезвоните мне)',
  container: $$('.order-bg .order-form'),
  keyElement: $$('.order-bg .order-form'),
  hasNameField: true,
  mayBeMissing: true
});

module.exports.main = OrderWidget.extend({
  name: 'Заявка (для главной)',
  container: $$('.mainPageOrder'),
  keyElement: $$('.mainPageOrder'),
  hasNameField: true,
  mayBeMissing: true
});

module.exports.mortgageLanding = OrderWidget.extend({
  name: 'Заявка (Лэндинг по ипотеке)',
  container: $$('.order--wrap .formLanding'),
  keyElement: $$('.order--wrap .formLanding')
});

module.exports.mainOneField = OrderWidget.extend({
  name: 'Заявка (для главной с 1 полем)',
  container: $$('.orderMainPageOneField'),
  keyElement: $$('.orderMainPageOneField'),
  mayBeMissing: true
});

module.exports.rentTop = OrderWidget.extend({
  name: 'Заявка (на аренду в шапке)',
  container: $$('.order-bg-template2'),
  keyElement: $$('.order-bg-template2'),
  hasNameField: true
});

module.exports.rentBottom = OrderWidget.extend({
  name: 'Заявка (на аренду)',
  container: $$('.order-bg-template1'),
  keyElement: $$('.order-bg-template1'),
  hasNameField: true
});

module.exports.seller1 = OrderWidget.extend({
  name: 'Заявка (Продавцу 1)',
  container: $$('.lkSellerOrder1'),
  keyElement: $$('.lkSellerOrder1'),
  hasNameField: true
});

module.exports.seller2 = OrderWidget.extend({
  name: 'Заявка (Продавцу 2)',
  container: $$('.lkSellerOrder2'),
  keyElement: $$('.lkSellerOrder2'),
  hasNameField: true
});

module.exports.newNHTop = OrderWidget.extend({
  name: 'Заявка (Описание новостройки в шапке)',
  container: $$('.orderNhOneField.zastr-order-parametrs'),
  keyElement: $$('.orderNhOneField.zastr-order-parametrs'),
  comment: ['fio','nhName', 'nhId'],
  insideNewNhObject: true
});

module.exports.newNHBottom = OrderWidget.extend({
  name: 'Заявка (Описание новостройки под шахматкой)',
  container: $$('.orderNhOneField.want'),
  keyElement: $$('.orderNhOneField.want'),
  comment: ['fio','nhName', 'nhId'],
  insideNewNhObject: true
});

module.exports.fieldsList = OrderWidget.extend({
  name: 'Заявка (форма с полями в список)',
  container: $$('.order-fieldsInRow'),
  keyElement: $$('.order-fieldsInRow'),
  hasNameField: true
});


module.exports.event = OrderWidget.extend({
  name: 'Заявка на мероприятие',
  container: $$('.orderYarmarka'),
  keyElement: $$('.orderYarmarka'),
  hasNameField: true,
  toDB: true
});

module.exports.didntLike = ModalOrderWidget.extend({
  name: 'Заявка (ничего не понравилось)',
  container: $$('.order-modal-form'),
  button: $$('.didntLike .order--modal button'),
  keyElement: $$('.didntLike .order--modal button'),
  insideLayout: true,
  mayBeMissing: true
});

var ModalOrderButtonWidget = ModalOrderWidget.extend({
  name: 'Заявка (кнопка с модальным окном)',
  container: $$('.modal-dialog'),
  hasNameField: true,
  button: $$('button.order-text-modal'),
  keyElement: $$('button.order-text-modal')
});

module.exports.buttonModal = ModalOrderButtonWidget;

module.exports.buttonModalFranch = ModalOrderButtonWidget.extend({
  name: 'Заявка (кнопка с модальным окном), Франшиза',
  button: $$('.landingfeature_btn'),
  keyElement: $$('.landingfeature_btn')
});

module.exports.opening = ModalOrderWidget.extend({
  name: 'Заявка для открытия города',
  container: $$('.modal-dialog'),
  button: $$('.order--openCity button'),
  closeBtn: $('.etagi--closeBtn'),
  keyElement: $$('.order--openCity button'),
  verify: function(){
    this.click(this.button.first());
    this.wh.waitPresence(this.container.get(0));
    this.wh.waitPresence(this.phoneInput);
    this.wh.waitPresence(this.nameInput);
    this.wh.waitPresence(this.submitBtn);
    this.click(this.closeBtn);
    this.wh.waitNotPresence(this.container.get(0));
  }
});
