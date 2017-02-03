module.exports = require("./Widget.js").extend({
  fb: $('.postSocial a.ico-soc--fb'),
  vk: $('.postSocial a.ico-soc--vk'),
  content: $('.blogpost-wrapper > div > div:not(.postFooter)'),

  hasFb: function(){
    return this.fb.isPresent();
  },
  hasVk: function(){
    return this.vk.isPresent();
  },
  getContent: function(){
    return this.content.getText();
  },
});