var Widget = require("./Widget.js");

var wh = Object.create(require("../Helpers/waitHelpers.js"));

var SearchLayoutWidget = Widget.extend({
  /* paging */
  nextPage: $('li.next a:not(.disabled)'),
  prevPage: $('li.previous a:not(.disabled)'),
  paging: $('.etagiPaging'),
  selectedPage: $('.etagiPaging li.selected'),
  /* sorting */
  sortingBtn: $('.btn-group--etagi'),
  sortingType: $('.btn-group--etagi li'),
  /* dateFilter */
  dateFilterButtons: $$('.dateFilter--item'),
  dateFilterActive: $('li.activeItem'),
  /* objects */
  objects: $$('div.objects--item__nomap'),
  objectLocations: $$('div.objects--item__nomap p.adress'),
  objectRatings: $$('div.objects--item__nomap .RatingBlock button p span:first-child'),
  objectHeaders: $$('div.objects--item__nomap h3 a'),
  objectFavs: $$('.objects--item__nomap .btn-fav:not(.in-fav)'),
  objectFavsAdded: $$('div.objects--item__nomap .btn-fav.in-fav'),
  objectBuilders: $$('div.objects--item__nomap .item--description .row p:nth-child(2) a'),
  objectDiscounts: $$('div.objects--item__nomap .item--oldprice > span:first-child'),
  objectPrices: $$('div.objects--item__nomap .item--price > span:first-child'),
  objectToCenters: $$('div.objects--item__nomap .adress--tocenter'),
  objectAllParams: $$('div.objects--item__nomap .item--description .row'),
  objectSquares: $$('div.objects--item__nomap .item--description .row > div:first-child p:first-child'),
  objectDeadlines: $$('.item--description .row div:first-child p:last-child'),
  objectFloors: $$('.item--description .row div:nth-child(2) p:last-child'),
  objectLink: $('h3 a'),
  objectBuilderLink: $('.item--description .row p a'),
  objectPrice: $('.item--price > span:first-child'),
  objectOldPrice: $('.item--oldprice > span:first-child'),
  objectDescription: $('.objectNote'),
  objectDiscount: $('.item--oldprice > span:first-child'),
  objectAddres: $('.glyphicon-map-marker'),
  objectPhoto: $('.img-responsive'),
  objectParams: $('.item--description'),
  /* zastr */
  zastrMinPrices: $$('div.objects--item__nomap .item--price > span:nth-child(2)'),
  zastrTableRooms: $$('.item--flatstable tr td:nth-child(1)'),
  zastrTableSquares: $$('.item--flatstable tr td:nth-child(2)'),
  zastrTablePrices: $$('.item--flatstable tr td:nth-child(3)'),

  clickObjLink: function(index){
    this.objects.get(index).element(this.objectLink.locator()).click();
  },

  clickBuilderLink: function(index){
    this.objects.get(index).element(this.objectBuilderLink.locator()).click();
  },

  hasObj: function(index){
    return this.objects.get(index).isPresent();
  },

  getObjectLink: function(index){
    return this.objects.get(index).element(this.objectLink.locator()).getAttribute('href');
  },

  addToFav: function(index){
    this.objectFavs.get(index).click();
    wh.waitPresence(this.objects.get(index)
      .element(this.objectFavsAdded.locator()), null, 5000);
  },

  hasBuilderLink: function(index){
    return this.objects.get(index).element(this.objectBuilderLink.locator()).isPresent();
  },

  getBuilderLink: function(index){
    return this.objects.get(index).element(this.objectBuilderLink.locator()).getAttribute('href');
  },

  /* object data */

  getObject: function(index){
    return this.objects.get(index);
  },

  clickObj: function(object){
    object.element(this.objectLink.locator()).click();
    return object.element(this.objectLink.locator()).getAttribute('href');
  },

  getObjectTitle: function(object){
    return object.element(this.objectLink.locator()).getText();
  },

  getObjectPrice: function(object){
    return object.element(this.objectPrice.locator()).getText();
  },

  getObjectOldPrice: function(object){
    return object.element(this.objectOldPrice.locator()).getText();
  },

  getObjectDescription: function(object){
    return object.element(this.objectDescription.locator()).getText();
  },
  hasObjectDescription: function(object){
    return object.element(this.objectDescription.locator()).isPresent();
  },

  hasDiscount: function(object){
    return object.element(this.objectDiscount.locator()).isPresent();
  },

  getObjectAddress: function(object){
    return object.element(this.objectAddres.locator()).getText();
  },

  getObjectPhoto: function(object){
    return object.element(this.objectPhoto.locator()).getAttribute('src');
  },

  getSingleObjectParams: function(object){
    return object.element(this.objectParams.locator()).getText();
  },

  /* ----- */

  getObjectsCount: function(){
    return this.objects.count();
  },

  getObjectsDiscountCount: function(){
    return this.objectDiscounts.count();
  },

  getObjects: function(){
    return this.objects;
  },

  getObjectHeaders: function(){
    return this.objectHeaders;
  },

  getObjectBuilders: function(){
    return this.objectBuilders;
  },

  getObjectPrices: function(){
    return this.objectPrices;
  },

  getObjectDeadlines: function(){
    return this.objectDeadlines;
  },

  getObjectSquares: function(){
    return this.objectSquares;
  },

  getObjectToCenters: function(){
    return this.objectToCenters;
  },

  getObjectParams: function(){
    return this.objectAllParams;
  },

  getObjectLocations: function(){
    return this.objectLocations;
  },

  getObjectRatings: function(){
    return this.objectRatings;
  },


  getObjectFloors: function(){
    return this.objectFloors;
  },

  /* zastr */

  getZastrMinPrices: function(){
    return this.zastrMinPrices;
  },

  getZastrTablePrices: function(){
    return this.zastrTablePrices;
  },

  getZastrTableSquares: function(){
    return this.zastrTableSquares;
  },

  getZastrTableRooms: function(){
    return this.zastrTableRooms;
  },

  /* paging */

  hasPaging: function(){
    return this.nextPage.isPresent();
  },

  getSelectedPage: function(){
    return this.selectedPage.getText();
  },

  getNextPage: function(){
    this.nextPage.click();
    wh.wait();
  },

  getPrevPage: function(){
    this.prevPage.click();
    wh.wait();
  },

  /* sorting */

  openSortingTypesList: function(){
    this.sortingBtn.click();
  },

  selectSortingType: function(type){
    $('.btn-group--etagi li a[href="' + type + '"]').click();
    wh.wait();
  },

  /* date filter */

  clickDateFilterButton: function(button){
    this.button.click();
    wh.wait();
  },

  isDateFilterButtonSelected: function(index){
    return this.dateFilterButtons.get(index).element(this.dateFilterActive.locator()).isPresent();
  },

  getDateFilterButtonText: function(button){
    return this.button.getText();
  },

  getDateFilterButtonsCount: function(){
    return this.dateFilterButtons.count();
  },

  getDateFilterButtons: function(){
    return this.dateFilterButtons;
  }
});

module.exports = SearchLayoutWidget;


module.exports.navigation = Widget.extend({
  dateCounter: $('#DropdownButton-period'),

  getDateCounter: function() {
    return this.getText(this.dateCounter);
  }
});
