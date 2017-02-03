module.exports = require("./Widget.js").extend({
  keyElement: $$('.scrolltop--wrapper'),
  button: $('#toTop i'),

  scrollTop: function(){
    var self = this;
    this.button.isDisplayed().then(function(res){
      if(res){
        self.button.click();
      }
    });
  },
  activate: function(){
    this.scrollTop();
  }
});