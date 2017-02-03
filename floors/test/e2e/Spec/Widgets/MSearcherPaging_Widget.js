var Widget = require("./Widget.js");
var protractor = require("protractor");

var navigate = function(button, index) {
  index === 1 && browser.executeScript('window.scrollTo(0,10000000);');
  return Widget.click(button.get(index)).then(function() {
    return browser.sleep(1000);
  });
};

var MSearcherPaging = Widget.extend({
  back: $$('.msearcherpaging--wrapper a:first-child'),
  forward: $$('.msearcherpaging--wrapper a:last-child'),
  label: $$('.msearcherpaging--wrapper a + div'),
  pagesCount: $$('.msearcherpaging--wrapper a + div span:last-child'),
  input: $$('.msearcherpaging--wrapper input'),

  getBackLabel: function(index) {
    return this.getText(this.back.get(index ? index : 0));
  },
  getForwardLabel: function(index) {
    return this.getText(this.forward.get(index ? index : 0));
  },
  getLabel: function(index) {
    return this.getText(this.label.get(index ? index : 0));
  },
  getPagesCount: function(index) {
    return this.getText(this.pagesCount.get(index ? index : 0));
  },
  hasInput: function(index) {
    return this.isPresent(this.input.get(index ? index : 0));
  },
  setPage: function(index, value) {
    return this.clear(this.input.get(index ? index : 0)).then(function() {
      browser.sleep(1000);
      return MSearcherPaging.sendKeys(MSearcherPaging.input.get(index ? index : 0), value).then(function() {
        MSearcherPaging.sendKeys(MSearcherPaging.input.get(index ? index : 0), protractor.Key.ENTER);
        return browser.sleep(1000);
      });
    });
  },
  goBack: function(index) {
    return navigate(this.back, index ? index : 0);
  },
  goForward: function(index) {
    return navigate(this.forward, index ? index : 0);
  },
  getPage: function(index) {
    return this.getAttribute(this.input.get(index ? index : 0), 'value');
  }
});

module.exports = MSearcherPaging;