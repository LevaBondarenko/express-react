/* Helpers */
var ph = Object.create(require("../Helpers/pageHelpers.js"));
var sh = Object.create(require("../Helpers/specHelpers.js"));
/* Pages */
var page = Object.create(require("../Pages/Page.js"));
/* Steps */
var price = Object.create(require("./Steps/Layout/LayoutPrice_Steps.js"));
var discount = Object.create(require("./Steps/Layout/LayoutDiscount_Steps.js"));
var title = Object.create(require("./Steps/Layout/LayoutTitle_Steps.js"));
var newMediaSlider = Object.create(require("./Steps/Object/ObjectNewMediaSlider_Steps.js"));
var code = Object.create(require("./Steps/Layout/LayoutCode_Steps.js"));
var address = Object.create(require("./Steps/Layout/LayoutAddress_Steps.js"));
var description = Object.create(require("./Steps/Layout/LayoutDescription_Steps.js"));
var objTitle = Object.create(require("./Steps/Object/ObjectTitle_Steps.js"));
var objMediaSlider = Object.create(require("./Steps/Object/ObjectMediaSlider_Steps.js"));
var nhBuilderObjects = Object.create(require("./Steps/Newhouses/NhBuilderObjects_Steps.js"));
var nhFilterQuarter = Object.create(require("./Steps/Newhouses/NhFilterQuarter_Steps.js"));
var nhFlatInfo = Object.create(require("./Steps/Newhouses/NhFlatInfo_Steps.js"));
var nhLegend = Object.create(require("./Steps/Newhouses/NhLegend_Steps.js"));
var nhRieltor = Object.create(require("./Steps/Newhouses/NhRiletor_Steps.js"));
var nhTop = Object.create(require("./Steps/Newhouses/NhTop_Steps.js"));
/* Widgets */
var searcherSubmit = Object.create(require("../Widgets/MSearcherSubmit_Widget.js"));
var searchLayout = Object.create(require("../Widgets/SearchLayout_Widget.js"));

var limit = browser.params.smoke
  ? browser.params.limitSmoke.objects
  : browser.params.limit.objects;

sh.getCities().forEach(function(city) {
  describe('Выдача объектов', function() {
    beforeAll(function() {
      sh.getCitiesFromApi();
    });
    if (sh.forPage(page.realty)) {
      it(page.realty.getName() + ' - ' + city, function() {
        ph.setErrorMsg(0);
        if (browser.params.customUrl) {
          page.common.get(browser.params.customUrl);
        } else {
          page.realty.get(city);
          searcherSubmit.submit();
        }

        searchLayout.getObjects().each(function(object, index) {
          if (index < limit) {
            title.get(index);
            sh.logStep('Объект №' + (index + 1), true);
            discount.get(index);
            price.get(index);
            address.get(index);
            description.get(index);

            searchLayout.clickObj(object).then(function() {
              ph.selectTab(1);
              ph.setErrorMsg(3, 'Страница объекта');
              price.verify();
              discount.verify();
              title.verify();
              title.verifyRooms();
              address.verify();
              description.verify();

              objTitle.verify();
              newMediaSlider.verify();

              ph.closeAndSelectTab(0);
            });
          }
        });
      });
    }

    if (sh.forPage(page.zastr)) {
      it(page.zastr.getName() + ' - ' + city, function() {
        ph.setErrorMsg(0);
        if (browser.params.customUrl) {
          page.common.get(browser.params.customUrl);
        } else {
          page.zastr.get(city);
          searcherSubmit.submit();
        }

        searchLayout.getObjects().each(function(object, index) {
          if (index < limit) {
            title.get(index);
            sh.logStep('Новостройка №' + (index + 1), true);

            searchLayout.clickObj(object).then(function() {
              ph.selectTab(1);
              ph.setErrorMsg(3, 'Страница новостройки');
              title.verifyZastr();
              nhTop.verify();
              nhFilterQuarter.verify();
              nhLegend.verify();
              nhBuilderObjects.verify();
              newMediaSlider.verify();
              nhRieltor.verify();
              nhFlatInfo.verify();

              ph.closeAndSelectTab(0);
            });
          }
        });
      });
    }
  })
})