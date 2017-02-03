var Helpers = require("../../../Helpers/helpers.js");
var h = Object.create(Helpers);
/* Widgets */
var MSearcherDistrictsWidget = require("../../../Widgets/MSearcherDistricts_Widget.js");
var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");

var ds = Object.create(MSearcherDistrictsWidget);
var layout = Object.create(SearchLayoutWidget);

var SearchByDistrictsSteps = function() {
  this.select = function(params, page) {
    var districts = params[0];
    var streets = params[1];

    h.wait();
    expect(ds.getSelectedCount()).not.toContain(': ');

    if(districts + streets > 0) {
      ds.openDialog();

      if(streets > 0) {
        ds.openStreetsTab();
        expect(ds.getDisabledStreetsCount()).toBe(0);
        ds.openDistrictsTab();
      }

      ds.getDistrictsCount().then(function(resultD){
        districts = resultD < districts ? resultD : districts;
        for(var i = 0; i < districts; i++) {
          ds.clickDictrict(i);
        }

        if(streets > 0) {
          ds.openStreetsTab();
          expect(ds.getDisabledStreetsCount()).toBeGreaterThan(0);
          ds.getStreetsCount().then(function(resultS){
            streets = resultS < streets ? resultS : streets;
            for (var i = 0; i < streets; i++) {
              ds.clickStreet(i);
            }
            ds.select();
            if (districts + streets > 1) {
              ds.getSelectedCount().then(function(count) {
                expect(count).toContain(': ');
                if (districts) {
                  expect(count).toContain(districts,
                    "Поле Район, улица должно содержать количество выбранных районов");
                }
                if (streets) {
                  expect(count).toContain(streets,
                    "Поле Район, улица должно содержать количество выбранных улиц");
                }
              });
            };
          });
        } else {
          ds.select();
          if (districts > 1) {
            expect(ds.getSelectedCount()).toContain(': ' + districts,
              "Поле Район, улица должно содержать количество выбранных районов");
          };
        }
      });
    }
    return true;
  };

  this.verify = function(params, page) {
    var districts = params[0];
    var streets = params[1];

    ds.openDialog();
    ds.getDistrictsCount().then(function(resultD){
      districts = resultD < districts ? resultD : districts;
      for(var i = 0; i < districts; i++) {
        expect(ds.getDictrictClass(i)).toContain('activeItem');
      }
      var selectedDistricts = ds.getSelectedDictricts().reduce(function(selectedDistrictsAcc, elem) {
        return elem.getInnerHtml().then(function(text) {
          return selectedDistrictsAcc + text + ', ';
        });
      }, '');

      if(streets > 0) {
        ds.openStreetsTab();
        expect(ds.getDisabledStreetsCount()).toBeGreaterThan(0);
      }
      ds.getStreetsCount().then(function(resultS){
        streets = resultS < streets ? resultS : streets;
        for(var i = 0; i < streets; i++) {
          expect(ds.getStreetClass(i)).toContain('activeItem');
        }
        var selectedStreets = ds.getSelectedStreets().reduce(function(selectedStreetsAcc, elem) {
          return elem.getInnerHtml().then(function(text) {
            return selectedStreetsAcc + text + ', ';
          });
        }, '');
        ds.closeDialog();
        ds.getSelectedCount().then(function(count) {
          expect(count).toContain(': ');
          if (districts) {
            expect(count).toContain(districts,
              "Поле Район, улица должно содержать количество выбранных районов");
          }
          if (streets) {
            expect(count).toContain(streets,
              "Поле Район, улица должно содержать количество выбранных улиц");
          }
        });

        h.wait(2);
        layout.getObjectLocations().each(function(element, index) {
          element.getText().then(function (fullLocation) {
            try {
              var district = fullLocation.split(', ул. ')[0];
              if(fullLocation.indexOf(', д.') == -1) {
                var street = fullLocation.split(', ул. ')[1];
                if (street.indexOf('(') > -1) {
                  street = street.split('(')[0];
                }
              } else {
                var street = fullLocation.split(', ул. ')[1].split(', д.')[0];
              }
              if(districts > 0) {
                expect(selectedDistricts).toContain(district);
              }
              if(streets > 0) {
                expect(selectedStreets).toContain(street);
              }
            } catch (e) {
              console.log(e.name);
              console.log(e.message);
              console.log(e.stack);
            }
          });
        });
      });
    });
  };
};

module.exports = SearchByDistrictsSteps;