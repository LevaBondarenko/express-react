/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
/* Widgets */
var fq = Object.create(require("../../../Widgets/FilterQuarterNew_Widget.js"));
var fi = Object.create(require("../../../Widgets/FilterQuarterFlatNew_Widget.js"));
var rt = Object.create(require("../../../Widgets/RieltorTab_Widget.js"));
var r = Object.create(require("../../../Widgets/Rieltor_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  verify: function() {
    h.setErrorMsg(4, 'Риэлторы');
    rt.getRieltorsCount().then(function(count) {
      if (count > 0) {
        expect(count === 2 || count === 3).toBe(true,
          h.getErrorMsg('должно быть 2 или 3 риэлтора в списке'));
        expect(rt.getLabel())
          .toBe('Чтобы выбрать специалиста кликните по фотографии',
            h.getErrorMsg('подпись под списком риэлторов'));
        rt.getRieltors().each(function(elem, index) {
          rt.clickRieltor(index);
          rt.getPhoto(index).then(function(photo) {
            r.v2.getPhoto().then(function(photo2) {
              expect(photo2.replace('photos', 'profile')).toBe(photo,
                h.getErrorMsg('в виджете Риэлтор2 отображается выбранный риэлтор'));
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
                  expect(photoFi.replace('photos', 'profile')).toBe(photo,
                    h.getErrorMsg('в модальном окне отображается выбранный риэлтор'));
                });
                fi.popup.hide();
                h.wait();
              }
            });
          });
        });
      }
    });
    expect(r.v2.getName()).toMatch(".*", h.getErrorMsg('имя риэлтора не пустое'));
    expect(r.v2.getPhone()).toMatch(".*", h.getErrorMsg('телефон риэлтора не пустой'));
    expect(r.v2.getPhoto()).toMatch(".*", h.getErrorMsg('фото риэлтора не пустое'));
  }
});