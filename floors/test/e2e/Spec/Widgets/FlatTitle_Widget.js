var Widget = require("./Widget.js");
var wh = Object.create(require("../Helpers/waitHelpers.js"));

var FlatTitleWidget = Widget.extend({
  objectTitle: $('.flatTitle_name'),
  objectAddress: $('.flatTitle_flatInfo'),
  objectAddressIcon: $('.flatTitle_mapIcon'),
  fav: element(by.partialButtonText('В избранное')),
  compare: element(by.partialButtonText('К сравнению')),
  auction: element(by.partialButtonText(' Предложить свою цену')),
  favAdded: $('.in-fav'),

  getTitle: function(){
    return this.objectTitle.getText();
  },
  getAddress: function(){
    return this.objectAddress.getText();
  },
  hasAddressIcon: function(){
    return this.objectAddressIcon.isPresent();
  },
  hasFavorite: function(){
    return this.fav.isPresent();
  },
  hasCompare: function(){
    return this.compare.isPresent();
  },
  hasAuction: function(){
    return this.auction.isPresent();
  },
  clickFav: function(){
    this.fav.click();
    wh.waitPresence(this.favAdded);
  },
  addedToFav: function(){
    return this.favAdded.isPresent();
  }
});

module.exports = FlatTitleWidget;