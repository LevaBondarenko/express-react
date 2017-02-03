var Element = require("../Common/Element.js");
var maxLogLevel = 3;

var Helpers = Element.extend({
  api: function(message, meth, path, params, frm) {
    var request = require("request");
    var url = 'http://developers.etagi.com/api/v1/';
    var key = '97335caf41d88eba1e1b615eb73c4c06';
    var req = url + path + '?api_key=' + key + (params ? "&" + params : '');
    browser.params.debug && console.log(req);
    return new Promise(function(resolve, reject) {
      request({
        uri: req,
        method: meth,
        form: frm ? frm : undefined,
        }, function(error, response, body) {
        if (response.statusCode != 200) {
          console.log('!------------------------------!');
          console.log('ERROR: ' + message);
          console.log('Response code: ' + response.statusCode);
          console.log('Request: ' + req);
          console.log('Body: ' + body);
          console.log('!------------------------------!');
          reject(response.statusCode);
        } else {
          browser.params.debug && console.log(JSON.parse(body).data);
          resolve(JSON.parse(body).data);
        }
      });
    });
  },

  isDedugMode: function() {
    return browser.params.debugMode == 1;
  },
  getElem: function(element) {
    return element.hasOwnProperty('web') ? element.web : element;
  },
  getElemName: function(element) {
    return element.hasOwnProperty('name') ? element.name : '';
  },
  getElemNameOrLocator: function(element) {
    var elem = this.getElem(element);
    var elemName = this.getElemName(element);
    return elemName ? elemName : elem.locator();
  },
  getElemDesc: function(element) {
    var elem = this.getElem(element);
    var elemName = this.getElemName(element);
    return (elemName ? elemName + ' / ' : '') + elem.locator();
  },

  /* Navigation */
  selectTab: function(index) {
    this.wait();
    browser.getAllWindowHandles().then(function(handles) {
      browser.switchTo().window(handles[index]);
    });
    this.wait();
    this.logCurrentPageUrl();
  },

  closeAndSelectTab: function(index) {
    browser.driver.close();
    this.wait();
    this.selectTab(index);
    this.logCurrentPageUrl();
  },

  back: function() {
    browser.navigate().back();
  },

  /* Phone */
  getFormattedPhone: function(phone, format, city) {
    /*
    0- 9996663311
    1 - +7 (999) 666-3311
    2 - +7 (999) 666-33-11
    3 - 8 (999) 666-33-11
    4 - +72347023634
    */
    switch (format) {
      case 1:
      case 2:
      case 4:
        var part0 = '+' + this.getCityParams(city).country.phone_prefix;
        break;
      case 3:
        var part0 = '8';
        break;
    }

    var part1 = phone.substring(0, 3);
    var part2 = phone.substring(3, 6);
    var part3 = phone.substring(6, 8);
    var part4 = phone.substring(8, 10);

    var result = '';

    switch (format) {
      case 0:
        result = phone;
        break;
      case 2:
      case 3:
        result = part0 + ' (' + part1 + ') ' + part2 + '-' + part3 + '-' + part4;
        break;
      case 1:
        result = part0 + ' (' + part1 + ') ' + part2 + '-' + part3 + part4;
        break;
      case 4:
        result = part0 + phone;
        break;
    }

    return result;
  },

  getRandomPhone: function() {
    return browser.params.ticket.phone + (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000);
  },

  /* --- */
  wait: function(m) {
    var timeout = 2000;
    if (browser.params.domain === 'dev') {
      timeout *= 2;
    }
    if (m !== undefined) {
      timeout *= m;
    }
    browser.sleep(timeout);
  },

  getRunID: function() {
    return String(Date.now()).substring(0);
  },

  getYear: function(inc) {
    return currentYear = new Date().getFullYear() + parseInt(inc);
  },

  getObjectCodeByLink: function(objectLink) {
    var objectCodeArr = objectLink.split('/');
    return objectCodeArr[objectCodeArr.length - 1];
  },

  strToInt: function(str) {
    return parseInt(str.split(' ').join(''));
  },

  squareDeFormat: function(squareStr, slug) {
    switch (slug) {
      case 'zastr':
        return parseFloat(squareStr);
      case 'realty_out':
        return parseFloat(squareStr.split('Площадь участка:')[1].split(' сот.')[0]);
      default:
        return parseFloat(squareStr.split(': ')[1].split(' ')[0]);
    }
  },

  getToday: function() {
    var now = new Date();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    ms = m < 10 ? '0' + m : m;
    ds = d < 10 ? '0' + d : d;
    return nowStr = now.getFullYear() + '-' + ms + '-' + ds;
  },

  takeScreenshot: function(name) {
    var self = this;
    var fs = require('fs');
    browser.takeScreenshot().then(function(png) {
      var stream = fs.createWriteStream('test/e2e/Report/Screenshots/' + name + '.png');
      stream.write(new Buffer(png, 'base64'));
      stream.end();
      self.isDedugMode() && console.log('Скриншот создан: Clicked: test/e2e/Report/Screenshots/' + name + '.png');
    });
  },

  getCurrency: function(type) {
    var currency = Object.create(require("../Widgets/CurrencySelect_Widget.js"));
    var currencies = [];

    currencies['RUB'] = 'руб.';
    currencies['USD'] = '$';

    currency.displayed().then(function(result) {
      if (result) {
        currency.getCurrency().then(function(c) {
          browser.manage().addCookie("E2E_currency", currencies[c]);
        });
      } else {
        browser.manage().addCookie("E2E_currency", '');
      }
    });
  },

  /* LOGS */

  getCurrentTime: function() {
    var now = new Date();
    var time = (now.getHours() < 10 ? '0' + now.getHours() : now.getHours()) + ':'
      + (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()) + ':'
      + (now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds());
    return time;
  },
  logStep: function(message, logParam, logUrl, extraSpaces) {
    if (browser.params.debugLevel > 0) {
      var self = this;
      browser.getCurrentUrl().then(function(url) {
        console.log((extraSpaces ? '  ' : '')
          + '    [' + self.getCurrentTime().grey + '] '
          + (message ? message + ' ' : '')
          + (logParam ? (logParam === true ? browser.params.loggedValue : logParam).bold + ' ' : '')
          + (logUrl ? '(' + url + ')' : ''));
      });
    }
  },
  logCurrentPageUrl: function() {
    browser.getCurrentUrl().then(function(url) {
      browser.params.url = url;
    });
    if (browser.params.debugLevel > 1) {
      var self = this;
      browser.getCurrentUrl().then(function(url) {
        console.log('    [' + self.getCurrentTime().grey + '] Текущая страница: ' + url.cyan);
      });
    }
  },
  setErrorMsg: function(part, message) {
    switch (part) {
      case 0:
        browser.params.errorMsg.code = '';
        browser.params.errorMsg.codeExtra = '';
        browser.params.errorMsg.theme = '';
        browser.params.errorMsg.themeExtra = '';
        break;
      case 1:
        browser.params.errorMsg.code = message;
        break;
      case 2:
        browser.params.errorMsg.codeExtra = message;
        break;
      case 3:
        browser.params.errorMsg.theme = message;
        break;
      case 4:
        browser.params.errorMsg.themeExtra = message;
        break;
    }
  },
  debugMessage: function() {
    var tmp = [];
    for (var key in browser.params.errorMsg){
      tmp.push(browser.params.errorMsg[key]);
    }

    cosole.log(tmp.filter(function(value) {
      return value != '';
    }).join(', '));
  },
  getErrorMsg: function(message) {
    var tmp = [];
    for (var key in browser.params.errorMsg){
      tmp.push(browser.params.errorMsg[key]);
    }

    return tmp.filter(function(value) {
      return value != '';
    }).join(', ') + "\n      Текст ошибки: " + message.bold;
  }
});

module.exports = Helpers;