module.exports = require("./Widget.js").extend({
  btn: $('.msearcherorder--wrapper button'),
  items: $$('.mobile-modal.fullscreen > div:nth-child(3) > div'),

  clickBtn: function() {
    return this.click(this.btn);
  },
  getItems: function() {
    return this.items;
  },
  clickItem: function(index) {
    return this.click(this.items.get(index));
  },
  getItemText: function(index) {
    return this.getText(this.items.get(index));
  }
});