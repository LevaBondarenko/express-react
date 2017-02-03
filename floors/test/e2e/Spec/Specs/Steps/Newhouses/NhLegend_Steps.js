/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
/* Widgets */
var fq = Object.create(require("../../../Widgets/FilterQuarterNew_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  getLegend: function() {
    var legend = [];
    legend['1К'] = {
      class: 'firstRoom'
    };
    legend['2К'] = {
      class: 'secondRoom'
    };
    legend['3К'] = {
      class: 'thirdRoom'
    };
    legend['4К+'] = {
      class: 'pluralRooms'
    };
    legend['Продано'] = {
      class: 'sold'
    };
    legend['Квартира от дольщика'] = {
      class: 'dolshik'
    };
    legend['Квартира со скидкой'] = {
      class: 'sale2'
    };
    legend['Не соответствуют поиску'] = {
      class: ''
    };
    legend['Квартира забронирована'] = {
      class: ''
    };
    return legend;
  },
  verify: function() {
    h.setErrorMsg(4, 'Легенда шахматки');
    var legend = this.getLegend();
    fq.legend.get().each(function(item, index) {
      fq.legend.getText(index).then(function(text) {
        var legendItem = legend[text];
        if (legendItem.class) {
          expect(fq.legend.hasFlats(legendItem.class)).toBe(true,
            h.getErrorMsg('В шахматке должна быть хотя бы 1 квартира для данного элемента легенды'));
        }
      });
    });
  },
});