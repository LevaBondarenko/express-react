var Element = require("../../../Common/Element.js");
/* Helpers */
var sh = Object.create(require("../../../Helpers/specHelpers.js"));
/* Steps */
var ticketsSteps = Object.create(require("./Tickets_Steps.js"));

var SpecSteps = Element.extend({
  sendTicket: function(order, item, city, index) {
    // console.log(item.iii);
    // console.log(browser.params.testCounter++);
    ticketsSteps.prepare(order, city, item['page'],
      item['ticketType'], index);
    return browser.manage().getCookie('send').then(function(send) {
      if (send.value === 'true') {
        return ticketsSteps.sendTicket(order, city, item['page'],
          item['ticketType'], index);
      } else {
        browser.params.ticketNotSended = true;
      }
    });
  },
  getNamePart: function(order, item) {
    return item['page'].getName()
    + (item['widget'] ? ' (' + order.name + ')' : '')
    + ', тип: ' + item['ticketType'];
  },
  getNameIteration: function(k) {
    return browser.params.count > 1 ? '[' + (k + 1) + '] ' : '';
  },
  getNameIndex: function(item, index) {
    return item['indexes'] !== undefined ? ' N' + (index + 1) : '';
  },
  getIndexes: function(item) {
    var start = item['indexes'] ? item['indexes'][0] : 0;
    var end = item['indexes'] ? item['indexes'][1] : 0;

    var indexes = [];
    for (var index = start; index < end + 1; index++) {
      indexes.push(index);
    }
    return indexes;
  },
  checkCities: function(item, city, cities) {
    return (!(item['citiesExclude']
      && (item['citiesExclude'].indexOf(city) > -1)))
      && (!cities || (cities.indexOf(city) > -1))
      && item['page'].exists(city);
  },
  oneCityDesc: function(order, item, k, cities) {
    SpecSteps.getIndexes(item).forEach(function(index) {
      sh.getCities().forEach(function(city) {
        if (SpecSteps.checkCities(item, city, cities)) {
        it(SpecSteps.getNameIteration(k) + city + ', '
          + SpecSteps.getNamePart(order, item)
          + SpecSteps.getNameIndex(item, index), function(done) {
            SpecSteps.sendTicket(order, item, city, index).then(function() {
              done();
            });
          });
        }
      });
    });
  },
  multipleCitiesDesc: function(order, item, k, cities) {
    if (!browser.params.item || (browser.params.item == item.iii)) {
      describe(SpecSteps.getNameIteration(k)
        + SpecSteps.getNamePart(order, item), function() {
        SpecSteps.getIndexes(item).forEach(function(index) {
          sh.getCities().forEach(function(city) {
            if (SpecSteps.checkCities(item, city, cities)) {
              it(city + SpecSteps.getNameIndex(item, index), function(done) {
                SpecSteps.sendTicket(order, item, city, index).then(function() {
                  done();
                });
              });
            }
          });
        });
      });
    }
  }
});

module.exports = SpecSteps;