/* Helpers */
var sh = Object.create(require("../Helpers/specHelpers.js"));
var wh = Object.create(require("../Helpers/waitHelpers.js"));
/* Pages */
var admPage = Object.create(require("../Pages/WPAdmin_Page.js"));
/* Steps */
var auth = Object.create(require("./Steps/WPAdmin/Auth_Steps.js"));

if (sh.forPage()) {
  sh.getCities().forEach(function(city) {
    describe('Админка WP', function() {
      it('Авторизация', function() {
        admPage.get(city);
          auth.login('', '').then(function() {
            expect(auth.isLoginPage()).toBe(true);
          }).then(function() {
            return auth.login('', browser.params.wpUser.password).then(function() {
              expect(auth.isLoginPage()).toBe(true);
            });
          }).then(function() {
            return auth.login(browser.params.wpUser.login, '').then(function() {
              expect(auth.isLoginPage()).toBe(true);
            });
          }).then(function() {
            return auth.login('incorrectLogin', 'incorrectPassword').then(function() {
              expect(auth.isLoginPage()).toBe(true);
            });
          }).then(function() {
            wh.wait();
            return browser.getCurrentUrl().then(function(url) {
              auth.login(browser.params.wpUser.login,
                browser.params.wpUser.password).then(function() {
                wh.waitUrlChanged(url);
                expect(auth.isLoginPage()).toBe(false);
              });
            });
          }).then(function() {
            return browser.getCurrentUrl().then(function(url) {
              auth.logout(city).then(function() {
                wh.waitUrlChanged(url);
                expect(auth.isLoginPage()).toBe(true);
              });
            });
          });
      });
    });
  });
}