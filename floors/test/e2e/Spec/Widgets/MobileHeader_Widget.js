var Header = require("./Widget.js").extend({
  logo: $('.mobileheader--wrapper img[src]'),
  logoLink: $('.mobileheader--wrapper a'),
  close: $('.mobileheader--wrapper > div > div:first-child > div:last-child > span:last-child'),
  modal: $('.mobile-modal:not([data-condition])'),

  hasLogo: function() {
    return Header.isPresent(this.logoLink);
  },
  clickLogo: function() {
    return Header.click(this.logo);
  },
  closeDialog: function() {
    return Header.click(this.close);
  },
  hasDialog: function() {
    return Header.isDisplayed(this.modal);
  },

  menu: {
    btn: $('.mobileheader--wrapper span[data-module="mainmenu"]'),
    items: $$('.mobile-modal:not([data-condition]) > div:nth-child(2) > div'),
    city: $('.mobile-modal:not([data-condition]) > div:first-child i + span'),
    address: $('.mobile-modal:not([data-condition]) > div:first-child > div:last-child'),
    citySelect: $('.mobile-modal:not([data-condition]) > div:nth-child(2) div[data-action="cityList"]'),
    currencySelect: $('.mobile-modal:not([data-condition]) > div:nth-child(2) select[data-action="currencyChange"]'),
    toFullVersion: $('.mobile-modal:not([data-condition]) > div:last-child'),

    toggle: function() {
      return Header.click(this.btn);
    },
    getItems: function() {
      return this.items;
    },
    getItemText: function(index) {
      return Header.getText(this.items.get(index).$$('div').first());
    },
    clickItem: function(index) {
      return Header.click(this.items.get(index));
    },
    /*getSubItemText: function(index, subIndex) {
      return Header.getText(this.items.get(index).$('div:').$$('div').get(subIndex));
    },
    clickSubItem: function(index, subIndex) {
      return Header.click(this.items.get(index).$$('div').last().$$('div').get(subIndex));
    },*/
    clickCity: function() {
      return Header.click(this.city);
    },
    getCity: function() {
      return Header.getText(this.city);
    },
    getAddress: function() {
      return Header.getText(this.address);
    },
    getCitySelectText: function() {
      return Header.getText(this.citySelect);
    },
    clickCitySelect: function() {
      return Header.click(this.citySelect);
    },
    hasCurrencySelect: function() {
      return Header.isPresent(this.currencySelect);
    },
    openFullVersion: function() {
      return Header.click(this.toFullVersion);
    },
    isShown: function() {
      return Header.isPresent(this.city);
    }
  },

  lk: {
    favorites: $('.mobileheader--wrapper a[href="/my/#/favorites/"]'),
    lk: $('.mobileheader--wrapper span[data-module="lk"]'),

    hasFavorites: function() {
      return Header.isPresent(this.favorites);
    },
    hasAuth: function() {
      return Header.isPresent(this.lk);
    }
  },

  cityList: {
    btn: $('.mobileheader--wrapper span[data-module="cityList"]'),
    label: $('.mobile-modal:not([data-condition]) > div:first-child'),
    countriesList: $('.mobile-modal:not([data-condition]) select[data-field="selectedCountry"]'),
    cities: $$('.mobile-modal:not([data-condition]) a[data-action="cityChange"]'),
    searchField: $('.mobile-modal:not([data-condition]) input[data-field="filter"]'),
    notFoundLabel: $('.mobile-modal:not([data-condition]) > div:nth-child(4)'),

    toggle: function() {
      return Header.click(this.btn);
    },
    getLabel: function() {
      return Header.getText(this.label);
    },
    getNotFoundLabel: function() {
      return Header.getText(this.notFoundLabel);
    },
    getCountry: function() {
      return Header.getText(this.countriesList);
    },
    getCountryName: function(index) {
      return Header.getText(this.countriesList.$$('option').get(index));
    },
    getCountryId: function(index) {
      return Header.getAttribute(this.countriesList.$$('option').get(index), "value");
    },
    getCountries: function() {
      return this.countriesList.$$('option');
    },
    clickCountry: function(index) {
      return Header.click(this.countriesList.$$('option').get(index));
    },
    clickCounties: function() {
      return Header.click(this.countriesList);
    },
    getCities: function() {
      return this.cities;
    },
    getCitiesCount: function() {
      return this.cities.count();
    },
    getCityName: function(index) {
      return Header.getText(this.cities.get(index));
    },
    getCityId: function(index) {
      return Header.getAttribute(this.cities.get(index), "data-value");
    },
    enterSearchText: function(text) {
      return Header.sendKeys(this.searchField, text);
    },
    clearSearchField: function() {
      return Header.clear(this.searchField);
    },
    isShown: function() {
      return Header.isPresent(this.countriesList);
    },
    getCountriesDisabled: function() {
      return Header.getAttribute(this.countriesList, 'disabled');
    }
  },

  geoLocation: {
    label: $('.mobileheader--wrapper > div > div:first-child > div > div:nth-child(2)'),
    acceptCityBtn: $('a[data-action="geoAccept"]'),
    declineCityBtn: $('a[data-action="geoDecline"]'),
    closeBtn: $('span[data-action="geoCancel"]'),

    acceptCity: function(index) {
      return Header.click(this.acceptCityBtn);
    },
    declineCity: function(index) {
      return Header.click(this.declineCityBtn);
    },
    close: function(index) {
      return Header.click(this.closeBtn);
    },
    isShown: function(index) {
      return Header.isPresent(this.acceptCityBtn);
    },
    getLabel: function(index) {
      Header.wh.waitTextPresence(this.label, 'в');
      return Header.getText(this.label);
    }
  }
});


module.exports = Header;