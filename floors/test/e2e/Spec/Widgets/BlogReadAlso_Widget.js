module.exports = require("./Widget.js").extend({
  keyElement: $$('.blog-readalso-wrapper > div > p'),
  title: $('.blog-readalso-wrapper > div > p'),
  items: $$('.readAlsoItem'),
  image: $('.readAlsoItem--image'),
  name: $('.readAlsoItem--title'),
  readMore: $('.readAlsoItem--infobar--button'),
  views: $('.postCounter > span:first-child'),
  comments: $('.postCounter > span:last-child'),

  getTitle: function(){
    return this.title.getText();
  },
  getItems: function(){
    return this.items;
  },
  getItemsCount: function(){
    return this.items.count();
  },
  hasImage: function(item){
    return item.element(this.image.locator()).isPresent();
  },
  getName: function(item){
    return item.element(this.name.locator()).getText();
  },
  getViews: function(item){
    return item.element(this.views.locator()).getText();
  },
  getComments: function(item){
    return item.element(this.comments.locator()).getText();
  },
  clickReadMore: function(item){
    return item.element(this.readMore.locator()).click();
  }
});