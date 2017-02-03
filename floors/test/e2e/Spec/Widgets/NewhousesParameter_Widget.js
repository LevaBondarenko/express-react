var NewhousesParameter = require("./Widget.js").extend({
  get: function() {
    return this.value.getText();
  }
});

module.exports.title = NewhousesParameter.extend({
  value: $('h1.parameterTitle'),

  get: function() {
    return this.value.getInnerHtml();
  }
});
module.exports.switcher = NewhousesParameter.extend({
  value: $('.parameterNewhouses-white .newhousesparameter-wrapper > div:not(.hide)')
});
module.exports.readyPercent = NewhousesParameter.extend({
  value: $('.parameterRating-text'),
  keyElement: $$('.parameterRating-wrapper')
});
module.exports.deadline = NewhousesParameter.extend({
  value: $('.newhousesparameter-wrapper:not(.w50) + .newhousesparameter-wrapper.w50')
});
module.exports.plainParams = NewhousesParameter.extend({
  values: $$('.newhousesparameter-wrapper.w50 > div > p > span'),

  getAll: function() {
    return this.values;
  },
  get: function(index) {
    return this.values.get(index).getText();
  },
  getCount: function() {
    return this.values.count();
  }
});