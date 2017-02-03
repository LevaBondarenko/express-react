var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var searchLayout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var flatTitle = Object.create(require("../../../Widgets/FlatTitle_Widget.js"));
var flatInfo = Object.create(require("../../../Widgets/FlatInfo_Widget.js"));
var newhousesParameter = Object.create(require("../../../Widgets/NewhousesParameter_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  get: function(index) {
    searchLayout.getObjectTitle(searchLayout.getObject(index)).then(function(title) {
      browser.manage().addCookie("titleLayout", title);
      searchLayout.getObjectLink(index).then(function(link) {
        browser.params.loggedValue = title + ' ' + link;
        h.setErrorMsg(1, link);
      });
    });
  },
  verify: function() {
    h.setErrorMsg(4, 'Заголовок объекта');
    browser.manage().getCookie("titleLayout").then(function(titleLayout) {
      flatTitle.getTitle().then(function(title) {
        expect(title.toUpperCase()).toBe(titleLayout.value.toUpperCase(),
          h.getErrorMsg('заголовок в выдаче и на странице объекта должен совпадать'));
      });
    });
  },
  verifyZastr: function() {
    h.setErrorMsg(4, 'Заголовок новостройки');
    browser.manage().getCookie("titleLayout").then(function(titleLayout) {
      newhousesParameter.title.get().then(function(title) {
        expect(title.toUpperCase()).toBe(titleLayout.value.toUpperCase(),
          h.getErrorMsg('заголовок в выдаче и на странице новостройки должен совпадать'));
      });
    });
  },
  verifyRooms: function() {
    h.setErrorMsg(4, 'Количество комнат в квартире');
    browser.manage().getCookie("titleLayout").then(function(titleLayout) {
      var roomsLayout = 0;
      switch (titleLayout.value) {
        case 'ОДНОКОМНАТНАЯ КВАРТИРА':
          roomsLayout = 1;
          break;
        case 'ДВУХКОМНАТНАЯ КВАРТИРА':
          roomsLayout = 2;
          break;
        case 'ТРЕХКОМНАТНАЯ КВАРТИРА':
          roomsLayout = 3;
          break;
        case 'МНОГОКОМНАТНАЯ КВАРТИРА':
          roomsLayout = 4;
          break;
        default:
          roomsLayout = 0;
          break;
      }
      flatInfo.getRooms().then(function(rooms) {
        if (roomsLayout > 0 && roomsLayout < 4) {
          expect(rooms).toBe(roomsLayout + '-к',
            h.getErrorMsg('Количество комнат в списке параметров должно ' +
            'совпадать с количеством комнат в заголовке объекта (1-3 комн.)'));
        } else if (roomsLayout === 4) {
          expect(parseInt(rooms.split('-к')[0])).toBeGreaterThan(3,
            h.getErrorMsg('Количество комнат в списке параметров должно ' +
            'быть 4 и больше (мнокомнатные квартиры)'));
        }
      });
    });
  }
});