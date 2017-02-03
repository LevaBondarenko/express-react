module.exports = require("./Widget.js").extend({
  container: $('.slider2_--wrapper'),
  keyElement: $$('.slider2_--wrapper .slider2-right'),
  nextBtn: $('.slider2-right'),
  prevBtn: $('.slider2-left'),

  next: function(){
    this.wh.waitClickable(this.container.element(this.nextBtn.locator()));
    this.container.element(this.nextBtn.locator()).click();
  },
  prev: function(){
    this.wh.waitClickable(this.container.element(this.prevBtn.locator()));
    this.container.element(this.prevBtn.locator()).click();
  },
  activate: function(){
    this.next();
    this.prev();
  }
});