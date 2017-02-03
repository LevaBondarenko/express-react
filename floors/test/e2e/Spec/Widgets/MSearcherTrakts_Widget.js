var wh = Object.create(require("../Helpers/waitHelpers.js"));

var MSearcherTraktsWidget = require("./Widget.js").extend({
  openDialogBtn: $('button[data-field="trakts"]'),
  keyElement: $$('button[data-field="trakts"]'),
  trakts: $$('.mapTraktItem i'),
  selectedTrakts: $$('.mapTraktItem i:not(.partially) + span'),
  traktsLabels: $$('.mapTraktItem i.partially + span'),
  districts: $$('.districtItem i'),
  selectBtn: $('button.mapTraktSelect'),
  closeBtn: $('.modal-dialog .etagi--closeBtn'),
  selectedTag: $('.mapTraktGreyBtns_chosen'),

  openDialog: function(){
    this.openDialogBtn.click();
    wh.wait();
  },
  closeDialog: function(){
    wh.waitClickable(this.closeBtn);
    this.closeBtn.click();
  },
  clickTrakt: function(index){
    this.trakts.get(index).click();
  },
  clickDistrict: function(index){
    this.districts.get(index).click();
  },
  clickTraktLabel: function(index){
    this.traktsLabels.get(index).click();
  },
  select: function(){
    this.selectBtn.click();
  },
  getSelectedCount: function(){
    return this.openDialogBtn.getText();
  },
  getSelectedTagCount: function(){
    return this.selectedTag.getText();
  },
  getSelectedTrakts: function(){
    return this.selectedTrakts;
  },
  activate: function(){
    this.openDialog();
    this.clickTrakt(0);
    this.clickDistrict(0);
    this.closeDialog();
  }
});

module.exports = MSearcherTraktsWidget;