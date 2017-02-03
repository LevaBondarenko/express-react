var ph = Object.create(require("../Helpers/pageHelpers.js"));
var header = Object.create(require("../Widgets/MobileHeader_Widget.js"));

var MVSPage = require("./Page.js").extend({
  get: function(dontAcceptCity) {
    var path = ph.getFullDomain('m') + '/'
      + (this.url === '/' ? '' : this.url + '/');
    browser.get(path);
    ph.logCurrentPageUrl();
    if (!dontAcceptCity) {
      header.geoLocation.isShown().then(function(has) {
        if (has) {
          header.geoLocation.acceptCity();
        }
      });
    }
  },
});

module.exports.main = MVSPage.extend({
  name: 'Главная',
  url: '/'
});

module.exports.realtySearch = MVSPage.extend({
  name: 'Выдача вторичной',
  url: 'realty/search'
});
