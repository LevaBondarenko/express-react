var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var MSearcherCheckButtonsWidget = require("../../../Widgets/MSearcherCheckButtons_Widget.js");
var MSearcherCheckBoxWidget = require("../../../Widgets/MSearcherCheckBox_Widget.js");
var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var SearchFilterWidget = require("../../../Widgets/SearchFilter_Widget.js");

var checkButtons = Object.create(MSearcherCheckButtonsWidget);
var checkBox = Object.create(MSearcherCheckBoxWidget);
var layout = Object.create(SearchLayoutWidget);
// var filter = Object.create(SearchFilterWidget);

var SearchByRoomsSteps = function() {
  var allRooms = [1, 2, 3, 4];
  var roomLabels = ['Однокомнатная квартира','Двухкомнатная квартира','Трехкомнатная квартира','Многокомнатная квартира'];
  var pansLabels = ['Пансионат','Общежитие','Комната','Малосемейка'];

  isRoomSelected = function(rooms, index) {
    return rooms.indexOf(index) > -1;
  };

  getRoomLables = function(rooms, pans) {
    var resultRooms = rooms.reduce(function(res, i) {
      return res + roomLabels[--i] + ',';
    }, '');
    if (pans){
      var result = pansLabels.reduce(function(res, i) {
        return res + i + ',';
      }, resultRooms);
    } else {
      result = resultRooms;
    }
    return result;
  };

  this.select = function(params, page) {
    var rooms = params[0];
    var pans = params[1];
    h.wait();

    rooms.forEach(function(i) {
      checkButtons.checkRooms(i);
    });

    if (pans) {
      checkBox.toggle();
      expect(checkBox.isSelected()).toBe(true);
    }

    allRooms.forEach(function(i) {
      expect(checkButtons.isRoomChecked(i)).toBe(isRoomSelected(rooms, i));
    });
    return true;
  };

  this.verify = function(params, page) {
    var rooms = params[0];
    var pans = params[1];

    allRooms.forEach(function(i) {
      expect(checkButtons.isRoomChecked(i)).toBe(isRoomSelected(rooms, i));
    });

    /*if (rooms.length > 0 && !page === 'zastr') {
      expect(filter.isTypeChecked('flat')).toBe('true');
    }

    if (pans) {
      expect(filter.isTypeChecked('pansion')).toBe('true');
      expect(filter.isTypeChecked('room')).toBe('true');
      expect(filter.isTypeChecked('malosem')).toBe('true');
      expect(filter.isTypeChecked('obshaga')).toBe('true');
    }*/

    if (page === 'zastr') {
      layout.getZastrTableRooms().each(function(element, index) {
        element.getText().then(function (room) {
          if (room > 4) {
            expect(rooms.join(' ')).toContain(4);
          } else {
            expect(rooms.join(' ')).toContain(room);
          }
        });
      });
    } else {
      layout.getObjectHeaders().each(function(element, index) {
        element.getText().then(function (header) {
          expect(getRoomLables(rooms, pans).toUpperCase()).toContain(header);
        });
      });
    }
  };
};

module.exports = SearchByRoomsSteps;