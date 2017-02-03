module.exports = require("./Widget.js").extend({
  views: $('div.blogreading-wrapper > .blog-inline-block > .postCounter > span:first-child'),
  comments: $('div.blogreading-wrapper > .blog-inline-block > .postCounter > span:last-child'),
  label: $('div.blogreading-wrapper .postCounter-text'),
  labelMin: $('div.blogreading-wrapper > .postCounter'),
  iviews: $('div.blogreading-wrapper i.fa-eye'),
  icomments: $('div.blogreading-wrapper i.fa-comments'),
  noTimeToReadButton: $('.noTimeToReadButton'),
  readLaterInput: $('.readLaterSendform input.readLaterInput'),
  readLaterConfirm: $('.readLaterSendform .readLaterConfirmButton'),
  readLaterLabel: $('.readLaterSendform > div:first-child'),
  helpBlock: $('.blogreading-wrapper .help-block'),
  subscribed: $('.blogreading-wrapper .blog--subscribe--main--subscribed h3'),
  subscribed2: $('.blogreading-wrapper .blog--subscribe--main--subscribed p'),

  getViews: function(){
    // this.wh.waitNotEmpty(this.views);
    return this.views.getText();
  },
  getComments: function(){
    return this.comments.getText();
  },
  getLabel: function(){
    return this.label.getText();
  },
  getLabelMin: function(){
    this.wh.waitTextPresence(this.labelMin, 'мин');
    return this.labelMin.getText();
  },
  hasViewsIcon: function(){
    return this.iviews.isPresent();
  },
  hasCommentsIcon: function(){
    return this.icomments.isPresent();
  },
  toggleNoTimeToRead: function(){
    this.noTimeToReadButton.click();
  },
  getNoTimeToReadBtnText: function(){
    return this.noTimeToReadButton.getText();
  },
  getNoTimeToReadLabel: function(){
    return this.readLaterLabel.getText();
  },
  getHelpBlock: function(){
    return this.helpBlock.getText();
  },
  getSubscribed: function(){
    return this.subscribed.getText();
  },
  getSubscribed2: function(){
    return this.subscribed2.getText();
  },
  hasReadLaterInput: function(){
    return this.readLaterInput.isPresent();
  },
  setEmail: function(email){
    this.wh.waitClickable(this.readLaterInput);
    this.readLaterInput.clear();
    this.readLaterInput.sendKeys(email);
  },
  hasReadLaterConfirm: function(){
    return this.readLaterConfirm.isPresent();
  },
  clickReadLaterConfirm: function(){
    this.readLaterConfirm.click();
  }
});