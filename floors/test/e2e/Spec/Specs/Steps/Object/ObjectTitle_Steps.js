var Element = require("../../../Common/Element.js");
/* Widgets */
var flatTitle = Object.create(require("../../../Widgets/FlatTitle_Widget.js"));

module.exports = Element.extend({
  verify: function(){
    expect(flatTitle.getTitle()).not.toBe("");
    expect(flatTitle.getAddress()).not.toBe("");
    expect(flatTitle.hasAddressIcon()).toBe(true);
    expect(flatTitle.hasFavorite()).toBe(true);
    expect(flatTitle.hasCompare()).toBe(true);
    expect(flatTitle.hasAuction()).toBe(true);
  }
});