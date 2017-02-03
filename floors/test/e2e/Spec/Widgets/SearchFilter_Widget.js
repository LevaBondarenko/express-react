var Widget = require("./Widget.js");

var SearchFilterWidget = Widget.extend({
  flatChecked: $('input[type="checkbox"][value="flat"]'),
  pansionChecked: $('input[type="checkbox"][value="pansion"]'),
  roomChecked: $('input[type="checkbox"][value="room"]'),
  malosemChecked: $('input[type="checkbox"][value="malosem"]'),
  obshagaChecked: $('input[type="checkbox"][value="obshaga"]'),
  builder: $('input[type="checkbox"]#type--builder + label i'),
  widget: $('.search--result__filter'),
  keyElement: $$('.search--result__filter'),

  isTypeChecked: function(type) {
    return eval('this.' + type + 'Checked').getAttribute('checked');
  },
  clickBuilder: function() {
    this.wh.waitClickable(this.builder);
    this.builder.click();
    this.wh.wait(2);
  },
  present: function() {
    return this.isPresent(this.widget);
  }
});

module.exports = SearchFilterWidget;