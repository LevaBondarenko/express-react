module.exports = require("./Order_Widget.js").modal.extend({
  container: $$('.rentbooking-wrapper'),
  keyElement: $$('.rentbooking-wrapper'),
  button: $$('.rentbooking-wrapper div > div > div:last-child'),
  phoneFormat: 2,
  widget: 'rentBooking',
  name: 'Бронирование (аренда онлайн)',
  insideObject: true
});
