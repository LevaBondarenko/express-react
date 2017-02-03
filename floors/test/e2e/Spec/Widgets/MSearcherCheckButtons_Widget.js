var Widget = require("./Widget.js");
var Helpers = require("../Helpers/helpers.js");
var h = Object.create(Helpers);

var MSearcherCheckButtonsWidget = Widget.extend({
  keyElement: $$('.msearcher--checkbuttons__item'),

  rooms1: $('input[data-field="rooms"][value="1"] + label'),
  rooms2: $('input[data-field="rooms"][value="2"] + label'),
  rooms3: $('input[data-field="rooms"][value="3"] + label'),
  rooms4: $('input[data-field="rooms"][value=">4"] + label'),

  rooms1Checked: $('input[data-field="rooms"][value="1"]:checked'),
  rooms2Checked: $('input[data-field="rooms"][value="2"]:checked'),
  rooms3Checked: $('input[data-field="rooms"][value="3"]:checked'),
  rooms4Checked: $('input[data-field="rooms"][value=">4"]:checked'),

  checkRooms: function(roomsCount){
    eval('this.rooms' + roomsCount).click();
    h.wait();
  },
  isRoomChecked: function(roomsCount){
    return eval('this.rooms' + roomsCount + 'Checked').isPresent();
  },
  activate: function(){
    this.checkRooms(1);
    this.checkRooms(1);
  }
});

module.exports = MSearcherCheckButtonsWidget;