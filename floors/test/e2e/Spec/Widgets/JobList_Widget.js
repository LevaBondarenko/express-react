var OrderWidget = require("./Order_Widget.js");
var Helpers = require("../Helpers/helpers.js");
var h = Object.create(Helpers);

var JobListWidget = OrderWidget.modal.extend({
  name: 'Откликнуться на вакансию (список вакансий)',
  container: $$('.modal-dialog'),
  phoneInput: $('input[data-type="phone"]'),
  nameInput: $('input[data-type="name"]'),
  submitBtn: $('.modal-footer button'),
  jobSelected: $('select.form-control option:first-child'),
  jobFirstName: $('.hrJobsList .gm-scroll-view > div:first-child a'),
  toProfileLink: $('.joblist--wrap button + a'),
  button: $$('.joblist--wrap button'),
  keyElement: $$('.joblist--wrap button'),
  hasNameField: true,
  phoneFormat: 2,
  widget: 'jobList',
  mayBeMissing: true,
  /*fillPhone: function(phone){
    var ph = this.container.element(this.phoneInput.locator());
    browser.wait(function() {
      return ph.isPresent()
    }, 25000);
    ph.sendKeys(phone[0] + phone);
  },*/
  getJobName: function(){
    return this.container.get(0).element(this.jobSelected.locator()).getText();
  },
  getListJobName: function(){
    return this.jobFirstName.getText();
  },
  openProfile: function(){
    this.toProfileLink.click();
  },
  fillPhone: function(phone){
    var ph = this.container.get(0).element(this.phoneInput.locator());
    ph.clear();
    this.wh.waitPresence(ph);
    ph.sendKeys(phone);
  }
});

module.exports = JobListWidget;

