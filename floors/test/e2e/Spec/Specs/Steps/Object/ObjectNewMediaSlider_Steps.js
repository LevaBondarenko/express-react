/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
/* Widgets */
var ms = Object.create(require("../../../Widgets/SuperMediaSlider_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  verify: function() {
    ms.tabs.get().each(function(tab, index) {
    h.setErrorMsg(4, 'Супермедиаслайдер, закладка № ' + (index + 1));
      ms.tabs.getType(index).then(function(type) {
        ms.tabs.click(index);
        ms.tabs.getText(index).then(function(label) {
          expect(label).toContain(ms.tabs.getLabelByType(type),
            h.getErrorMsg('Название закладки'));
          ms.modal.open();
          h.wait(2);
          expect(ms.modal.getText(index))
            .toBe(label, h.getErrorMsg('на весь экран, название закладки'));
          ms.modal.close();
        });
        expect(ms.modal.getBtnText()).toBe('НА ВЕСЬ ЭКРАН',
          h.getErrorMsg('название кнопки'));
        switch (type) {
          case 'photos':
          case 'tours':
          case 'building':
          case 'layouts':
            ms.tabs.getText(index).then(function(label) {
              var countTab = label.split('(')[1].split(')')[0];
              var countTabAll = countTab.indexOf('из') > -1 ? countTab.split(' ')[2] : countTab;
              var countTabShown = countTab.indexOf('из') > -1 ? countTab.split(' ')[0] : countTab;
              ms.slides.getThumbsCount().then(function(countThumbs) {
                var verifyNavigation = function(direction, type,
                  expectedSlide, cl) {
                  if (direction) {
                    ms.slides.navigate(direction, type);
                    h.wait();
                  } else if (cl) {
                    ms.slides.clickThumb(type);
                    h.wait();
                  }
                  var expectedText = '';
                  if (expectedSlide) {
                    expectedText = expectedSlide + ' / ' + countTabShown;
                  }
                  ms.slides.getCounter().then(function(text) {
                    expect(text).toBe(expectedText,
                      h.getErrorMsg('Навигация (текущий слайд): ' + label));
                  });
                };


                if (type !== 'tours') {
                  if (countTabShown !== '1') {
                    expect(countThumbs).toBe(parseInt(countTabShown),
                    h.getErrorMsg('Количество миниатюр должно совпадать с количествои элементов в заголовке закладки: ' + label));
                    verifyNavigation(null, null, 1);
                    verifyNavigation('next', 0, 2);
                    verifyNavigation('prev', 0, 1);
                    verifyNavigation('prev', 1, countTabShown);
                    verifyNavigation('next', 1, 1);
                    verifyNavigation(null, 1, 2, 1);
                    verifyNavigation(null, 0, 1, 1);
                  } else {
                    (type !== 'building') && expect(countThumbs)
                      .toBe(0, h.getErrorMsg('Не должно быть миниатюр (1 элемент в заголовке закладки): '
                      + type));
                    verifyNavigation(null, null, '');
                  }
                }
              });

            });
            break;
          case 'infrastructure':
            h.wait();
            expect(ms.slides.hasMap())
              .toBe(true, h.getErrorMsg('Должна быть карта инфраструктуры'));
            break;
          case 'district':
            h.wait();
            expect(ms.slides.hasDistricts())
              .toBe(true, h.getErrorMsg('Должен быть вид района'));
            break;
          case 'layout3d':
            h.wait();
            expect(ms.slides.has3DPlan())
              .toBe(true, h.getErrorMsg('Должна быть 3D планировка'));
            break;
        }
      });
    });
  },
});