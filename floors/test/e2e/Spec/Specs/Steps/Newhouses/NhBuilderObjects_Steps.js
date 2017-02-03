/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
/* Widgets */
var bo = Object.create(require("../../../Widgets/BuilderObjects_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  verify: function() {
    h.setErrorMsg(4, 'Объекты застройщика');
    bo.objects.get().each(function(obj, index) {
      bo.objects.click(index);
      bo.objects.getName(index).then(function(nameList) {
        bo.active.getName().then(function(nameActive) {
          expect(nameList).toContain(nameActive,
            h.getErrorMsg('название ГП в списке и выбранном объекте должно совпадать'));
        });
      });
      bo.objects.getFlatsCount(index).then(function(countList) {
        bo.active.getCounts().reduce(function(acc, elem) {
          return elem.getText().then(function(text) {
            return acc + parseInt(text);
          });
        }, 0).then(function(countActive) {
          expect(countList).toContain(countActive,
            h.getErrorMsg('количество квартир в списке должно совпадать с суммарным количеством квартир в таблице'));
        });
      });
      bo.active.getDescription(index).then(function(desc) {
        expect(desc)
          .toMatch("(Район: .+\n|)(Срок сдачи [1-4]{1} кв. [0-9]{4}|Дом сдан)",
            h.getErrorMsg('описание дома содержать район и срок сдачи, или только срок сдачи'));
      });
      expect(bo.active.getHeaders(0)).toBe('Комнаты',
        h.getErrorMsg('Заголовок таблицы должен содержать Комнаты'));
      expect(bo.active.getHeaders(1)).toBe('Площадь (м2)',
        h.getErrorMsg('Заголовок таблицы должен содержать Площадь'));
      expect(bo.active.getHeaders(3)).toBe('Квартир в наличии',
        h.getErrorMsg('Заголовок таблицы должен содержать Квартиры в наличии'));
      h.getCurrency();
      browser.manage().getCookie("E2E_currency")
        .then(function(currency) {
          expect(bo.active.getHeaders(2)).toBe('Цена (' + currency.value + ')',
            h.getErrorMsg('Заголовок таблицы должен содержать Цену с выбранной валютой'));
        });
    });
  }
});