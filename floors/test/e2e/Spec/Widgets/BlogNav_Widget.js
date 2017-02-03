module.exports = require("./Widget.js").extend({
  title1: $('.blog--nav > div:first-child h3'),
  title2: $('.blog--nav > div:last-child h3'),
  cats: $$('.blog--nav--category'),
  catName: $('.blog--nav--item a'),
  catNum: $('.blog--nav--count'),
  catActive: $('.blog--nav--item--selected'),
  catNumActive: $('.blog--nav--count--selected'),

  getTitle1: function(){
    return this.title1.getText();
  },
  getTitle2: function(){
    return this.title2.getText();
  },
  getCats: function(){
    return this.cats;
  },
  clickCat: function(index){
    this.cats.get(index).element(this.catName.locator()).click();
  },
  getCatName: function(index){
    return this.cats.get(index).element(this.catName.locator()).getText();
  },
  getCatNum: function(index){
    return this.cats.get(index).element(this.catNum.locator()).getText();
  },
  isCatActive: function(index){
    return this.cats.get(index).element(this.catActive.locator()).isPresent();
  },
  isCatNumActive: function(index){
    return this.cats.get(index).element(this.catNumActive.locator()).isPresent();
  }
});