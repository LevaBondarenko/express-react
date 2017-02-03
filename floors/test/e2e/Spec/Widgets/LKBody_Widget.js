var Widget = require("./Widget.js");
var waitHelpers = require("../Helpers/waitHelpers.js");
var wh = Object.create(waitHelpers);

var LKBodyWidget = Widget.extend({
  favs: $$('.in-fav'),
  soldFavs: element.all(by.partialButtonText('Удалить из избранного')),
  fav: $('.in-fav'),
  yesDel: $('.lkform-compose button:last-child'),
  menuFavTitle: $('.lkmenu a[data-link="favorites"] span'),
  filterCount: $('.lkbody-typeselector-count'),
  shareBtn: $('.lkbody-toolbar button'),
  shareText: $('.lk-popup textarea'),
  shareCopyBtn: $('.lk-popup button.btn-primary'),
  shareNewBtn: $('.lk-popup button:not(.btn-primary)'),
  commentView: $('.objects--item__nomap--comment-text'),
  commentEdit: $('.objects--item__nomap--comment-text textarea'),
  commentSave: $('.objects--item__nomap--comment-controls button.btn-default'),
  commentCancel: $('.objects--item__nomap--comment-controls button:not(.btn-default)'),
  commentDelete: $('.objects--item__nomap--comment-controls .btn-link'),
  pageTitle: $('.lkbody-pagetitle'),
  menuArr: {
    realty: 'flats',
    zastr: 'nh_flats',
    realty_out: 'cottages',
    commerce: 'offices',
    realty_rent: 'rent'
  },
  profile: {
    name: $('input[label="Имя"]'),
    savePersonalDataBtn: element(by.partialButtonText('Сохранить изменения'))
  },

  setProfileName: function(name){
    this.profile.name.clear();
    this.profile.name.sendKeys(name);
  },

  getProfileName: function(){
    return this.profile.name.getAttribute('value');
  },

  savePersonalData: function(){
    this.profile.savePersonalDataBtn.click();
  },

  getPageTitle: function(){
    return this.pageTitle.getText();
  },

  getFavs: function(){
    return this.favs;
  },

  getSoldFavs: function(){
    return this.soldFavs;
  },

  confirmDeletion: function(){
    this.yesDel.click();
    wh.waitNotPresence(this.yesDel);
  },

  deleteFav: function(index) {
    this.favs.get(index).click();
    wh.waitClickable(this.yesDel);
  },

  deleteSoldFav: function(index) {
    this.soldFavs.get(index).click();
    wh.waitClickable(this.yesDel);
  },

  objectPresent: function(code, page) {
    return $('div#' + this.menuArr[page] + '-' + code).isPresent();
  },

  clickFavByCode: function(code, page) { 
    $('div#' + this.menuArr[page] + '-' + code).element(this.fav.locator()).click();
    wh.waitClickable(this.yesDel);
  },

  getFavCount: function(page){
    return $('button[data-favtype="' + this.menuArr[page] + '"]').element(this.filterCount.locator()).getText();
  },

  getMenuFavTitle: function(){
    return this.menuFavTitle.getText();
  },

  share: function(){
    this.shareBtn.click();
    wh.waitPresence(this.shareCopyBtn);
    wh.wait(3);
  },

  shareCopy: function(){
    this.shareCopyBtn.click();
    wh.waitNotPresence(this.shareText);
  },

  shareNew: function(){
    this.shareNewBtn.click();
    wh.wait();
  },

  clickComment: function(){
    this.commentView.click();
    wh.waitPresence(this.commentEdit);
  },

  getComment: function(){
    return this.commentView.getText();
  },

  saveComment: function(){
    this.commentSave.click();
    wh.waitNotPresence(this.commentEdit);
  },

  cancelComment: function(){
    this.commentCancel.click();
    wh.waitNotPresence(this.commentEdit);
  },

  editComment: function(text){
    this.commentEdit.sendKeys(text);
  },

  deleteComment: function(){
    this.commentDelete.click();
    wh.waitInvisibility(this.commentDelete);
  },

  pasteComment: function(){
    this.commentEdit.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "v"));
    wh.wait(2);
  }
});

module.exports = LKBodyWidget;