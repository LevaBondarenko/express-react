module.exports = require("./Widget.js").extend({
  programLinks: $$('.mortgagesearchresult--wrapper td[title] > a'),
  bankLinks: $$('.mortgagesearchresult--wrapper td:nth-child(2) > a'),

  getProgramLink: function(index) {
    return this.programLinks.get(index).getAttribute('href');
  },
  getBankLink: function(index) {
    return this.bankLinks.get(index).getAttribute('href');
  }
});