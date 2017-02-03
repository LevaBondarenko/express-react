var Helpers = require("./helpers.js");

var waitHelpers = Helpers.extend({
  EC: protractor.ExpectedConditions,
  timeout: 20000,

  getTimeout: function(custom) {
    return custom ? custom : this.timeout;
  },
  waitClickable: function(element, message, timeout) {
    var self = this;
    return browser.getCurrentUrl().then(function(url) {
      return browser.wait(self.EC.elementToBeClickable(self.getElem(element)),
        self.getTimeout(timeout), message ? message
        : 'Ожидание кликабельности элемента ' + self.getElemDesc(element)
        + '   ' + url);
    });
  },
  waitInvisibility: function(element, timeout) {
    browser.wait(this.EC.invisibilityOf(element),
      this.getTimeout(timeout));
  },
  waitTextPresence: function(element, text, timeout) {
    browser.wait(this.EC.textToBePresentInElement(element, text),
      this.getTimeout(timeout));
  },
  waitUrlChanged: function(currentUrl, timeout) {
    var urlChanged = function(url) {
      return function () {
        return browser.getCurrentUrl().then(function(actualUrl) {
          return url != actualUrl;
        });
      };
    };

    return browser.wait(urlChanged(currentUrl), this.getTimeout(timeout),
      'Ожидание изменения url. Текущий url: ' + currentUrl);
  },
  waitPresence: function(element, message, timeout) {
    return browser.wait(this.EC.presenceOf(element), this.getTimeout(timeout),
      message ? message
      : 'Ожидание присутствия элемента ' + this.getElemDesc(element));
  },
  waitNotPresence: function(element, timeout) {
    browser.wait(this.EC.not(this.EC.presenceOf(element)),
      this.getTimeout(timeout));
  },
  waitNotEmpty: function(element, timeout) {
    browser.wait(protractor.until.elementTextMatches(element, /.+/),
      this.getTimeout(timeout));
  }
});

module.exports = waitHelpers;