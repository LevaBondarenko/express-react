var Helpers = require("./helpers.js");
var citySelector = Object.create(require("../Widgets/CitySelectorExtend_Widget.js"));

var PageHelpers = Helpers.extend({
  closeCitySelectDialog: function(city) {
    browser.manage().getCookie("selected_city").then(function(selectedCity) {
      if (selectedCity) {
        expect(citySelector.dialogOpened()).toBe(false);
      } else {
        citySelector.closeDialog();
        if (city) {
          browser.manage().getCookie("selected_city").then(function(newSelectedCity) {
            expect(newSelectedCity.value).toBe(city);
          });
        }
      }
    });
  },

  getProtocol: function() {
    return browser.params.domain === 'dev' ? 'http' : 'https';
  },

  getFullDomain: function(city) {
    return this.getProtocol() + '://' + city + '.etagi.' + browser.params.domain;
  },

  getCityParams: function(city) {
    return browser.params.allCities[city];
  },

  getCityParamsById: function(id) {
    return browser.params.allCitiesID[id];
  }
});

module.exports = PageHelpers;