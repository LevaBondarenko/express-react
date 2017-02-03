module.exports = require("./Widget.js").extend({
  keyElement: $$('.numberCounter'),

  number: $$('.numberCounter .numberCounter--number'),
  textDown: $$('.numberCounter .numberCounter--textDown'),
  textUp: $$('.numberCounter .numberCounter--textUp'),

  getNumber: function(index){
    return this.number.get(index).getText();
  },
  getTextDown: function(index){
    return this.textDown.get(index).getText();
  },
  getTextUp: function(index){
    return this.textUp.get(index).getText();
  },

  verify: function(){
    browser.executeScript('window.scrollTo(0,1000);');

    for(var i = 0; i < 4; i++){
      this.getNumber(i).then(function(res){
        expect(res.trim()).not.toBe("");
      });
      this.getTextDown(i).then(function(res){
        expect(res.trim()).not.toBe("");
      });
    }
  }
});