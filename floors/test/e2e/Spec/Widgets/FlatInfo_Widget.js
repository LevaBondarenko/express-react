var Widget = require("./Widget.js");

var waitHelpers = require("../Helpers/waitHelpers.js");
var wh = Object.create(waitHelpers);

var FlatInfoWidget = Widget.extend({
  objID: $('.object_code .object_params_value'),
  rieltorFIO: $('.jk-person .person-name i'),
  rooms: $('.object_mainParam_text__rooms'),
  price: $('.object_newPrice_sum'),
  oldPrice: $('.object_oldPrice'),
  discount: $('.object_economy_value'),
  priceM2: $('.object_price_m2_value'),
  params: $('table.object_params'),
  paramsValues: $$('.object_params_value'),

  getObjectID: function(){
    return this.objID.getText();
  },

  getRieltorFIO: function(){
    return this.rieltorFIO.getText();
  },

  getRooms: function(){
    return this.rooms.getText();
  },

  getPrice: function(){
    wh.waitPresence(this.price);
    return this.price.getText();
  },

  getOldPrice: function(){
    return this.oldPrice.getText();
  },

  getDiscount: function(){
    return this.discount.getText();
  },

  getPriceM2: function(){
    return this.priceM2.getText();
  },

  getParams: function(){
    return this.params.getText();
  },

  getParamsValues: function(){
    return this.paramsValues.getText();
  }
});

module.exports = FlatInfoWidget;