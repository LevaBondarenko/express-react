var Widget = require("./Widget.js");
var waitHelpers = require("../Helpers/waitHelpers.js");
var wh = Object.create(waitHelpers);

var AuthPanelWidget = Widget.extend({
  registerBtn: $('.login > button:first-child'),
  loginBtn: $('.login > button:last-child'),
  loginField: $('.auth-form input[data-name="login"]'),
  passwordField: $('.auth-form input[data-name="password"]'),
  enterBtn : $('.auth-form button[type="submit"]'),
  avatar: $('.user-menu-toggle .avatar'),
  userName: $('.user-menu-toggle .username-name'),
  menuItemFav: $('.usermenu .usermenu-item button[data-link="favorites"]'),
  menuItemLogout: $('.usermenu .usermenu-item:last-child button'),
  favBadge: $('.authpanel-item:not(.user-menu-toggle) .badge'),
  closeAuthDlgBtn: $('.modal-dialog button.close'),

  isNotLoggedIn: function(){
    return this.loginBtn.isPresent();
  },
  getFavCount: function(){
    return this.favBadge.getText();
  },
  hasFavCount: function(){
    return this.favBadge.isPresent();
  },
  openLogInForm: function(){
    this.loginBtn.click();
  },
  openMenu: function(){
    this.userName.click();
  },
  openMenuFavItem: function(){
    this.openMenu();
    this.menuItemFav.click();
  },
  logout: function(){
    this.openMenu();
    this.menuItemLogout.click();
  },
  closeAuthDlg: function(){
    this.closeAuthDlgBtn.click();
  },
  enterLoginPassword: function(login, password){
    this.loginField.sendKeys(login);
    this.passwordField.sendKeys(password);
  },
  enter: function(){
    this.enterBtn.click();
    wh.waitPresence(this.avatar, 'Не отображается аватар пользователя', 5000);
  }
});

module.exports = AuthPanelWidget;