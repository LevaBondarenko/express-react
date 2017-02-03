var h = Object.create(require("../../../Helpers/helpers.js"));
/* Widgets */
var blogLayout = Object.create(require("../../../Widgets/BlogLayout_Widget.js"));
var blogNav = Object.create(require("../../../Widgets/BlogNav_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  verifyLayout: function(catName){
    blogLayout.getItemsCount().then(function(count){
      blogLayout.getItems().each(function(item, index){
        blogLayout.getItemTitle(index).then(function(res) {
          h.setErrorMsg(2, 'Статья: ' + res);
          h.logStep('Статья №' + (index + 1) + ': ' + res, false);
        });
        expect(blogLayout.hasImage(item)).toBe(true,
          h.getErrorMsg('У записи должна быть миниатюра'));
        expect(blogLayout.getItemImageLink(item)).toMatch('cdn-media.etagi.com',
          h.getErrorMsg('ссфлка на изображение должна быть на cdn'));
        expect(blogLayout.getItemTitle(index)).toMatch(".+",
          h.getErrorMsg('Заголовки записей не пустые'));
        expect(blogLayout.getItemViews(index))
          .toMatch("[0-9]+", h.getErrorMsg('Формат количества просмотров'));
        expect(blogLayout.getItemComments(index))
          .toMatch("[0-9]+", h.getErrorMsg('Формат количества комментариев'));
        expect(blogLayout.hasFb(item)).toBe(true,
          h.getErrorMsg('У записи должна быть кнопка поделиться ВК'));
        expect(blogLayout.hasVk(item)).toBe(true,
          h.getErrorMsg('У записи должна быть кнопка поделиться FB'));

        blogLayout.getItemInfo(item).then(function(info){
          expect(info).toMatch("[0-9]{1,2} [А-Я]+ [0-9]{4} Г. / [А-Я, ]+",
            h.getErrorMsg('Формат информации о записи'));
          var cats = info.split(' / ')[1].split(', ');
          browser.manage().getCookie("allCats").then(function(allCats){
            cats.forEach(function(elem){
              expect(allCats.value.toUpperCase().indexOf(elem) > -1).toBe(true,
                h.getErrorMsg('каждая категория статьи должна быть '
                  + 'в списке категорий в блоке навигации'));
            });
          });
          if(catName){
            browser.manage().getCookie("catName").then(function(catName){
              expect(cats).toContain(catName.value.toUpperCase(),
                h.getErrorMsg('в списке категорий статьи должна '
                  + 'быть текущая категория'));
            });
          }
        });
      });
    });
  },
  catsToCookie: function(){
    var allCats = blogNav.getCats().reduce(function(catsAcc, elem, index) {
      return blogNav.getCatName(index).then(function(text) {
        return catsAcc + text + ',';
      });
    }, '');
    browser.manage().addCookie("allCats", allCats);
  }
});