var Element = require("../../../Common/Element.js");
var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var searchLayout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var flatInfo = Object.create(require("../../../Widgets/FlatInfo_Widget.js"));

module.exports = Element.extend({
  get: function(index) {
    searchLayout.getObjectPrice(searchLayout.getObject(index)).then(function(price) {
      browser.manage().addCookie("priceLayout", price);
    });
  },
  verify: function() {
    h.setErrorMsg(4, 'Цена объекта');
    browser.manage().getCookie("priceLayout").then(function(priceLayout) {
      flatInfo.getPrice().then(function(price) {
        expect(price).toBe(priceLayout.value,
          h.getErrorMsg('цена в выдаче и на странице объекта должна совпадать'));
      });
    });
  }
});