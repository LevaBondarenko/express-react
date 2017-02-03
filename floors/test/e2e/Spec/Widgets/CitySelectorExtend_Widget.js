var wh = Object.create(require("../Helpers/waitHelpers.js"));

module.exports = require("./Widget.js").extend({
  modalDialog: $('.modal-dialog'),
  closeBtn: $('.modal-dialog .etagi--closeBtn'),
  keyElement: $$('.cityselectorextend--wrapper'),
  button: $('.cityselectorextend--wrapper button'),
  label: $('.cityselectorextend--wrapper button'),
  cityName: $('.cityselectorextend--wrapper button span'),
  countries: $$('a[data-country]'),
  countryName: $('a[data-country]'),
  modalTitle: $('.modal-body > div > div:first-child'),
  modalCountryTitle: $$('.modal-body h3').first(),
  modalCityTitle: $$('.modal-body h3').last(),
  cityGroups: $$('.modal-body div[class*="gIu"] > div:not(.citySelector_nothingFound)'),
  cityGroupLetter: $('span[class]'),
  cities: $$('noindex a'),
  back: $('.modal-backdrop'),
  searchInput: $('#textSearch'),
  notFound: $('.citySelector_nothingFound'),

  /* Closed dialog */
  getCityName: function(){
    return this.getText(this.cityName);
  },
  getLabel: function(){
    return this.getText(this.label);
  },
  openDialog: function(){
    this.click(this.button);
    wh.waitClickable(this.closeBtn);
    wh.wait();
  },
  /* Opened dialog */
  backShowed: function(){
    return this.isPresent(this.back);
  },
  clickBack: function(){
    this.click(this.back);
  },
  dialogOpened: function(){
    return this.isPresent(this.closeBtn);
  },
  closeDialog: function(){
    this.click(this.closeBtn, 120000);
    wh.waitNotPresence(this.closeBtn);
  },
  getModalTitle: function(){
    return this.getText(this.modalTitle);
  },
  getModalCountryTitle: function(){
    return this.getText(this.modalCountryTitle);
  },
  getModalCityTitle: function(){
    return this.getText(this.modalCityTitle);
  },
  getNotFoundText: function(){
    return this.getText(this.notFound);
  },
  getSearchInputPlaceholder: function(){
    return this.getAttribute(this.searchInput, 'placeholder');
  },
  setSearchText: function(value){
    this.sendKeys(this.searchInput, value);
  },
  clearSearchText: function(){
    this.clear(this.searchInput);
  },
  /* Country */
  getCountries: function(){
    return this.countries;
  },
  getCountryName: function(index){
    return this.getText(this.countries.get(index));
  },
  selectCountry: function(index){
    this.click(this.countries.get(index));
  },
  getCountryClass: function(index){
    return this.getAttribute(this.countries.get(index), 'class');
  },
  /* Group */
  getCityGroups: function(){
    return this.cityGroups;
  },
  getCityGroupsCount: function(){
    return this.cityGroups.count();
  },
  getCityGroupLetter: function(index){
    return this.getText(this.cityGroups.get(index)
      .element(this.cityGroupLetter.locator()));
  },
  /* City */
  getCities: function(groupIndex){
    return this.cityGroups.get(groupIndex).$$('noindex a');
  },
  getCityNameList: function(groupIndex, cityIndex){
    return this.getText(this.getCities(groupIndex).get(cityIndex));
  },
  clickCity: function(groupIndex, cityIndex){
    this.click(this.getCities(groupIndex).get(cityIndex));
    wh.logCurrentPageUrl();
  },
  getCityClass: function(groupIndex, cityIndex){
    return this.getAttribute(this.getCities(groupIndex).get(cityIndex), 'class');
  }
});