/* Pages */
var admPage = Object.create(require("../../../Pages/WPAdmin_Page.js"));

module.exports = require("../../../Common/Element.js").extend({
  login: function(login, password){
    admPage.wpLogin.enterLoginData(login, password);
    return admPage.wpLogin.enter();
  },
  isLoginPage: function() {
    return admPage.wpLogin.hasLoginForm();
  },
  logout: function(city) {
    return admPage.wpLogout.logout(city).then(function() {
      admPage.wpLogout.confirmLogout();
    });
  }
});