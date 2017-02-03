var wh = Object.create(require("../Helpers/waitHelpers.js"));

module.exports = require("./Widget.js").extend({
  items: $$('.blog--item'),
  photo: $('.blog--item--img'),
  title: $('.blog--item--title'),
  image: $('.blog--item--img a img'),
  info: $('.postInfo'),
  excerpt: $('.postExcerpt'),
  fb: $('.postSocial a.ico-soc--fb'),
  vk: $('.postSocial a.ico-soc--vk'),
  readMore: $('.readMoreButton'),
  views: $('.postCounter > span:first-child'),
  comments: $('.postCounter > span:last-child'),
  loader: $('.loader-inner'),

  getItemsCount: function(){
    return this.items.count();
  },
  getItems: function(){
    return this.items;
  },
  getItemTitle: function(index){
    return this.items.get(index).element(this.title.locator()).getText();
  },
  getItemInfo: function(item){
    return item.element(this.info.locator()).getText();
  },
  getItemExcerpt: function(item){
    return item.element(this.excerpt.locator()).getText();
  },
  getItemViews: function(index){
    return this.items.get(index).element(this.views.locator()).getText();
  },
  getItemComments: function(index){
    return this.items.get(index).element(this.comments.locator()).getText();
  },
  hasFb: function(item){
    return item.element(this.fb.locator()).isPresent();
  },
  hasVk: function(item){
    return item.element(this.vk.locator()).isPresent();
  },
  hasImage: function(item){
    return item.element(this.image.locator()).isPresent();
  },
  getItemLink: function(item){
    return item.element(this.readMore.locator()).getAttribute('href');
  },
  getItemImageLink: function(item){
    return item.element(this.image.locator()).getAttribute('src');
  },
  open: function(index){
    return this.items.get(index).element(this.readMore.locator()).click();
  },
  waitNoLoader: function(){
    wh.waitNotPresence(this.loader);
  }
});