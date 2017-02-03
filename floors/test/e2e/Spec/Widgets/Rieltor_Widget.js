var OrderWidget = require("./Order_Widget.js");

var RieltorWidget = OrderWidget.plain.extend({
  container: $$('.jk-person'),
  keyElement: $$('.jk-person'),
  newContainer: $('.rieltor2-block'),
  rieltorFIO: $('.person-name i'),
  phoneFormat: 2,
  widget: 'rieltor',
  name: 'Риэлтор',

  isV2: function() {
    return this.isPresent(this.newContainer);
  },
  v1: {
    getRieltorFIO: function() {
      return RieltorWidget.rieltorFIO.getText();
    }
  },
  v2: {
    photo: $('.jk-person .jk-avatar img'),
    rName: $$('.jk-person .person-name'),
    rPhone: $('.jk-person .jk-phone'),

    getPhoto: function() {
      return this.photo.getAttribute('src');
    },
    getName: function() {
      return this.rName.last().getText();
    },
    getPhone: function() {
      return RieltorWidget.rPhone.getText();
    }
  }
});

module.exports = RieltorWidget;

module.exports.object = RieltorWidget.extend({
  name: 'объект',
  insideObject: true,
  comment: ['objId', 'fio']
});

module.exports.zastr = RieltorWidget.extend({
  name: 'ЖК',
  insideNewNhObject: true,
  comment: ['nhId', 'nhName', 'fio']
});

module.exports.builder = RieltorWidget.extend({
  name: 'застройщик',
  insideBuilder: true,
  comment: ['builderName', 'fio']
});