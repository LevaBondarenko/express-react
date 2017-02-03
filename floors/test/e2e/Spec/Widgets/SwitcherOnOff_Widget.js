module.exports = require("./Widget.js").extend({
  button: $('.switcheronoff-wrapper button'),
  keyElement: $$('.switcheronoff-wrapper button'),

  toggle: function(){
    this.wh.waitClickable(this.button);
    this.button.click();
  },
  activate: function(){
    this.toggle();
    this.toggle();
  }
});