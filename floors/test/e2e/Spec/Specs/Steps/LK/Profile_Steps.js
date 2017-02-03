var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var authPanel = Object.create(require("../../../Widgets/AuthPanel2_Widget.js"));
var lkBody = Object.create(require("../../../Widgets/LKBody_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  openProfile: function(){
    authPanel.openMenuProfileItem();
  },
  setName: function(name){
    h.wait(2);
    lkBody.setProfileName(name);
    lkBody.savePersonalData();
    h.wait(2);
  },
  getName: function(){
    return lkBody.getProfileName();
  }
});