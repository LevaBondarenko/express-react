var ph = Object.create(require("../Helpers/pageHelpers.js"));
/* Helpers */
var sh = Object.create(require("../Helpers/specHelpers.js"));
/* Pages */
var Page = require("../Pages/Page.js");
var page = Object.create(Page);
var commonPage = Object.create(Page).common;
/* Steps */
var login = Object.create(require("./Steps/LK/Login_Steps.js"));
/* WIDGETS */
var authPanel = Object.create(require("../Widgets/AuthPanel2_Widget.js"));
var searcherSubmit = Object.create(require("../Widgets/MSearcherSubmit_Widget.js"));
var layout = Object.create(require("../Widgets/SearchLayout_Widget.js"));
var lkBody = Object.create(require("../Widgets/LKBody_Widget.js"));
var flatTitle = Object.create(require("../Widgets/FlatTitle_Widget.js"));
var notify = Object.create(require("../Widgets/Notify_Widget.js"));

var favCount = 0;
var cities = browser.params.cities.split(',');
if(browser.params.pages){
  var pages = browser.params.pages.split(',');
};

var verifyNotification = function(code, add) {
  notify.wait();
  expect(notify.getHeader()).toBe('ИЗБРАННОЕ');
  expect(notify.getBody()).toContain('Объект ' + code);
  if(add){
    expect(notify.getBody()).toContain('добавлен в избранное');
  } else {
    expect(notify.getBody()).toContain('удален из избранного');
  }
};

cities.forEach(function(city){
  describe('Избранное - ' + city, function(){
    beforeAll(function() {
      sh.getCitiesFromApi();
      page.main.get(city);
      login.auth();
      ph.wait(2);
    });

    beforeEach(function() {
      authPanel.hasFavCount().then(function(result){
        if(result){
          authPanel.openMenuFavItem();
          ph.wait(2);
          lkBody.getSoldFavs().each(function(element, index){
            lkBody.deleteSoldFav(0);
          });
          lkBody.getFavs().each(function(element, index){
            lkBody.deleteFav(0);
            lkBody.confirmDeletion();
          });
        }
      });
    });

     afterAll(function() {
       login.logout();
     });

    var testLK = function(page, smoke){
      if(page.exists(city)
        && (((browser.params.smoke) && (smoke)) || (!browser.params.smoke))
        && (((pages) && (pages.indexOf(page.getUrl()) > -1)) || (!pages))){
        it(page.getName(), function(){
          page.get(city);
          //Добавляем первый объект в избранное
          searcherSubmit.submit();
          expect(authPanel.hasFavCount()).toBe(false, 'В избранном не должно быть объектов');
          layout.addToFav(0);
          expect(authPanel.getFavCount()).toBe('1', 'В избранном должен быть 1 объект (выдача)');
          layout.getObjectLink(0).then(function(objectLink1){
            var objectCode1 = ph.getObjectCodeByLink(objectLink1);
            verifyNotification(objectCode1, 1);
            //Добавляем второй объект в избранное
            layout.getObjectLink(1).then(function(objectLink2){
              var objectCode2 = ph.getObjectCodeByLink(objectLink2);
              commonPage.get(objectLink2);
              expect(flatTitle.addedToFav()).toBe(false, 'Оъект не должен быть в избранном (страница объекта)');
              flatTitle.clickFav();
              expect(flatTitle.addedToFav()).toBe(true, 'Оъект должен быть в избранном (страница объекта)');
              expect(authPanel.getFavCount()).toBe('2', 'В избранном должен быть 2 объекта (страница объекта)');
              verifyNotification(objectCode2, 1);
              //Открываем избранное
              notify.clickLink();
              ph.wait(3);
              var slug = page.getUrl();
              expect(lkBody.getFavCount(slug)).toBe('(2)', 'В избранном должен быть 2 объекта (избранное)');
              expect(lkBody.getMenuFavTitle()).toBe('ИЗБРАННОЕ (2)');
              expect(lkBody.objectPresent(objectCode1, slug)).toBe(true, 'Первый объект ' + objectCode1 + 'должен быть в избранном');
              expect(lkBody.objectPresent(objectCode2, slug)).toBe(true, 'Второй объект ' + objectCode2 + 'должен быть в избранном');
              if(smoke){
                //Удаляем объект из избранного
                lkBody.clickFavByCode(objectCode1, slug);
                lkBody.confirmDeletion();
                expect(lkBody.objectPresent(objectCode1, slug)).toBe(false, 'Первый объект ' + objectCode1 + 'НЕ должен быть в избранном');
                expect(authPanel.getFavCount()).toBe('1', 'В избранном должен быть 1 объект (избранное, после удаления)');
                expect(lkBody.getMenuFavTitle()).toBe('ИЗБРАННОЕ (1)');
                expect(lkBody.getFavCount(slug)).toBe('(1)', 'В избранном должен быть 1 объект (избранное, после удаления)');
                verifyNotification(objectCode1, 0);
                //Добавить комментарий, поделиться ссылкой
                /*lkBody.clickComment();
                lkBody.editComment('test');
                lkBody.cancelComment();
                expect(lkBody.getComment()).toContain('Добавьте заметку');
                lkBody.share();
                lkBody.shareCopy();
                notify.waitInfo();
                lkBody.clickComment();
                lkBody.pasteComment();
                lkBody.saveComment();
                lkBody.getComment().then(function(link1){
                  expect(link1).toContain('subsets');
                  lkBody.deleteComment();
                  lkBody.share();
                  lkBody.shareNew();
                  lkBody.shareCopy();
                  notify.waitInfo();
                  lkBody.clickComment();
                  lkBody.pasteComment();
                  lkBody.saveComment();
                  lkBody.getComment().then(function(link2){
                    expect(link2).toContain('subsets');
                    expect(link2).not.toBe(link1);
                    browser.get(link2);
                    expect(lkBody.objectPresent(objectCode2, slug)).toBe(true);
                    expect(lkBody.getPageTitle()).toContain('ПРОСМОТР ПОДБОРКИ');
                  });
                });*/
              }
            });
          });
        });
      };
    };

    testLK(page.realty, 1);
    testLK(page.realtyOut, 0);
    testLK(page.realtyRent, 0);
    testLK(page.commerce, 0);
  });
});