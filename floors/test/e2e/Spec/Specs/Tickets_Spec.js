/* Helpers */
var sh = Object.create(require("../Helpers/specHelpers.js"));
var ph = Object.create(require("../Helpers/pageHelpers.js"));
/* Pages */
var page = Object.create(require("../Pages/Page.js"));
/* Steps */
var ticketsSpecSteps = Object.create(require("./Steps/Tickets/TicketsSpec_Steps.js"));
/* Widgets */
var cloud = Object.create(require("../Widgets/RieltorCloud_Widget.js"));
var filterQuarterFlatNew = Object.create(require("../Widgets/FilterQuarterFlatNew_Widget.js"));
var jobList = Object.create(require("../Widgets/JobList_Widget.js"));
var jobSeekerProfile = Object.create(require("../Widgets/JobSeekerProfile_Widget.js"));
var mortgageBroker = Object.create(require("../Widgets/MortgageBroker_Widget.js"));
var order = Object.create(require("../Widgets/Order_Widget.js"));
var rentBooking = Object.create(require("../Widgets/RentBooking_Widget.js"));
var rieltor = Object.create(require("../Widgets/Rieltor_Widget.js"));
var uSubmit = Object.create(require("../Widgets/USubmit_Widget.js"));

describe('Отправка заявок', function() {
  var testTickets = function(order, data, cities) {
    describe('Виджет: ' + order.name, function() {
      beforeAll(function(done) {
        sh.getCitiesFromApi().then(function() {
          done();
        });
      }, 60000);

      beforeEach(function() {
        browser.manage().deleteAllCookies();
      });

      data.forEach(function(item, itemIndex) {
        if ((((browser.params.smoke)
          && (item['smoke'])) || (!browser.params.smoke))
          && (sh.forPage(item['page']))
          && (sh.forWidget(order.widget))) {

          item['ticketType'] = item['ticketType'] ? item['ticketType'] : 0;
          var o = item['widget'] ? item['widget'] : order;

          for (var k = 0; k < browser.params.count; k++) {
            if (sh.getCities().length > 1) {
              ticketsSpecSteps.multipleCitiesDesc(o, item, k, cities);
            } else {
              ticketsSpecSteps.oneCityDesc(o, item, k, cities);
            }
          }
        }
      });
    });
  }


  /*if (city === 'franch') {
    testTickets(order.rentTop, [{
      page: page.franch,
      ticketType: 26
    }]);
    testTickets(order.buttonModalFranch, [{
      page: page.franch,
      ticketType: 26,
      index: 0
    }]);
  } else {
  // replaced with uSubmit
  testTickets(order.event, [{
    page: page.yarmarka
  }]);*/

  var testData = [{
    order: order.main,
      items: [{
        item: 1,
        page: page.main,
        ticketType: 3,
        smoke: 1
      }, {
        item: 2,
        page: page.realty,
        ticketType: 3
      }, {
        item: 3,
        page: page.zastr,
        ticketType: 7
      }, {
        item: 4,
        page: page.realtyOut,
        ticketType: 11
      }, {
        item: 5,
        page: page.realtyRent,
        ticketType: 5
      }, {
        item: 6,
        page: page.commerce,
        ticketType: 14
      }, {
        item: 7,
        page: page.turnkey,
        ticketType: 6
      }, {
        item: 8,
        page: page.domSoSkidkoy,
        ticketType: 11
      }, {
        item: 9,
        page: page.olimpijskieSkidki,
        ticketType: 154
      }, {
        item: 10,
        page: page.crossRegion,
        ticketType: 3
      }, {
        item: 11,
        page: page.yarmarka,
        ticketType: 169
      }],
      cities: null
    }, {
      order: order.callMe,
      items: [{
        item: 12,
        page: page.realty,
        ticketType: 3,
        smoke: 1
      }, {
        item: 13,
        page: page.zastr,
        ticketType: 7
      }, {
        item: 14,
        page: page.realtyOut,
        ticketType: 11
      }, {
        item: 15,
        page: page.realtyRent,
        ticketType: 5
      }, {
        item: 16,
        page: page.commerce,
        ticketType: 14
      }, {
        item: 17,
        page: page.rentNh,
        ticketType: 5
      }, {
        item: 18,
        page: page.domSoSkidkoy,
        ticketType: 11,
        indexes: [0, 3]
      }, {
        item: 19,
        page: page.elitCottage,
        ticketType: 11,
        indexes: [0, 2]
      }, {
        item: 20,
        page: page.plekhanovo,
        ticketType: 155,
        indexes: [0, 3]
      }, {
        item: 21,
        page: page.olimpijskieSkidki,
        ticketType: 154,
        indexes: [0, 3]
      }, {
        item: 22,
        page: page.crossRegion,
        ticketType: 3
      }],
      cities: null

    }, {
      order: order.didntLike,
      items: [{
        page: page.realty,
        ticketType: 3,
        smoke: 1
      }, {
        page: page.zastr,
        ticketType: 7
      }, {
        page: page.realtyOut,
        ticketType: 11
      }, {
        page: page.realtyRent,
        ticketType: 5
      }],
      cities: null
    }, {
      order: order.newNHTop,
      items: [{
        page: page.zastr,
        ticketType: 7,
        smoke: 1
      }],
      cities: null
    }, {
      order: order.newNHBottom,
      items: [{
        page: page.zastr,
        ticketType: 7,
        smoke: 1
      }],
      cities: null
    }, {
      order: order.mortgage,
      items: [{
        page: page.zastr,
        ticketType: 6,
        smoke: 1
      }],
      cities: null
    }, {
      order: order.seller1,
      items: [{
        page: page.forTheSeller,
        ticketType: 2,
        smoke: 1
      }],
      cities: null
    }, {
      order: order.seller2,
      items: [{
        page: page.forTheSeller,
        ticketType: 2,
        smoke: 1
      }, {
        page: page.forTheLandlord,
        ticketType: 4
      }, {
        page: page.vtb,
        ticketType: 6
      }],
      cities: null
    }, {
      order: order.rentTop,
      items: [{
        page: page.students,
        ticketType: 5,
        smoke: 1
      }, {
        page: page.rentNh,
        ticketType: 5
      }],
      cities: null
    }, {
      order: order.rentBottom,
      items: [{
        page: page.students,
        ticketType: 5,
        smoke: 1
      }, {
        page: page.deals,
        ticketType: 3,
        indexes: [0, 1]
      }, {
        page: page.turnkey,
        ticketType: 6
      }],
      cities: null
    }, {
      order: order.fieldsList,
      items: [{
        page: page.deals,
        ticketType: 3,
        smoke: 1
      }],
      cities: null
    }, {
      order: order.buttonModal,
      items: [{
        page: page.deals,
        ticketType: 3,
        smoke: 1
      }],
      cities: null
     }, {
      order: rieltor,
      items: [{
        item: 1,
        widget: rieltor.object,
        page: page.realty,
        ticketType: 3,
        smoke: 1
      }, {
        widget: rieltor.zastr,
        page: page.zastr,
        ticketType: 7,
        smoke: 1
      }, {
        widget: rieltor.builder,
        page: page.zastr,
        ticketType: 7,
        smoke: 1
      }, {
        item: 1,
        widget: rieltor.object,
        page: page.realtyOut,
        ticketType: 11
      }, {
        widget: rieltor.object,
        page: page.commerce,
        ticketType: 14
      }, {
        widget: rieltor.object,
        page: page.commerce,
        ticketType: 16
      }, {
        widget: rieltor.object,
        page: page.realtyRent,
        ticketType: 5,
        citiesExclude: ['surgut']
      }],
      cities: null
    }, {
      order: rentBooking,
      items: [{
        page: page.realtyRent,
        ticketType: 5,
        smoke: 1
      }],
      cities: ['surgut']
    }, {
      order: filterQuarterFlatNew,
      items: [{
        widget: filterQuarterFlatNew.rieltor,
        page: page.zastr,
        ticketType: 7,
        smoke: 1
      }, {
        widget: filterQuarterFlatNew.review,
        page: page.zastr,
        ticketType: 132,
        smoke: 1
      }, {
        widget: filterQuarterFlatNew.book,
        page: page.zastr,
        ticketType: 7,
        smoke: 1
      }],
      cities: null
    }, {
      order: uSubmit,
      items: [{
        page: page.ipoteka,
        ticketType: 6,
        smoke: 1
      }, {
        widget: uSubmit.bank,
        page: page.ipoteka,
        ticketType: 6,
        smoke: 1
      }, {
        widget: uSubmit.object,
        page: page.realty,
        ticketType: 6
      }, {
        widget: uSubmit.object,
        page: page.realtyOut,
        ticketType: 6
      }, {
        widget: uSubmit.object,
        page: page.commerce,
        ticketType: 6
      }, {
        widget: uSubmit.object,
        page: page.zastr,
        ticketType: 6
      }],
      cities: null
    }, {
      order: mortgageBroker,
      items: [{
        page: page.ipoteka,
        ticketType: 6,
        indexes: [0, 1]
      }, {
        widget: mortgageBroker.bank,
        page: page.ipoteka,
        ticketType: 6,
        indexes: [0, 1]
      }, {
        widget: mortgageBroker.program,
        page: page.ipoteka,
        ticketType: 6,
        indexes: [0, 1],
        smoke: 1
      }, {
        widget: mortgageBroker.object,
        page: page.realty,
        ticketType: 6,
        indexes: [0, 1]
      }, {
        widget: mortgageBroker.object,
        page: page.realtyOut,
        ticketType: 6,
        indexes: [0, 1]
      }, {
        widget: mortgageBroker.object,
        page: page.commerce,
        ticketType: 6,
        indexes: [0, 1]
      }, {
        widget: mortgageBroker.object,
        page: page.zastr,
        ticketType: 6,
        indexes: [0, 1]
      }],
      cities: null
    }, {
      order: cloud,
      items: [{
        page: page.main,
        ticketType: 0,
        smoke: 1
      }, {
        page: page.realtyRent,
        ticketType: 0
      }, {
        page: page.commerce,
        ticketType: 0
      }],
      cities: null
    }, {
      order: jobList,
      items: [{
        page: page.job,
        ticketType: 25,
        smoke: 1
      }],
      cities: null
    }, {
      order: jobSeekerProfile,
      items: [{
        page: page.job,
        ticketType: 25,
        smoke: 1
      }],
      cities: null
    }
  ];

  var iii = 0;

  testData.forEach(function(data) {
    data.items.forEach(function(item) {
      item.iii = ++iii;
    });
  });

  testData.forEach(function(data) {
    testTickets(data.order, data.items, data.cities);
  });
});