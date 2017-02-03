/* HELPERS */
var PageHelpers = require("../Helpers/pageHelpers.js");
var ph = Object.create(PageHelpers);
/* Helpers */
var sh = Object.create(require("../Helpers/specHelpers.js"));
/* PAGES */
var Page = require("../Pages/Page.js");
var page = Object.create(Page);
/* STEPS */
var SearchByRoomsSteps = require("./Steps/Search/SearchByRooms_Steps.js");
var SearchByDistrictsSteps = require("./Steps/Search/SearchByDistricts_Steps.js");
var SearchByPriceSteps = require("./Steps/Search/SearchByPrice_Steps.js");
var SearchBySquareSteps = require("./Steps/Search/SearchBySquare_Steps.js");
var SearchByAreaLandSteps = require("./Steps/Search/SearchByAreaLand_Steps.js");
var SearchByDeadlineSteps = require("./Steps/Search/SearchByDeadline_Steps.js");
var SearchByBuilderSteps = require("./Steps/Search/SearchByBuilder_Steps.js");
var SearchByJKSteps = require("./Steps/Search/SearchByJK_Steps.js");
var SearchByToCenterSteps = require("./Steps/Search/SearchByToCenter_Steps.js");
var SearchByTraktsSteps = require("./Steps/Search/SearchByTrakts_Steps.js");
var SearchByRealtyTypeSteps = require("./Steps/Search/SearchByRealtyType_Steps.js");
var SearchByFurnitureSteps = require("./Steps/Search/SearchByFurniture_Steps.js");
var SearchByOperationSteps = require("./Steps/Search/SearchByOperation_Steps.js");
var CommonSearcherSteps = require("./Steps/Search/CommonSearcher_Steps.js");
/* ---- */
var byRooms = new SearchByRoomsSteps();
var byDistricts = new SearchByDistrictsSteps();
var byPrice = new SearchByPriceSteps();
var bySquare = new SearchBySquareSteps();
var byAreaLand = new SearchByAreaLandSteps();
var byDeadline = new SearchByDeadlineSteps();
var byBuilder = new SearchByBuilderSteps();
var byJK = new SearchByJKSteps();
var byToCenter = new SearchByToCenterSteps();
var byTrakts = new SearchByTraktsSteps();
var byRealtyType = new SearchByRealtyTypeSteps();
var byFurniture = new SearchByFurnitureSteps();
var byOperation = new SearchByOperationSteps();
var common = new CommonSearcherSteps();
/* WIDGETS */
var MSearcherSubmitWidget = require("../Widgets/MSearcherSubmit_Widget.js");
var SearchLayoutWidget = require("../Widgets/SearchLayout_Widget.js");
var MSearcherInputWidget = require("../Widgets/MSearcherInput_Widget.js");
/* ---- */
var searcherSubmit = Object.create(MSearcherSubmitWidget);
var layout = Object.create(SearchLayoutWidget);
var searcherInput = Object.create(MSearcherInputWidget);

var cities = browser.params.cities.split(',');
if(browser.params.pages){
  var pages = browser.params.pages.split(',');
}
if(browser.params.widgets){
  var widgets = browser.params.widgets.split(',');
}
cities.forEach(function(city){
  describe('Поиск объектов - ' + city, function(){
    beforeAll(function(done) {
      sh.getCitiesFromApi().then(function() {
        done();
      });
    }, 60000);

    var search = function(name, page, data){
      if(page.exists(city) && (((pages) && (pages.indexOf(page.getUrl()) > -1)) || (!pages))){
        describe(name, function(){
          data.forEach(function(item){
            if(((browser.params.smoke) && (item['smoke'])) || (!browser.params.smoke)
              && (((widgets) && (widgets.indexOf(item['widget']) > -1)) || (!widgets))){
              it(item['name'], function(){
                page.get(city);
                if(item['its']){
                  common.getCount().then(function(commonCount){
                    var doSubmit = true;
                    item['its'].forEach(function(i){
                      doSubmit = doSubmit && (i['method'].select(i['params'], page.getUrl()));
                    })
                    searcherSubmit.getDiasbled().then(function(result){
                      if(!result && doSubmit){
                        common.verifyCommonCount(commonCount).then(function(selectedCounter){
                          searcherSubmit.submit();
                          common.verifyCommonCount(commonCount);
                          item['its'].forEach(function(i){
                            i['method'].verify(i['params'], page.getUrl(), city);
                          })
                        });
                      }
                    });
                  });
                } else {
                  searcherSubmit.submit();
                  layout.getObjectLink(0).then(function(objectLink){
                    var objectCodeArr = objectLink.split('/');
                    var objectCode = objectCodeArr[objectCodeArr.length-1];
                    page.get(city);
                    searcherInput.setObjectCode(objectCode);
                    ph.wait(2);
                    searcherSubmit.submit();
                    expect(common.getCount()).toEqual('1');
                    expect(layout.getObjectsCount()).toBe(1);
                    expect(layout.getObjectLink(0)).toContain(objectCode);
                  });
                }
              });
            }
          });
        });
      }
    };

    search('Поиск Вторичной недвижимости', page.realty, [
      {name: 'по районам и улицам', smoke: 1, widget: 'districts', its: [
        {method: byDistricts, params: [2, 3]}
      ]},
      {name: 'по цене', smoke: 1, widget: 'range', its: [
        {method: byPrice, params: [4000000, 6000000]}
      ]},
      {name: 'по количеству комнат (1)', smoke: 1, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[1], false]}
      ]},
      {name: 'по количеству комнат (2)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[2], false]}
      ]},
      {name: 'по количеству комнат (3)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[3], false]}
      ]},
      {name: 'по количеству комнат (4+)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[4], false]}
      ]},
      {name: 'по количеству комнат (панс)', smoke: 1, widget: 'checkbox', its: [
        {method: byRooms, params: [[], true]}
      ]},
      {name: 'по количеству комнат (2, 3)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[2, 3], true]}
      ]},
      {name: 'по площади', smoke: 0, widget: 'range', its: [
        {method: bySquare, params: [60, 80]}
      ]},
      {name: 'по цене и площади', smoke: 0, its: [
        {method: byPrice, params: [4000000, 6000000]},
        {method: bySquare, params: [60, 80]},
      ]},
      {name: 'по коду объекта', smoke: 1, widget: 'input'}
    ]);

    search('Поиск Новостроек', page.zastr, [
      {name: 'по сроку сдачи', smoke: 1, widget: 'deadline', its: [
        {method: byDeadline, params: [1]}
      ]}/*,
      {name: 'по застройщику', smoke: 1, widget: 'select', its: [
        {method: byBuilder, params: []}
      ]},
      {name: 'по ЖК', smoke: 0, widget: 'select', its: [
        {method: byJK, params: []}
      ]},
      {name: 'по районам и улицам', smoke: 0, widget: 'districts', its: [
        {method: byDistricts, params: [2, 3]}
      ]},
      {name: 'по цене', smoke: 1, widget: 'range', its: [
        {method: byPrice, params: [4000000, 5000000]}
      ]},
      {name: 'по площади', smoke: 0, widget: 'range', its: [
        {method: bySquare, params: [60, 80]}
      ]},
      {name: 'по количеству комнат (1)', smoke: 1, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[1], false]}
      ]},
      {name: 'по количеству комнат (2)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[2], false]}
      ]},
      {name: 'по количеству комнат (3)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[3], false]}
      ]},
      {name: 'по количеству комнат (4+)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[4], false]}
      ]},
      {name: 'по количеству комнат (2, 3)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[2, 3], false]}
      ]}*/
    ]);

    search('Поиск Загородной недвижимости', page.realtyOut, [
      {name: 'по трактам', smoke: 1, widget: 'trakts', its: [
        {method: byTrakts, params: [2, 0]}
      ]},
      {name: 'по типу (дом)', smoke: 1, widget: 'select', its: [
        {method: byRealtyType, params: ["house"]}
      ]},
      {name: 'по типу (дача)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["garden"]}
      ]},
      {name: 'по типу (участок)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["land"]}
      ]},
      {name: 'по типу (коттедж)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["cottage"]}
      ]},
      {name: 'по типу (таунхаус)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["townhouse"]}
      ]},
      {name: 'по типу (дача, дом)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["garden", "house"]}
      ]},
      {name: 'по цене', smoke: 0, widget: 'range', its: [
        {method: byPrice, params: [300000, 500000]}
      ]},
      {name: 'по площади участка', smoke: 0, widget: 'range', its: [
        {method: byAreaLand, params: [12, 15]}
      ]},
      {name: 'по расстоянию до центра', smoke: 0, widget: 'input', its: [
        {method: byToCenter, params: [15]}
      ]},
      {name: 'по коду объекта', smoke: 0, widget: 'input'}
    ]);

    search('Поиск Аренды недвижимости', page.realtyRent, [
      {name: 'по районам и улицам', smoke: 0, widget: 'districts', its: [
        {method: byDistricts, params: [2, 3]}
      ]},
      {name: 'по цене', smoke: 0, widget: 'range', its: [
        {method: byPrice, params: [17000, 19000]}
      ]},
      {name: 'по количеству комнат (1)', smoke: 1, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[1], false]}
      ]},
      {name: 'по количеству комнат (2)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[2], false]}
      ]},
      {name: 'по количеству комнат (3)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[3], false]}
      ]},
      {name: 'по количеству комнат (4+)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[4], false]}
      ]},
      {name: 'по количеству комнат (2, 3)', smoke: 0, widget: 'checkbuttons', its: [
        {method: byRooms, params: [[2, 3], false]}
      ]},
      {name: 'по типу (квартира)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["flat"]}
      ]},
      {name: 'по типу (малосемейка)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["malosem"]}
      ]},
      {name: 'по типу (комната)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["room"]}
      ]},
      {name: 'по типу (пансионат)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["pansion"]}
      ]},
      {name: 'по типу (общежитие)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["obshaga"]}
      ]},
      {name: 'по типу (пансионат, общежитие)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["pansion", "obshaga"]}
      ]},
      {name: 'по укомплектованности', smoke: 1, widget: 'select', its: [
        {method: byFurniture, params: []}
      ]},
      {name: 'по коду объекта', smoke: 0, widget: 'input'}
    ]);

    search('Поиск Коммерческой недвижимости', page.commerce, [
      {name: 'по операции', smoke: 1, widget: 'select', its: [
        {method: byOperation, params: []}
      ]},
      {name: 'по типу (производство)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["dev"]}
      ]},
      {name: 'по типу (база)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["base"]}
      ]},
      {name: 'по типу (готовый бизнес)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["busines"]}
      ]},
      {name: 'по типу (офис)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["office"]}
      ]},
      {name: 'по типу (торговое)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["torg"]}
      ]},
      {name: 'по типу (свободное назначение)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["other"]}
      ]},
      {name: 'по типу (склад)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["sklad"]}
      ]},
      {name: 'по типу (земля)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["land"]}
      ]},
      {name: 'по типу (торговое, офис)', smoke: 0, widget: 'select', its: [
        {method: byRealtyType, params: ["torg", "office"]}
      ]},
      {name: 'по району', smoke: 0, widget: 'districts', its: [
        {method: byDistricts, params: [2, 0]}
      ]},
      {name: 'по цене', smoke: 0, widget: 'range', its: [
        {method: byPrice, params: [4000000, 6000000]}
      ]},
      {name: 'по площади', smoke: 1, widget: 'range', its: [
        {method: bySquare, params: [60, 80]}
      ]},
      {name: 'по коду объекта', smoke: 0, widget: 'input'}
    ]);
  });
});