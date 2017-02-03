var h = Object.create(require("./Spec/Helpers/helpers.js"));

var SpecReporter = require('jasmine-spec-reporter');
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var htmlScreenshotReporter = new HtmlScreenshotReporter({
  dest: './Report/' + h.getToday(),
  filename: 'report.html',
  showQuickLinks: true,
  reportTitle: 'Отчет от ' + h.getToday(),
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: false,
  showSummary: true,
  showConfiguration: false,
  preserveDirectory: true,
  userCss: '../../../report_style.css',
  pathBuilder: function(currentSpec, suites, browserCapabilities) {
    return browserCapabilities.get('browserName') + '/' + currentSpec.fullName;
  }
});

var specReporter = new SpecReporter({
  displayStacktrace: 'summary',
  displaySpecDuration: true,
  displaySuiteNumber: true
});

var myReporter = {
  jasmineStarted: function(suiteInfo) {
    console.log('Specs to run:  ' + suiteInfo.totalSpecsDefined);
  },
  specStarted: function(result) {
    browser.params.url = false;
    browser.params.ticketUrl = false;
    browser.params.ticketID = false;
    browser.params.phone = false;
    browser.params.pageNotFound = false;
    browser.params.ticketNotFound = false;
    browser.params.ticketNotSended = false;
  },
  specDone: function(result) {
    if (browser.params.phone) {
      result.description += ', телефон: ' + browser.params.phone;
    }
    if (browser.params.ticketID) {
      result.description += ', код заявки: ' + browser.params.ticketID;
    }
    if (browser.params.pageNotFound) {
      result.description += ', СТРАНИЦА НЕ СУЩЕСТВУЕТ';
    }
    if (browser.params.ticketNotFound) {
      result.description += ', ЗАЯВКА ОТСУТСТВУЕТ';
    }
    if (browser.params.ticketNotSended) {
      result.description += ', ЗАЯВКА НЕ ОТПРАВЛЕНА';
    }

    if (result.status === 'failed') {
      var texts = [];
      browser.params.url
        && texts.push('Страница: ' + browser.params.url);
      browser.params.ticketUrl
        && texts.push('Страница заявки: ' + browser.params.ticketUrl);
      browser.params.ticketID
        && texts.push('Код заявки: ' + browser.params.ticketID);
      browser.params.phone
        && texts.push('Телефон: ' + browser.params.phone);
      browser.params.pageNotFound
        && texts.push('СТРАНИЦА НЕ СУЩЕСТВУЕТ');
      texts && result.failedExpectations.push({
        message: 'INFO :: ' + texts.join(", "),
        matcherName: '',
        stack: '',
        passed: false,
        expected: '',
        actual: ''
      });
    }
  }
};

module.exports.myReporter = myReporter;

var params = {
  domain: 'dev',
  cities: 'www',
  count: 1,
  api: {
    key: '97335caf41d88eba1e1b615eb73c4c06',
    path: 'http://developers.etagi.com/api/v1/'
  },
  smoke: 0,
  debugLevel: 1,
  loggedValue: '',
  errorMsg: {
    code: '',
    codeExtra: '',
    theme: '',
    themeExtra: ''
  },
  takeScreenshots: true,
  realtyMenuIndex: 1,
  ticket: {
    name: 'Test234702',
    phone: '234702',
    custom: 'Custom234702',
    defaultName: 'Новый клиент'
  },
  user: {
    name: 'schukina',
    password: 'ev334455',
    email: 'e.v.schukina@kor4.etagi.com'
  },
  lkUser: {
    login: '82347024567',
    password: '123456Q'
  },
  wpUser: {
    login: 'schukina',
    password: 'esouhrepap'
  },
  limit: {
    objects: 15,
    blogPosts: 10,
    nhFlats: 100,
    nhFlatsOpen: 15
  },
  limitSmoke: {
    objects: 1,
    blogPosts: 2,
    blogCats: 3,
    nhFlats: 30,
    nhFlatsOpen: 2
  },
  logs: {
    level: 1000
  },
  objects: { //replaced in spec
    realty: 86055,
    realtyOut: 1228664,
    realtyRent: 1326402,
    commerce: 102789,
    zastr: 107019
  },
  mortgage: {
    program: 'Sberbank/1895'
  },
  mobile: {
    run: 0,
    width: 360,
    height: 640,
    acceptOnGeoCancel: 1
  }
};

module.exports.params = params;

var suites = {
  adm: './Spec/Specs/WPAdmin_Spec.js',
  all: './Spec/Specs/AllPages_Spec.js',
  blog: './Spec/Specs/Blog_Spec.js',
  citySelector: './Spec/Specs/CitySelector_Spec.js',
  console: './Spec/Specs/Console_Spec.js',
  layout: './Spec/Specs/Layout_Spec.js',
  lk: './Spec/Specs/LK_Spec.js',
  mvs: './Spec/Specs/MVS/*',
  search: './Spec/Specs/Search_Spec.js',
  tickets: './Spec/Specs/Tickets_Spec.js',
  searchfilter: './Spec/Specs/SearchFilter_Spec.js',
  part1: ['./Spec/Specs/AllPages_Spec.js',
    './Spec/Specs/Blog_Spec.js',
    './Spec/Specs/WPAdmin_Spec.js',  './Spec/Specs/CitySelector_Spec.js',
    './Spec/Specs/LK_Spec.js'],
  part2: ['./Spec/Specs/Layout_Spec.js', './Spec/Specs/Tickets_Spec.js',
    './Spec/Specs/Search_Spec.js']
};

module.exports.suites = suites;

var jasmineNodeOpts = {
  print: function() {},
  showColors: true,
  defaultTimeoutInterval: 60000000
};

module.exports.jasmineNodeOpts = jasmineNodeOpts;

exports.config = {
  params: params,
  suites: suites,
  jasmineNodeOpts: jasmineNodeOpts,
  directConnect: true,

  framework: 'jasmine2',
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  seleniumServerJar: "selenium-server-standalone-3.0.1.jar",

  capabilities: {
    'browserName': 'chrome',
    /*chromeOptions: {
      mobileEmulation: {
        deviceName: 'Apple iPhone 6 Plus'
      }
    }*/
  },
  specs: ['./Spec/Specs/*_Spec.js'],
  onPrepare: function() {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();
    browser.manage().timeouts().implicitlyWait(1200);
    jasmine.getEnv().addReporter(myReporter);
    jasmine.getEnv().addReporter(htmlScreenshotReporter);
    jasmine.getEnv().addReporter(specReporter);
  },
  beforeLaunch: function() {
    return new Promise(function(resolve){
      htmlScreenshotReporter.beforeLaunch(resolve);
    });
  },
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      htmlScreenshotReporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }
};