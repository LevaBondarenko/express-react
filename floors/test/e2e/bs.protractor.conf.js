var SpecReporter = require('jasmine-spec-reporter');
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var h = Object.create(require("./Spec/Helpers/helpers.js"));
var conf = Object.create(require("./protractor.conf.js"));

var request = require("request");
var f = false;

var reporter = new HtmlScreenshotReporter({
  dest: './Report/BS.' + h.getToday(),
  filename: 'bs-report.html',
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

exports.config = {
  framework: 'jasmine',
  specs: ['./Spec/Specs/*_Spec.js'],
  params: conf.params,
  suites: conf.suites,
  jasmineNodeOpts: conf.jasmineNodeOpts,

  seleniumAddress:  'http://hub-cloud.browserstack.com/wd/hub',
  capabilities: {
    'browserstack.user': 'helen104',
    'browserstack.key': 'PscYqagNnsXsyw9a4j8C',
    'project': 'etagi.com [test]',
    'build': 'test',
    'browserName': 'Chrome',
    'browser_version': '55.0',
    'os': 'Windows',
    'os_version': '7',
    'resolution': '1920x1080',
    'browserstack.debug': 'true',
    'browserstack.local': 'false',
    'browserstack.video': 'false'
  },
  onPrepare: function() {
    browser.ignoreSynchronization = true;
    jasmine.getEnv().addReporter(conf.myReporter);
    jasmine.getEnv().addReporter(reporter);
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: 'summary',
      displaySpecDuration: true,
      displaySuiteNumber: true
    }));
    jasmine.getEnv().addReporter(new function(){
      this.specDone = function(result){
        if(result.failedExpectations.length > 0){
          f = true;
        }
      },
      this.suiteDone = function(result){
        if(f){
          browser.driver.session_.then(function(sessionData) {
            request({
              uri: "https://helen104:PscYqagNnsXsyw9a4j8C@www.browserstack.com/automate/sessions/" + sessionData.id_ + ".json",
              method: "PUT",
              form: {
                "status": "error",
                "reason": ""
              }
            })
          });
        }
      };
    });
    browser.driver.manage().window().maximize();
    browser.manage().timeouts().implicitlyWait(5000);
  },
  beforeLaunch: function() {
    return new Promise(function(resolve){
      reporter.beforeLaunch(resolve);
    });
  },
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      reporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }
};