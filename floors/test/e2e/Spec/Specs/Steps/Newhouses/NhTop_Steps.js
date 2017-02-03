/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
/* Widgets */
var newhousesParameter = Object.create(require("../../../Widgets/NewhousesParameter_Widget.js"));
var order = Object.create(require("../../../Widgets/Order_Widget.js"));
var switcher = Object.create(require("../../../Widgets/Switcher_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  verify: function() {
    h.setErrorMsg(4, 'Шапка новостройки');
    expect(switcher.getButtonsCount()).toBeGreaterThan(0,
      h.getErrorMsg('В переключателе должна быть хотя бы одна кнопка'));
    switcher.getButtons().each(function(elem, index) {
      switcher.isButtonDisplayed(index).then(function(result) {
        if (result) {
          switcher.clickButton(index);
          switcher.getButtonText(index).then(function(text) {
            expect('Описание Характеристики Акции')
              .toContain(text,
                h.getErrorMsg('Заголовок закладки №' + (index + 1)));
            expect(newhousesParameter.switcher.get())
              .toMatch(".+", h.getErrorMsg('значение параметра не пустое'));
          });
        }
      });
    });
    newhousesParameter.readyPercent.displayed().then(function(result) {
      if (result) {
        expect(newhousesParameter.readyPercent.get())
          .toMatch("[0-9]{1,2}%", h.getErrorMsg('Формат процента говтовности'));
      }
    });

    order.newNHTop.displayed().then(function(result) {
      expect(result).toBe(true,
        h.getErrorMsg('должна быть форма заявки в шапке'));
    });

    order.newNHBottom.displayed().then(function(result) {
      expect(result).toBe(true,
        h.getErrorMsg('должна быть форма заявки под шахматкой'));
    });

    newhousesParameter.plainParams.getCount().then(function(result) {
      if (result === 4) {
        newhousesParameter.plainParams.get(0).then(function(deadline) {
          browser.manage().addCookie("E2E_nh_deadline", deadline);
          expect(deadline).toMatch("[1-4]{1} кв. [0-9]{4} г.",
              h.getErrorMsg('Формат срока сдачи'));
        });
      } else {
        newhousesParameter.deadline.get().then(function(deadline) {
          browser.manage().addCookie("E2E_nh_deadline", deadline);
          expect(deadline).toBe("Дом сдан",
            h.getErrorMsg('Формат срока сдачи, если дом сдан'));
        });
      }
    });
  },
});