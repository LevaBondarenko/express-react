var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);

var MSearcherSelectWidget = require("../../../Widgets/MSearcherSelect_Widget.js");
var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var SearchFilterWidget = require("../../../Widgets/SearchFilter_Widget.js");

var switcher = Object.create(MSearcherSelectWidget).realtyType;
var layout = Object.create(SearchLayoutWidget);
var filter = Object.create(SearchFilterWidget);

var SearchByRealtyTypeSteps = function() {
  var allTypes = [], typeLabels = [];
  allTypes['realty_out'] = ['house', 'garden', 'land', 'cottage', 'townhouse'];
  allTypes['realty_rent'] = ['flat', 'malosem', 'room', 'pansion', 'obshaga'];
  allTypes['commerce'] = ['dev', 'base', 'busines', 'office', 'torg', 'other', 'sklad', 'land'];
  typeLabels['realty_out'] = ['ДОМ', 'ДАЧА', 'ЗЕМЕЛЬНЫЙ УЧАСТОК', 'КОТТЕДЖ', 'ТАУНХАУС'];
  typeLabels['realty_rent'] = ['КВАРТИРА', 'МАЛОСЕМЕЙКА', 'КОМНАТА', 'ПАНСИОНАТ', 'ОБЩЕЖИТИЕ'];
  typeLabels['commerce'] = ['ПРОИЗВОДСТВО', 'БАЗА', 'ГОТОВЫЙ БИЗНЕС', 'ОФИС', 'ТОРГОВОЕ', 'СВОБОДНОЕ НАЗНАЧЕНИЕ', 'СКЛАД', 'ЗЕМЕЛЬНЫЙ УЧАСТОК'];

  isTypeSelected = function(types, type) {
    return types.indexOf(type) > -1;
  };

  getTypeByLabel = function(label, page) {
    return allTypes[page][typeLabels[page].indexOf(label)];
  };

  this.select = function(types, page) {
    types.forEach(function(type) {
      switcher.selectItem(type);
    });

    allTypes[page].forEach(function(type) {
      expect(switcher.isChecked(type)).toBe(isTypeSelected(types, type));
    });
    return true;
  };

  this.verify = function(types, page) {
    allTypes[page].forEach(function(type) {
      expect(switcher.isChecked(type)).toBe(isTypeSelected(types, type));
    });

    layout.getObjectHeaders().each(function(element, index) {
      element.getText().then(function (header) {
        var objectLabel = header.split(',')[0];
        if(page === 'realty_rent' && objectLabel.indexOf(' ') > -1){
          objectLabel = typeLabels['realty_rent'][0];
        };
        var objectType = getTypeByLabel(objectLabel, page);
        expect(types.join(' ')).toContain(objectType);
      });
    });
  };
};

module.exports = SearchByRealtyTypeSteps;