var NotifyWidget = require("./Widget.js").extend({
  notification: $('.notify-custom'),
  notificationHeader: $('.notify-header'),
  notificationBody: $('.notify-body'),
  notificationBodyBold: $$('.notify-body b').last(),
  notificationLink: $('.notify-link'),
  info: $('.notify-info'),

  wait: function(){
    this.wh.waitPresence(this.notification);
  },

  waitInfo: function(){
    this.wh.waitPresence(this.info);
  },

  getHeader: function(){
    return this.notificationHeader.getText();
  },

  getBody: function(){
    return this.notificationBody.getText();
  },

  getBodyBold: function(){
    return this.getText(this.notificationBodyBold);
  },

  clickLink: function(){
    this.notificationLink.click();
  }
});

module.exports = NotifyWidget;