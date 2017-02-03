Slider = require("./Widget.js").extend({
  nextBtn: $('.bx-next'),
  prevBtn: $('.bx-prev'),

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

module.exports.builder = Slider.extend({
  container: $('.buildersSlider'),
  keyElement: $$('.buildersSlider .bx-next'),
});
module.exports.mortgage = Slider.extend({
  container: $('.ipotekaSlider'),
  keyElement: $$('.ipotekaSlider .bx-next'),
});