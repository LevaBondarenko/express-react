var colors = require('colors');
/* Helpers */
var ph = Object.create(require("../Helpers/pageHelpers.js"));
var sh = Object.create(require("../Helpers/specHelpers.js"));
/* Pages */
var page = Object.create(require("../Pages/Page.js"));
/* Widgets */
var cs = Object.create(require("../Widgets/CitySelectorExtend_Widget.js"));

var interactiveWidgetsCommon = [
  Object.create(require("../Widgets/AuthPanel2_Widget.js")),
  Object.create(require("../Widgets/Menu_Widget.js").additional),
  Object.create(require("../Widgets/ScrollTop_Widget.js"))
];
var interactiveWidgets = [
  Object.create(require("../Widgets/MSearcherCheckButtons_Widget.js")),
  Object.create(require("../Widgets/MSearcherDistricts_Widget.js")),
  Object.create(require("../Widgets/MSearcherTrakts_Widget.js")),
  Object.create(require("../Widgets/Order_Widget.js").callMe),
  Object.create(require("../Widgets/Rieltor_Widget.js")),
  Object.create(require("../Widgets/RieltorCloud_Widget.js")),
  Object.create(require("../Widgets/Slider_Widget.js").builder),
  Object.create(require("../Widgets/Slider_Widget.js").mortgage),
  Object.create(require("../Widgets/Slider2_Widget.js")),
  Object.create(require("../Widgets/SwitcherOnOff_Widget.js")),
  Object.create(require("../Widgets/Switcher_Widget.js"))
];

var smoke = browser.params.smoke;
var level = browser.params.logs.level;
var k = 0;

if(!smoke){
  xdescribe('Консоль', function(){
    beforeAll(function() {
      sh.getCitiesFromApi();
    });

    it('Консоль', function(){
      var printLogs = function(page, city, common){
        page.get(city ? city : 'www');

        var activateWidgets = function(widgetsArray){
          widgetsArray.forEach(function(widget){
            widget.displayed().then(function(result){
              if(result){
                widget.activate();
              }
            });
          });
        }

        /*activateWidgets(interactiveWidgets);
        if(common){
         activateWidgets(interactiveWidgetsCommon);
        };*/

        browser.getCurrentUrl().then(function(url){
          browser.manage().logs().get('browser').then(function(browserLog){
            var errors = browserLog.filter(function(elem){
              return elem.level.value === 1000;
            });
            var warnings = browserLog.filter(function(elem){
              return elem.level.value === 900;
            });
            var info = browserLog.filter(function(elem){
              return elem.level.value === 800;
            });
            var other = browserLog.filter(function(elem){
              return elem.level.value <= 700;
            });


            var a = 0;
            var printed = false;
            var printLog = function(logArray, message){
              if(logArray.length > 0){
                if(!printed){
                  console.log('');
                  console.log(((++k + '. ').grey + url).bold);
                  printed = true;
                }
                if(level < 1000){
                  console.log((k + '.' + ++a + '. ').grey
                    + message);
                }
                var i = 0;
                logArray.forEach(function(log){
                  console.log((k + '.' + (level === 1000 ? '' : a + '.')
                    + ++i + '. ').grey + log.message);
                });
              }
            }

            printLog(errors, 'Errors'.red);
            if(level < 1000){
              printLog(warnings, 'Warnings'.yellow);
              if(level < 900){
                printLog(info, 'Info'.green);
                if(level < 800){
                  printLog(other, 'Other'.white);
                }
              }
            }
          });
        });
      }

      printLogs(page.main, null, true);
      printLogs(page.realty);
      printLogs(page.realtyOut);
      printLogs(page.realtyRent);
      printLogs(page.commerce);
      printLogs(page.zastr);
      printLogs(page.realtySearch);
      printLogs(page.realtyOutSearch);
      printLogs(page.realtyRentSearch);
      printLogs(page.commerceSearch);
      printLogs(page.zastrSearch);
      printLogs(page.realtyObject);
      printLogs(page.realtyOutObject);
      printLogs(page.realtyRentObject);
      printLogs(page.commerceObject);
      printLogs(page.zastrObject);
      printLogs(page.mortgagelanding);
      printLogs(page.students);
      printLogs(page.rentNh);
      printLogs(page.forTheLandlord);
      printLogs(page.forTheSeller);
      printLogs(page.deals);
      printLogs(page.thankYou);
      printLogs(page.job);
      printLogs(page.blog);
      printLogs(page.vtb);
      printLogs(page.turnkey);
      printLogs(page.objectNotFound);
    });
  })

}
