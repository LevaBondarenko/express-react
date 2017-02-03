var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var searchLayout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var flatInfo = Object.create(require("../../../Widgets/FlatInfo_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  get: function(index) {
    searchLayout.getObjectLink(index).then(function(link) {
      browser.manage().addCookie("codeLayout", link.split("/")[2]);
    });
  },
  verify: function() {
    h.setErrorMsg(4, 'Код объекта');
    browser.manage().getCookie("codeLayout").then(function(codeLayout) {
      flatInfo.getObjectID().then(function(code) {
        expect(code).toBe(codeLayout.value,
          h.getErrorMsg('код объекта в выдаче и на странице объекта должен совпадать'));
      });
    });
  }
});