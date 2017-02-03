module.exports = require("./Widget.js").extend({
  items: $$('section[id^="breadcrumbs_"] li'),
  activePage: $('section[id^="breadcrumbs_"] li:last-child'),

  getItemsCount: function(){
    return this.items.count();
  },
  getText: function(index){
    return this.items.get(index).getText();
  },
  gatActivePage: function(index){
    return this.activePage.getText();
  }
});