var request = require("request");
var Helpers = require("./helpers.js");
var ph = require("./pageHelpers.js");
var commonPage = Object.create(require("../Pages/Page.js")).common;
var searcherSubmit = Object.create(require("../Widgets/MSearcherSubmit_Widget.js"));

var cities = 'anapa,astrakhan,vladimir,vlg,vologda,voronezh,gk,ekb,irk,ishim,kazan,kaliningrad,kaluga,kem,kna,kostroma,krasnodar,kras,lipetsk,miass,msk,murom,chelny,ugansk,tagil,nk,novosibirsk,n-urengoy,norilsk,omsk,orel,perm,rostov-na-donu,ryazan,saratov,sterlitamak,surgut,tobolsk,tomsk,tula,www,ulan-ude,ufa,khm,shadrinsk,sakhalin,yakutsk,yalutorovsk,almaty,astana,minsk';

module.exports = Helpers.extend({
  getCities: function() {
    return browser.params.cities == 'all'
      ? cities.split(',') : browser.params.cities.split(',');
  },
  getPages: function() {
    if (browser.params.pages) {
      return browser.params.pages.split(',');
    } else {
      return false;
    }
  },
  getPage: function(page, city) {
    if (browser.params.customUrl) {
      commonPage.get(browser.params.customUrl);
    } else {
      page.get(city);
      searcherSubmit.submit();
    }
  },
  getWidgets: function() {
    if (browser.params.widgets) {
      return browser.params.widgets.split(',');
    } else {
      return false;
    }
  },
  forPage: function(page) {
    var p = this.getPages();
    if (p) {
      if (p[0] === 'X') {
        return page
          ? !(p.indexOf(page.getUrl())) > -1
          : true;
      } else if (p[0] === 'all') {
        return true;
      } else {
        return page
          ? p.indexOf(page.getUrl()) > -1
          : false;
      }
    } else {
      return true;
    }
  },
  forWidget: function(widget) {
    var p = this.getWidgets();
    if (p) {
      if (p[0] === 'X') {
        return widget
          ? !(p.indexOf(widget) > -1)
          : true;
      } else if (p[0] === 'all') {
        return true;
      } else {
        return widget
          ? p.indexOf(widget) > -1
          : false;
      }
    } else {
      return true;
    }
  },
  notForSmoke: function() {
    return !browser.params.smoke;
  },
  getCitiesFromApi: function() {
    return new Promise(function(resolve, reject) {
      request({
        uri: browser.params.api.path
          + "catalogs/cities/list?api_key="
          + browser.params.api.key + "&extra=1&limit=1000",
        method: "GET"
        }, function(error, response, body) {
        if (response.statusCode != 200) {
          console.log('Response code: ' + response.statusCode);
          console.log('Body: ' + body);
          reject(response.statusCode);
        } else {
          var cities = JSON.parse(body).data;
          var res = [];
          var resID = [];

          for (var key in cities) {
            if (cities[key].offices && cities[key].offices.length > 0) {
              var domain = '';
              cities[key].offices.forEach(function(office) {
                if (office.site && !domain) {
                  domain = office.site.split('.')[0];
                }
              })
              res[domain] = cities[key];
              resID[cities[key].id] = cities[key];
            }
          }

          browser.params.allCitiesID = resID;
          browser.params.allCities = res;

          var domains = [];
          domains['franch'] = {
            cityId: 23
          };
          domains['m'] = {
            cityId: 23
          };

          for (var key in domains) {
            browser.params.allCities[key] =
              browser.params.allCitiesID[domains[key].cityId];
          };

          resolve(true);
        }
      });
    });

  },

  fillObjectCodesFromApi: function(city) {
    return new Promise(function(resolve, reject) {
      var now = new Date();
      var m = now.getMonth() + 1;
      ms = m < 10 ? '0' + m : m;
      var d = now.getDate() - 3;
      ds = d < 10 ? '0' + d : d;
      var dateRes = now.getFullYear() + '-' + ms + '-' + ds;

      var fill = function(filterClass, filterAction) {
        request({
          uri: browser.params.api.path
            + "objects/list?api_key="
            + browser.params.api.key
            + '&class=' + filterClass + '&filter=["and",["and",["and",[">","date_update","'
            + dateRes + '"],["=","status","active"]],["=","action","'
            + filterAction + '"]],["=","city_id","'
            + ph.getCityParams(city)['id'] + '"]]',
          method: "GET"
        }, function(error, response, body) {
          if (response.statusCode != 200) {
            console.log('Response code: ' + response.statusCode);
            console.log('Body: ' + body);
          } else {
            if (filterClass === "flats" && filterAction === "sale") {
              browser.params.objects.realty = JSON.parse(body).data[0].id;
            } else if (filterClass === "cottages" && filterAction === "sale") {
              browser.params.objects.realtyOut = JSON.parse(body).data[0].id;
            } else if (filterClass === "offices" && filterAction === "sale") {
              browser.params.objects.commerce = JSON.parse(body).data[0].id;
            } else if (filterClass === "flats" && filterAction === "lease") {
              browser.params.objects.realtyRent = JSON.parse(body).data[0].id;
            };
          }
        });
      };

      var fillNH = function() {
        request({
          uri: browser.params.api.path
            + "newhouses/list?api_key="
            + browser.params.api.key
            + '&filter=["and",["=","house_active","1"],["=","city_id","'
            + self.getCityParams(city)['id'] + '"]]',
          method: "GET"
        }, function(error, response, body) {
          if (response.statusCode != 200) {
            console.log('Response code: ' + response.statusCode);
            console.log('Body: ' + body);
          } else {
            browser.params.objects.zastr = JSON.parse(body).data[0].id;
          }
        });
      };

      fill("flats", "sale");
      fill("cottages", "sale");
      fill("offices", "sale");
      fill("flats", "lease");
      fillNH();
      resolve(true);
    });
  }
});