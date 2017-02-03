/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
/* Widgets */
var switcher = Object.create(require("../../../Widgets/Switcher_Widget.js"));
var newhousesParameter = Object.create(require("../../../Widgets/NewhousesParameter_Widget.js"));
var fqTitle = Object.create(require("../../../Widgets/FilterQuarterTitle_Widget.js"));
var fq = Object.create(require("../../../Widgets/FilterQuarterNew_Widget.js"));
var order = Object.create(require("../../../Widgets/Order_Widget.js"));
var fi = Object.create(require("../../../Widgets/FilterQuarterFlatNew_Widget.js"));
var ms = Object.create(require("../../../Widgets/SuperMediaSlider_Widget.js"));
var bo = Object.create(require("../../../Widgets/BuilderObjects_Widget.js"));
var rt = Object.create(require("../../../Widgets/RieltorTab_Widget.js"));
var r2 = Object.create(require("../../../Widgets/Rieltor_Widget.js"));

var limit = browser.params.smoke
  ? browser.params.limitSmoke.nhFlats
  : browser.params.limit.nhFlats;
var limitOpen = browser.params.smoke
  ? browser.params.limitSmoke.nhFlatsOpen
  : browser.params.limit.nhFlatsOpen;

var legend = [];
legend['room1'] = {
  class: 'firstRoom',
  label: '1К'
};
legend['room2'] = {
  class: 'secondRoom',
  label: '2К'
};
legend['room3'] = {
  class: 'thirdRoom',
  label: '3К'
};
legend['room4+'] = {
  class: 'pluralRooms',
  label: '4К+'
};
legend['sold'] = {
  class: 'sold',
  label: 'Продано'
};
legend['dolshik'] = {
  class: 'dolshik',
  label: 'Квартира от дольщика'
};
legend['discount'] = {
  class: 'sale2',
  label: 'Квартира со скидкой'
};
legend['mismatch'] = {
  class: '',
  label: 'Не соответствуют поиску'
};
legend['reserved'] = {
  class: '',
  label: 'Квартира забронирована'
};

module.exports = require("../../../Common/Element.js").extend({
  verifyRieltor: function() {
    browser.manage().getCookie("titleLayout").then(function(titleLayout) {
      var msg = titleLayout.value;
      rt.getRieltorsCount().then(function(count) {
        if (count > 0) {
          expect(count === 2 || count === 3).toBe(true, msg
            + ', должно быть 2 или 3 риэлтора в списке');
          expect(rt.getLabel())
           .toBe('Чтобы выбрать специалиста кликните по фотографии', msg
            + ', подпись под списком риэлторов');
          rt.getRieltors().each(function(elem, index) {
            rt.clickRieltor(index);
            rt.getPhoto(index).then(function(photo) {
              r.v2.getPhoto().then(function(photo2) {
                expect(photo2.replace('photos', 'profile')).toBe(photo, msg
                  + ', в виджете Риэлтор2 отображается выбранный риэлтор');
              });
              fq.flats.isDolshikActive().then(function(result) {
                if (result) {
                  fq.flats.getNotDolshikFlatsCount().then(function(count2) {
                    if (count2 > 0) {
                      fq.flats.clickAnyNotDolshikFlat();
                    };
                  });
                }
              });
              fq.flats.isDolshikActive().then(function(result) {
                if (!result) {
                  h.wait();
                  fi.popup.show();
                  h.wait();
                  fi.popup.getRieltorPhoto().then(function(photoFi) {
                    expect(photoFi.replace('photos', 'profile')).toBe(photo, msg
                      + ', в модальном окне отображается выбранный риэлтор');
                  });
                  fi.popup.hide();
                  h.wait();
                }
              });
            });
          });
        }
      });
      expect(r.v2.getName()).toMatch(".*", msg + ', имя риэлтора не пустое');
      expect(r.v2.getPhone()).toMatch(".*", msg + ', телефон риэлтора не пустой');
      expect(r.v2.getPhoto()).toMatch(".*", msg + ', фото риэлтора не пустое');
    });
  },
  verifyLayout: function(index) {

  }
});