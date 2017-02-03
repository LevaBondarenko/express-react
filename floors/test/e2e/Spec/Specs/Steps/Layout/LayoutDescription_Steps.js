var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var searchLayout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var flatDescription = Object.create(require("../../../Widgets/FlatDescription_Widget.js"));
var flatInfo = Object.create(require("../../../Widgets/FlatInfo_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  get: function(index) {
    searchLayout.hasObjectDescription(searchLayout.getObject(index))
      .then(function(hasDescription) {
        if (hasDescription) {
          searchLayout.getObjectDescription(searchLayout.getObject(index))
            .then(function(description) {
              browser.manage().addCookie("descriptionLayout", description);
            });
        } else {
          browser.manage().addCookie("descriptionLayout", "");
        }
      });
  },
  verify: function() {
    h.setErrorMsg(4, 'Описание объекта');
    browser.manage().getCookie("descriptionLayout")
      .then(function(descriptionLayout) {
        flatDescription.getDescription().then(function(description) {
          flatInfo.getObjectID().then(function(ID) {
            if (!descriptionLayout.value) {
              expect(description).toBe('',
                h.getErrorMsg('описание объекта в выдаче и в объекте должно совпадать (описание отсутствует)'));
            } else {
              expect(description.split("\n").join(" "))
                .toContain(descriptionLayout.value,
                  h.getErrorMsg('описание объекта в выдаче и в объекте должно совпадать'));
            }
          });
        });
      });
  }
});