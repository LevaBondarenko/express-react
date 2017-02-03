var OrderWidget = require("./Order_Widget.js");
var wh = Object.create(require("../Helpers/waitHelpers.js"));

var RieltorCloudWidget = OrderWidget.modal.extend({
  name: 'Облако риэлторов',
  container: $$('.rieltorCloud_modalForm'),
  submitBtn: $('.rieltorCloud_submit'),
  button: $$('button.rieltorCloud_button__order'),
  closeButton: $('.rieltorCloud_modalClose'),
  keyElement: $$('button.rieltorCloud_button__order'),
  hasNameField: true,
  mayBeMissing: true,
  phoneFormat: 2,
  widget: 'cloud',

  rieltors: $$('.rieltorCloud_rieltor'),

  selectRieltor: function(index){
    wh.waitClickable(this.rieltors.get(index));
    this.rieltors.get(index).click();
  },
  openDialog: function(){
    this.button.click();
  },
  closeDialog: function(){
    wh.waitClickable(this.closeButton);
    this.closeButton.click();
  },
  activate: function(){
    this.selectRieltor(0);
    this.openDialog();
    this.closeDialog();
  }
});

module.exports = RieltorCloudWidget;

