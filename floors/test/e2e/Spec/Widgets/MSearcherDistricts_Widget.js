var Widget = require("./Widget.js");
var Helpers = require("../Helpers/helpers.js");
var h = Object.create(Helpers);

var MSearcherDistrictsWidget = Widget.extend({
  keyElement: $$('button[data-field="districts"]'),
  openDialogBtn: $('button[data-field="districts"]'),
  districtsTab: element(by.xpath('//ul[@class="nav nav-tabs"]/li[1]/a')),
  streetsTab: element(by.xpath('//ul[@class="nav nav-tabs"]/li[2]/a')),
  selectBtn: $$('.modal-dialog button.btn-abs-modal'),
  selectClearAll: $$('.modal-dialog a.etagi--clearBtn'),
  closeBtn: $('.modal-dialog button.etagi--closeBtn'),
  searchInput: $$('.modal-dialog .searchform--input__form input'),
  districts: $$('.modal-dialog span[data-type="district_id"][title]'),
  streets: $$('.modal-dialog span[data-type="street_id"][title="Нажмите для добавления улицы в фильтр"]'),
  selectedDistricts: $$('.modal-dialog span[data-type="district_id"][title].activeItem'),
  selectedStreets: $$('.modal-dialog span[data-type="street_id"][title].activeItem'),
  selectedDistrictsCounter: $('.modal-dialog .tabbedBadge'),
  selectedStreetsCounter: $('.modal-dialog .tabbedBadge'),
  disabledStreets: $$('.modal-dialog span[data-type="street_id"][title].disabledItem'),
  deselectBtnDictrict: $$('.modal-dialog span[data-type="district_id"].item-closeBtn'),
  deselectBtnStreet: $$('.modal-dialog span[data-type="street_id"].item-closeBtn'),
  deselectBtnTopDictrict: $$('.modal-dialog button[data-type="district_id"].close span'),
  deselectBtnTopStreet: $$('.modal-dialog button[data-type="street_id"].close span'),

  activate: function() {
    this.openDialog();
    this.openStreetsTab();
    this.openDistrictsTab();
    this.closeDialog();
  },

  openDialog: function() {
    return this.click(this.openDialogBtn);
  },

  openDistrictsTab: function() {
    return this.click(this.districtsTab);
  },

  openStreetsTab: function() {
    return this.click(this.streetsTab);
  },

  select: function() {
    return this.click(this.selectBtn.get(0));
  },

  closeDialog: function() {
    return this.click(this.closeBtn);
  },

  selectAll: function() {
    return this.click(this.selectClearAll.get(0));
  },

  clearAll: function() {
    return this.click(this.selectClearAll.get(1));
  },

  searchDistricts: function(text) {
    this.searchInput.get(0).sendKeys(text);
  },

  searchStreets: function(text) {
    this.searchInput.get(1).sendKeys(text);
  },

  clickDictrict: function(index) {
    return this.click(this.districts.get(index));
  },
  getDictrictDataTypes: function(count) {
    // return this.getAttribute(this.districts.get(index), "data-type");
    this.openDistrictsTab();
    return this.districts.filter(function(elem, index) {
      return index < count;
    }).map(function(elem, index) {
      return elem.getAttribute("data-type");
    });
  },
  getDictrictValues: function(count) {
    // return this.getAttribute(this.districts.get(index), "data-value");
    this.openDistrictsTab();
    return this.districts.filter(function(elem, index) {
      return index < count;
    }).map(function(elem, index) {
      return elem.getAttribute("data-value");
    });
  },
  getStreetDataTypes: function(count) {
    return this.streets.filter(function(elem, index) {
      return index < count;
    }).map(function(elem, index) {
      return elem.getAttribute("data-type");
    });
  },
  getStreetValues: function(count) {
    this.openStreetsTab();
    return this.streets.filter(function(elem, index) {
      return index < count;
    }).map(function(elem, index) {
      return elem.getAttribute("data-value");
    });
  },

  clickStreet: function(index) {
    return this.click(this.streets.get(index));
  },

  deselectDictrict: function() {
    return this.click(this.deselectBtnDictrict);
  },

  deselectStreet: function() {
    return this.click(this.deselectBtnStreet);
  },

  deselectTopDictrict: function() {
    return this.click(this.deselectBtnTopDictrict);
  },

  deselectTopStreet: function() {
    return this.click(this.deselectBtnTopStreet);
  },

  getDictrictName: function(index) {
    return districts.get(index).getInnerHtml();
  },

  getStreetName: function(index) {
    return this.streets.get(index).getInnerHtml();
  },

  getSelectedDictrictsCounter: function() {
    return this.districtsTab.$('.tabbedBadge').getText();
  },

  getSelectedStreetsCounter: function() {
    return this.streetsTab.$('.tabbedBadge').getText();
  },

  getSelectedDictrictsCount: function() {
    return this.selectedDistricts.count();
  },

  getSelectedStreetsCount: function() {
    return this.selectedStreets.count();
  },

  getSelectedDictricts: function(index) {
    return this.selectedDistricts;
  },

  getSelectedStreets: function(index) {
    return this.selectedStreets;
  },

  getDisabledStreetsCount: function() {
    return this.disabledStreets.count();
  },

  getSelectedCount: function() {
    return this.openDialogBtn.getText();
  },

  getDictrictClass: function(index) {
    return this.districts.get(index).getAttribute('class');
  },

   getStreetClass: function(index) {
    return this.streets.get(index).getAttribute('class');
  },

   getDistrictsCount: function(index) {
    return this.districts.count();
  },

   getStreetsCount: function(index) {
    return this.streets.count();
  }
});

module.exports = MSearcherDistrictsWidget;