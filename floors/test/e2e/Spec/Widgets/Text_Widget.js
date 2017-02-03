module.exports = require("./Widget.js").extend({
  keyElement: $$('.content .textwidget'),
  txt: $$('.content .textwidget'),

  verify: function(){
    this.txt.each(function(widget){
      widget.getText().then(function(res){
        expect(res.trim()).not.toBe("");
      });
    });
  }
});