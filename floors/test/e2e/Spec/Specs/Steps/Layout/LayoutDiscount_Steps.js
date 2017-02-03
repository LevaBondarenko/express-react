var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var searchLayout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var flatInfo = Object.create(require("../../../Widgets/FlatInfo_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  get: function(index) {
    searchLayout.hasDiscount(searchLayout.getObject(index)).then(function(result) {
      if (result) {
        browser.manage().addCookie("discountLayout", 'true');
        searchLayout.getObjectOldPrice(searchLayout.getObject(index)).then(function(oldPrice) {
          browser.manage().addCookie("oldPriceLayout", oldPrice);
        });
      } else {
        browser.manage().addCookie("discountLayout", 'false');
      }
    });
  },
  verify: function() {
    h.setErrorMsg(4, 'Скидка объекта');
    browser.manage().getCookie("discountLayout").then(function(discountLayout) {
      if (discountLayout.value === 'true') {
        browser.manage().getCookie("oldPriceLayout").then(function(oldPriceLayout) {
          flatInfo.getOldPrice().then(function(oldPrice) {
            expect(oldPrice).toBe(oldPriceLayout.value,
              h.getErrorMsg('Скидка в выдаче и на странице объекта должна совпадать'));
          })
        });
      }
    });
  }
});