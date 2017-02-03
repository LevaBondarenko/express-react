module.exports = require("./Widget.js").extend({
  keyElement: $$('.worktime-wrapper'),
  timeLabel: $('.worktime-wrapper a[href="/contacts/"] span:nth-child(1)'),
  time: $('.worktime-wrapper a[href="/contacts/"] span:nth-child(2)'),
  phone: $('.worktime-wrapper a[href^="tel:"]'),
  verify: function(){
  }
});