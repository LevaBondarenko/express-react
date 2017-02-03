var bsParams = Object.create(require("./bsParams.js"));

exports.config = require("./protractor.conf.js").config.extend({
  seleniumAddress:  'http://hub-cloud.browserstack.com/wd/hub',
  multiCapabilities: [{
    'browserName': 'Chrome',
    'browser_version': '51.0',
    'browserstack.user': bsParams.user,
    'browserstack.key': bsParams.key,
    'project': bsParams.project,
    'build': bsParams.build,
    'browserstack.local': bsParams.local,
    'os': 'Windows',
    'os_version': '7',
    'resolution': '1920x1080',
    'browserstack.debug': 'true'
  }, {
    'browserName': 'Chrome',
    'browser_version': '49.0',
    'browserstack.user': bsParams.user,
    'browserstack.key': bsParams.key,
    'project': bsParams.project,
    'build': bsParams.build,
    'browserstack.local': bsParams.local,
    'os': 'Windows',
    'os_version': '7',
    'resolution': '1920x1080',
    'browserstack.debug': 'true'
  }]
});