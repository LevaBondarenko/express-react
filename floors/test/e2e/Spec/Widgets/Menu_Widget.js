var wh = Object.create(require("../Helpers/waitHelpers.js"));

var MenuWidget = require("./Widget.js").extend({
  menuItem: $$('nav.header--navigation ul li a'),

  clickItem: function(index) {
    this.menuItem.get(index).click();
  }
});
module.exports = MenuWidget;

module.exports.additional = MenuWidget.extend({
  button: $('.advanced-menu-switcher'),
  keyElement: $$('.advanced-menu-switcher'),
  closeButton: $('.subMenuCloseBtn'),

  toggleMenu: function(){
    wh.waitClickable(this.button);
    this.button.click();
  },
  closeMenu: function(){
    this.closeButton.click();
  },
  activate: function(){
    this.toggleMenu();
    this.closeMenu();
  }
});
