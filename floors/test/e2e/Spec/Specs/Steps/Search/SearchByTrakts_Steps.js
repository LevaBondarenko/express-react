var PageHelpers = require("../../../Helpers/pageHelpers.js");
var ph = Object.create(PageHelpers);
/* Widgets */
var MSearcherTraktsWidget = require("../../../Widgets/MSearcherTrakts_Widget.js");
var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");

var td = Object.create(MSearcherTraktsWidget);
var layout = Object.create(SearchLayoutWidget);

var SearchByTraktsSteps = function() {
  this.select = function(params, page) {
    var count = params[0];
    var districts = params[1];

    expect(td.getSelectedCount()).not.toContain(': ');
    td.openDialog();

    if (!districts) {
      for (var i = 0; i < count; i++) {
        td.clickTrakt(i);
      }
    } else {
      td.clickTraktLabel(0);

      for (var i = 0; i < districts; i++) {
        td.clickDistrict(i);
      }
    }

    td.getSelectedTagCount().then(function(result) {
      td.select();
      expect(td.getSelectedCount()).toContain(': ' + result);
    });
    return true;
  };

  this.verify = function(params, page, city) {
    var count = params[0];
    var districts = params[1];

    expect(td.getSelectedCount()).toContain(': ');
    td.openDialog();

    if (!districts) {
      var selectedTrakts = td.getSelectedTrakts().reduce(function(selectedTraktsAcc, elem) {
        return elem.getText().then(function(text) {
          return selectedTraktsAcc + text + ', ';
        });
      }, '');
    };

    td.getSelectedTagCount().then(function(result) {
      td.closeDialog();
      expect(td.getSelectedCount()).toContain(': ' + result);
    });

    layout.getObjectLocations().each(function(element, index) {
      element.getText().then(function (fullLocation) {
        if (!districts) {
          var trakt = fullLocation.split('(')[0];
          if(trakt === ph.getCityParams(city)['name']){
            trakt = 'В черте города';
          }
          expect(selectedTrakts).toContain(trakt);
        };
      });
    });
  };
};

module.exports = SearchByTraktsSteps;