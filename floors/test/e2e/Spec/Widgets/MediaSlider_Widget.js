var Widget = require("./Widget.js");
var wh = Object.create(require("../Helpers/waitHelpers.js"));

module.exports = Widget.extend({
  activeTab: $('.control-mode-ms button.active'),
  control: $('.control-mode-ms'), 
  items: $$('.gallery-top .swiper-slide:not(.swiper-slide-duplicate)'),
  itemsThumbs: $$('.gallery-thumbs .swiper-slide:not(.swiper-slide-duplicate)'),
  thumbNum: $('span:not(.thumb-background)'),
  nextBtn: $('div[id^="swnext"]'),
  prevBtn: $('div[id^="swprev"]'),

  hasTab: function(type){
    return $('button[data-view="' + type + '"]').isPresent();
  },

  clickTab: function(type){
    $('button[data-view="' + type + '"]').click();
    wh.wait();
  },

  hasNextBtn: function(){
    return this.nextBtn.isDisplayed();
  },
  hasPrevBtn: function(){
    return this.prevBtn.isDisplayed();
  },

  clickNextBtn: function(){
    wh.waitClickable(this.nextBtn);
    this.nextBtn.click();
  },
  clickPrevBtn: function(){
    wh.waitClickable(this.prevBtn);
    this.prevBtn.click();
  },

  getActiveTabLabel: function(){
    return this.activeTab.getText();
  },
  getItemsCount: function(){
    return this.items.count();
  },
  getItemsThumbsCount: function(){
    return this.itemsThumbs.count();
  },

  getItemsThumbs: function(){
    return this.itemsThumbs;
  },
  getThumbNum: function(index){
    return this.itemsThumbs.get(index).element(this.thumbNum.locator()).getInnerHtml();
  },
  clickThumb: function(index){
    return this.itemsThumbs.get(index).click();
  },
  getThumbClass: function(index){
    return this.itemsThumbs.get(index).getAttribute('class');
  }
});