module.exports = require("./Widget.js").extend({
  all: $$('section[class*="filter"]'),
  allGroups: $$('section.filtergroupswitcher--wrapper'),

  getAllWidgets: function() {
    return this.all;
  },
  getAllGroups: function() {
    return this.allGroups;
  },
  getGroupName: function(wIndex) {
    return this.getText(this.allGroups.get(wIndex).$('.filter-block-title'));
  },
  getId: function(wIndex) {
    return this.getAttribute(this.all.get(wIndex), "id");
  },
  getClass: function(wIndex) {
    return this.getAttribute(this.all.get(wIndex), "class");
  },
  clear: function(wIndex) {
    return this.click(this.all.get(wIndex).$('a.clear-filter-block'));
  },
  hasClearBtn: function(wIndex) {
    return this.isPresent(this.all.get(wIndex).$('a.clear-filter-block'));
  }
});
