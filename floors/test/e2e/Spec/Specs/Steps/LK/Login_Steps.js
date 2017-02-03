var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var authPanel = Object.create(require("../../../Widgets/AuthPanel2_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  auth: function() {
    authPanel.isNotLoggedIn().then(function(result) {
      if (result) {
        authPanel.openLogInForm();
        authPanel.enterLoginPassword(browser.params.lkUser.login,
          browser.params.lkUser.password);
        authPanel.enter();
        expect(authPanel.isNotLoggedIn())
          .toBe(false, 'Пользователь должен быть авторизован');
        h.wait(2);
      }
    });
  },
  authInPresentForm: function() {
    authPanel.isAuthFormShowed().then(function(result) {
      expect(result).toBe(true, 'Диалог авторизации должен быть открыт');
      authPanel.enterLoginPassword(
        browser.params.lkUser.login,
        browser.params.lkUser.password);
      authPanel.enter();
      h.wait();
    });
  },
  isNotLoggedIn: function() {
    return authPanel.isNotLoggedIn();
  },
  logout: function() {
    authPanel.logout();
    authPanel.closeAuthDlg();
  },
  logoutNotFromLK: function() {
    authPanel.logout();
  }
});