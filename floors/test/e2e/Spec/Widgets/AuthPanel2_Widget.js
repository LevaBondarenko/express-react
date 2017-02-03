var Widget = require("./Widget.js");
var waitHelpers = require("../Helpers/waitHelpers.js");
var wh = Object.create(waitHelpers);

var AuthPanelWidget = Widget.extend({
  registerBtn: $('.user-menu-toggle > button:last-child'),
  loginBtn: $('.user-menu-toggle > button:first-child'),
  authForm: $('.auth-form'),
  loginField: $('.auth-form input[data-name="login"]'),
  passwordField: $('.auth-form input[data-name="password"]'),
  enterBtn : $('.auth-form button[type="submit"]'),
  avatar: $('.user-menu-toggle .img-circle'),
  userName: $('.user-menu-toggle .username-name'),
  menuItemFav: $('.usermenu .usermenu-item button[data-link="favorites"]'),
  menuItemProfile: $('.usermenu .usermenu-item button[data-link="profile"]'),
  menuItemLogout: $('.usermenu .usermenu-item:last-child button'),
  favBadge: $('a[href="/my/#/favorites/"] .badge'),
  closeAuthDlgBtn: $('.modal-dialog button.close'),
  keyElement: $$('.user-menu-toggle'),

  isNotLoggedIn: function(){
    return this.isPresent(this.loginBtn);
  },
  getFavCount: function(){
    return this.getText(this.favBadge);
  },
  hasFavCount: function(){
    return this.isPresent(this.favBadge);
  },
  openLogInForm: function(){
    this.click(this.loginBtn);
  },
  openMenu: function(){
    this.click(this.userName);
  },
  openMenuFavItem: function(){
    this.openMenu();
    this.click(this.menuItemFav);
  },
  openMenuProfileItem: function(){
    this.openMenu();
    this.click(this.menuItemProfile);
  },
  logout: function(){
    this.openMenu();
    this.click(this.menuItemLogout);
  },
  closeAuthDlg: function(){
    wh.waitClickable(this.closeAuthDlgBtn);
    this.click(this.closeAuthDlgBtn);
    wh.waitNotPresence(this.closeAuthDlgBtn);
  },
  enterLoginPassword: function(login, password){
    this.sendKeys(this.loginField, login);
    this.sendKeys(this.passwordField, password);
  },
  enter: function(){
    this.click(this.enterBtn);
    wh.waitPresence(this.avatar, 120000);
  },
  activate: function(){
    this.openLogInForm();
    this.closeAuthDlg();
  },
  isAuthFormShowed: function() {
    wh.waitPresence(this.authForm, 'Не отображается форма авторизации в ЛК');
    return this.isPresent(this.authForm);
  }
});

module.exports = AuthPanelWidget;