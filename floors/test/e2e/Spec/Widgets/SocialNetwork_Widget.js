module.exports = require("./Widget.js").extend({
  socials: $$('.blogtitle-wrapper + .socialnetwork-wrapper a.ico-bg'),

  getSocials: function(){
    return this.socials;
  },
  clickSocial: function(social){
   social.click();
  },
  getSocialLink: function(social){
   return social.getAttribute('href');
  }
});