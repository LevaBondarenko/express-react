var ph = Object.create(require("../Helpers/pageHelpers.js"));

module.exports = require("../Common/Element.js").extend({
  url: 'wp-admin',
  get: function(city) {
    var path = ph.getFullDomain(city) + '/' + this.url + '/';
    browser.get(path);
  },
  wpLogin: {
    loginField: $('input#user_login'),
    passwordField: $('input#user_pass'),
    enterBtn: $('input[name="wp-submit"].button'),
    logutBn: $('#wp-admin-bar-logout a'),
    loginForm: $('#loginform'),

    enterLoginData: function(login, password) {
      var self = this;
      this.loginField.clear().then(function() {
        self.loginField.sendKeys(login);
      });
      this.passwordField.clear().then(function() {
        self.passwordField.sendKeys(password);
      });
    },
    enter: function() {
      return this.enterBtn.click();
    },
    logout: function() {
      this.logutBn.click();
    },
    hasLoginForm: function() {
      return this.loginForm.isPresent();
    }
  },
  pageList: {
    menuItem: $('#adminmenu a.menu-top[href="edit.php?post_type=page"]'),

    open: function() {
      this.menuItem.click();
    }
  },
  wpLogout: {
    url: 'wp-login.php?action=logout',
    confirmation: $('a'),
    logout: function(city) {
      var path = ph.getFullDomain(city) + '/' + this.url;
      return browser.get(path);
    },
    confirmLogout: function() {
      return this.confirmation.click();
    }
  }
});