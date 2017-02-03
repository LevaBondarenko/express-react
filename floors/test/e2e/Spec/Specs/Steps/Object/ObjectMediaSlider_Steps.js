var Element = require("../../../Common/Element.js");
/* Widgets */
var ms = Object.create(require("../../../Widgets/MediaSlider_Widget.js"));

var activeClass = 'swiper-slide-active';

module.exports = Element.extend({
  verify: function(){
    var testMS = function(tab){
      ms.hasTab(tab).then(function(result){
        if(result){
          ms.clickTab(tab);
          ms.getActiveTabLabel().then(function(label){
            var count = parseInt(label.split('(')[1].split(')')[0]);
            ms.getItemsCount().then(function(res){
              expect(count).toBe(res);
            });
            ms.getItemsThumbsCount().then(function(res){
              expect(count).toBe(res);
            });

            if(count === 1){
              expect(ms.hasNextBtn()).toBe(false);
              expect(ms.hasPrevBtn()).toBe(false);
            } else {
              ms.clickNextBtn();
              ms.clickPrevBtn();

              ms.getItemsThumbs().each(function(item, index){
                expect(ms.getThumbNum(index)).toBe(String(index + 1));
              });
            }
          });
        }
      });
    }

    testMS('photos');
    testMS('layouts');
    testMS('tours');
  }
});