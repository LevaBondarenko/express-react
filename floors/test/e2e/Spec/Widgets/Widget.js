var h = Object.create(require("../Helpers/helpers.js"));

let Widget = require("../Common/Element.js").extend({
  wh: Object.create(require("../Helpers/waitHelpers.js")),
  keyElement: $$('*'),
  displayed: function(index) {
    return this.isDisplayed(this.keyElement.get(index ? index : 0));
  },
  sendKeysByOne: function(input, value) {
    String(value).split("").forEach(function(c){
      input.sendKeys(c);
      h.wait(0.25);
    });
  },
  verify: function() {},
  activate: function() {},

  getDefaultParams: function() {
    return {
      takeScreenshot: false,
      logIfDebug: true
    };
  },
  takeScreenshot: function(element, param, name) {
    param && h.takeScreenshot(name + ': ' + h.getElemNameOrLocator(element));
  },
  log: function(element, param, name) {
    h.isDedugMode() && param &&
      console.log('[' + h.getCurrentTime().grey + '] '
        + name + ': ' + h.getElemDesc(element));
  },
  click: function(element, timeout, params) {
    let label = 'Выполнен клик по элементу';

    params = params || this.getDefaultParams();

    return this.wh.waitClickable(h.getElem(element), '', timeout).then(function() {
      return h.getElem(element).click();
    });
  },
  getText: function(element, params) {
    let label = 'Получен текст элемента';
    params = params || this.getDefaultParams();

    return this.wh.waitPresence(h.getElem(element), null, 60000).then(function() {
      return h.getElem(element).getText().then(function(result) {
        return result;
      });
    });
  },
  getInnerHtml: function(element, params) {
    let label = 'Получен текст элемента';
    params = params || this.getDefaultParams();

    return this.wh.waitPresence(h.getElem(element), null, 60000).then(function() {
      return h.getElem(element).getInnerHtml().then(function(result) {
        return result;
      });
    });
  },
  getAttribute: function(element, attribute, params) {
    let label = 'Получен атрибут элемента';
    params = params || this.getDefaultParams();

    return this.wh.waitPresence(h.getElem(element)).then(function() {
      return h.getElem(element).getAttribute(attribute).then(function(result) {
        return result;
      });
    });
  },
  sendKeys: function(element, value, params) {
    let label = 'Введен текст в элемент';
    params = params || this.getDefaultParams();
    return this.wh.waitClickable(h.getElem(element)).then(function() {
      return h.getElem(element).sendKeys(value).then(function() {
      });
    });
  },
  isPresent: function(element, params) {
    let label = 'Присутствие элемента';

    params = params || this.getDefaultParams();

    return h.getElem(element).isPresent().then(function(result) {
      return result;
    });
  },
  isDisplayed: function(element, params) {
    let label = 'Присутствие и отображение элемента';

    params = params || this.getDefaultParams();

    return h.getElem(element).isPresent().then(function(result) {
      if (result) {
        return h.getElem(element).isDisplayed();
      } else {
        return result;
      }
    });
  },
  clear: function(element, params) {
    let label = 'Очищен элемент';

    params = params || this.getDefaultParams();

    return this.wh.waitClickable(h.getElem(element)).then(function() {
      return h.getElem(element).sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a')).then(function() {
        return h.getElem(element).sendKeys(protractor.Key.DELETE).then(function() {
        // return h.getElem(element).clear().then(function() {
        });
      });
    });
  },
});

module.exports = Widget;