var Element = require("../../Common/Element.js");
var h = Object.create(require("../../Helpers/helpers.js"));
var wh = Object.create(require("../../Helpers/waitHelpers.js"));

var RiesTicketsPage = Element.extend({
  urlCommon: 'http://ries3.etagi.com/tickets/unassigned/?a=search&t=all&stype=LIKE&limit=1&query=',
  urlID: 'http://ries3.etagi.com/tickets/unassigned/?a=search&t=ticket&stype=LIKE&limit=1&query=',
  loginField: $('input[name="login"]'),
  passwordField: $('input[name="password"]'),
  loginBtn: $('button'),
  ticketId: $('a.Icon'),
  ticketContacts: $('div.name'),
  ticketCheckbox: $('.comment_block_control .check div'),
  ticketCheckboxes: $$('.ticket_list_table tr[id] .check'),
  ticketCreated: element(by.xpath('//table[@class="ticket_list_table"]//tr[3]/td[2]/small')),
  ticketCity: element(by.xpath('//table[@class="ticket_list_table"]//tr[3]/td[3]')),
  ticketType: element(by.xpath('//table[@class="ticket_list_table"]//tr[2]/td[3]')),
  ticketComment: element(by.xpath('//table[@class="ticket_list_table"]//tr[3]/td[8]')),
  ticketStatus: element(by.xpath('//table[@class="ticket_list_table"]//tr[3]/td[5]/small')),
  deleteBtn: element(by.cssContainingText('button.action', 'Удалить')),
  deleteConfirmBtn: element(by.cssContainingText('.ui-button-text', 'Удалить')),
  closeNewsBtn: element(by.xpath('//div[@id="news_close_div"]//img[1]')),
  fullTicketComment: element(by.xpath('//div[@id="tooltabs"]/div[1]/ul[@class="comment-list"]/li[1]//div[@class="comment-head"]//i')),

  getTicketsList: function(text){
    browser.get(this.urlCommon + text);
    h.logCurrentPageUrl();
  },

  getTicketsListByID: function(text){
    browser.get(this.urlID + text);
    h.logCurrentPageUrl();
  },

  login: function(login, password){
    this.loginField.sendKeys(login);
    this.passwordField.sendKeys(password);
    this.loginBtn.click();
  },

  isLoginPage: function(){
    return this.loginField.isPresent();
  },

  getTicketContacts: function(){
    return this.ticketContacts.getText();
  },

  getCreated: function(){
    return this.ticketCreated.getText();
  },

  getTicketCity: function(){
    return this.ticketCity.getText();
  },

  getTicketType: function(){
    return this.ticketType.getText();
  },

  getTicketComment: function(){
    return this.ticketComment.getText();
  },

  getFullTicketComment: function(){
    wh.waitPresence(this.fullTicketComment);
    return this.fullTicketComment.getText();
  },

  deleteFirstTicket: function(){
    this.ticketCheckbox.click();
    this.deleteBtn.click();
    this.deleteConfirmBtn.click();
  },

  closeNews: function(){
    this.closeNewsBtn.click();
  },

  isNews: function(){
    return this.closeNewsBtn.isPresent();
  },

  isNewsD: function(){
    return this.closeNewsBtn.isDisplayed();
  },

  ticketFound: function(){
    return this.ticketContacts.isPresent();
  },

  openTicket: function(){
    this.ticketId.click();
    console.log('Opened ticket page!');
    h.wait();
  },

  getTicketID: function(){
    return this.ticketId.getText();
  },

  getTicketStatus: function(){
    return this.ticketStatus.getText();
  },

  getTicketsCount: function(){
    return this.ticketCheckboxes.count();
  }
});

module.exports = RiesTicketsPage;