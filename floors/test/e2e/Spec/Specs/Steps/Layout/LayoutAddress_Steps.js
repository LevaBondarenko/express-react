var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var searchLayout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var flatTitle = Object.create(require("../../../Widgets/FlatTitle_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  get: function(index){
    searchLayout.getObjectAddress(searchLayout.getObject(index)).then(function(address){
      browser.manage().addCookie("addressLayout", address);
    });
  },
  verify: function(){
    h.setErrorMsg(4, 'Адрес объекта');
    browser.manage().getCookie("addressLayout").then(function(addressLayout){
      flatTitle.getAddress().then(function(address){
        expect(address).toContain(addressLayout.value,
          h.getErrorMsg('адрес в выдаче и на странице объекта должен совпадать'));
      });
    });
  }
});