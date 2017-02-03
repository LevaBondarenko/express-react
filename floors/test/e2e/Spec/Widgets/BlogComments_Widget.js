module.exports = require("./Widget.js").extend({
  counter: $('.blogcomments-wrapper .comments--header--counter'),
  commentForm: $('br + .comments--wrapper'),
  name: $('.commentsName'),
  nameInput: $('.commentsName--input'),
  commentInput: $('textarea'),
  commentInputDisabled: $('.comments--commentfield--input textarea[disabled]'),
  field: $('.comments--commentfield--input'),
  publishButton: $('.comments--commentfield--button button:not(.disabledButton)'),
  publishButtonDisabled: $('.comments--commentfield--button .disabledButton'),
  comments: $$('.blogcomments-wrapper .blogComment'),
  firstComments: $$('.blogcomments-wrapper .blogFirstComment'),
  commentReplyForm: $('.comments--comment--replyform .comments--wrapper'),

  author: '.comments--comment--author',
  time: '.comments--comment--time',
  content: '.comments--comment--content',
  votes: 'i.fa-thumbs-up + span',
  reply: 'i.fa-comments + a',
  avatar: '.comments--avatar img',

  getCount: function(item){
    return this.counter.getText();
  },

  getName: function(){
    return this.commentForm.element(this.name.locator()).getText();
  },
  getNameInputPlaceholder: function(){
    return this.commentForm.element(this.nameInput.locator())
      .getAttribute('placeholder');
  },
  getCommentInputPlaceholder: function(){
    return this.commentForm.element(this.commentInput.locator())
      .getAttribute('placeholder');
  },
  setName: function(name){
    return this.commentForm.element(this.nameInput.locator()).sendKeys(name);
  },
  setComment: function(comment){
    return this.commentForm.element(this.commentInput.locator()).sendKeys(comment);
  },
  publishComment: function(){
    return this.commentForm.element(this.publishButton.locator()).click();
  },
  buttonDisabled: function(){
    return this.commentForm.element(this.publishButtonDisabled.locator())
      .isPresent();
  },
  commentsDisabled: function(){
    return this.commentForm.element(this.commentInputDisabled.locator())
      .isPresent();
  },

  getComments: function(){
    return this.comments;
  },
  getCommentsCount: function(){
    return this.comments.count();
  },
  getFirstComments: function(){
    return this.firstComments;
  },
  getFirstCommentsCount: function(){
    return this.firstComments.count();
  },
  getAuthor: function(comment){
    return comment.$$(this.author).first().getText();
  },
  getTime: function(comment){
    return comment.$$(this.time).first().getText();
  },
  getContent: function(comment){
    return comment.$$(this.content).first().getText();
  },
  getVotes: function(comment){
    return comment.$$(this.votes).first().getText();
  },
  getReplyBtnText: function(comment){
    return comment.$$(this.reply).first().getText();
  },
  openReplyForm: function(comment){
    comment.$$(this.reply).first().click();
  },
  getAvatarUrl: function(comment){
    return comment.$$(this.avatar).first().getAttribute('src');
  },
  hasReplyForm: function(comment){
    return comment.element(this.commentReplyForm.locator()).isPresent();
  }
});