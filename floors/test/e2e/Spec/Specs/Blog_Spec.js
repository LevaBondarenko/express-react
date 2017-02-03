var request = require("request");
/* Helpers */
var ph = Object.create(require("../Helpers/pageHelpers.js"));
var sh = Object.create(require("../Helpers/specHelpers.js"));
/* Pages */
var page = Object.create(require("../Pages/Page.js"));
/* Steps */
var post = Object.create(require("./Steps/Blog/BlogPost_Steps.js"));
var layout = Object.create(require("./Steps/Blog/BlogLayout_Steps.js"));
/* Widgets */
var w = "../Widgets/";
var blogTitle = Object.create(require(w + "BlogTitle_Widget.js"));
var socialNetwork = Object.create(require(w + "SocialNetwork_Widget.js"));
var blogLayout = Object.create(require(w + "BlogLayout_Widget.js"));
var blogNav = Object.create(require(w + "BlogNav_Widget.js"));
var breadcrumbs = Object.create(require(w + "Breadcrumbs_Widget.js"));

if (sh.forPage(page.blog)) {
  sh.getCities().forEach(function(city){
    describe('Блог - ' + city, function(){
      it('Главная страница блога', function() {
        ph.setErrorMsg(0);
        ph.setErrorMsg(3, 'Главная страница блога');
        page.blog.get(city);
        expect(blogTitle.getTitle()).toBe('БЛОГ КОМПАНИИ',
          ph.getErrorMsg('заголовок страницы'));
        expect(blogTitle.getSubTitle())
          .toBe('НОВОСТИ РЫНКА НЕДВИЖИМОСТИ И СОВЕТЫ',
            ph.getErrorMsg('подзаголовок страницы'));
        expect(breadcrumbs.getItemsCount())
          .toBe(2, ph.getErrorMsg('количество пунктов в хлебных крошках'));
        expect(breadcrumbs.getText(0)).toBe('Главная',
          ph.getErrorMsg('первый пункт в хлебных крошках'));
        expect(breadcrumbs.gatActivePage()).toBe('Блог',
          ph.getErrorMsg('последний пункт в хлебных крошках'));
        layout.catsToCookie();
        ph.setErrorMsg(3, 'Выдача статей на главной странице блога');
        layout.verifyLayout();
        if (!browser.params.smoke) {
          ph.setErrorMsg(3, 'Ссылки на соц.сети в шапке');
          socialNetwork.getSocials().each(function(social) {
            socialNetwork.getSocialLink(social).then(function(res) {
              ph.logStep('Соц. сети: ' + res, false);
              ph.setErrorMsg(1, res);
            });
            socialNetwork.clickSocial(social);
            ph.selectTab(1);
            ph.closeAndSelectTab(0);
          });
        }
      });
      it('Категории блога', function() {
        ph.setErrorMsg(0);
        page.blog.get(city);
        layout.catsToCookie();
        ph.setErrorMsg(3, 'Блок навигации');
        expect(blogNav.getTitle2()).toBe('САМОЕ ЧИТАЕМОЕ',
          ph.getErrorMsg('Заголовок № 2 в навигации'));
        expect(blogNav.getTitle1()).toBe('КАТЕГОРИИ',
          ph.getErrorMsg('Заголовок № 1 в навигации'));
        blogNav.getCats().each(function(item, index) {
          blogNav.getCatName(index).then(function(name) {
            ph.setErrorMsg(1, 'Категория: ' + name);
            sh.logStep('Категория №' + (index + 1) + ': ' + name, false);
            if ((!browser.params.smoke ||
                (browser.params.smoke &&
                  index < browser.params.limitSmoke.blogCats))
                && name !== 'Другое') {
              ph.setErrorMsg(4, 'Список категорий');
              expect(blogNav.isCatActive(index)).toBe(false,
                ph.getErrorMsg('Категория должна быть неактивной'));
              expect(blogNav.isCatNumActive(index)).toBe(false,
                ph.getErrorMsg('Счетчик категории должен быть неактивным'));
              blogNav.getCatName(index).then(function(name) {
                blogNav.getCatNum(index).then(function(num) {
                  expect(num).toMatch("[0-9]+",
                    ph.getErrorMsg('Формат количества записей в категории'));
                  expect(name).toMatch("[А-я]+",
                    ph.getErrorMsg('Формат названия категории'));
                  ph.setErrorMsg(4, 'Страница категории');
                  blogNav.clickCat(index);
                  ph.wait(3);
                  expect(blogNav.isCatActive(index)).toBe(true,
                    ph.getErrorMsg('Категория должна быть активной'));
                  expect(blogNav.isCatNumActive(index)).toBe(true,
                    ph.getErrorMsg('Категория должна быть активной (счетчик)'));
                  expect(breadcrumbs.getText(0)).toBe('Главная',
                    ph.getErrorMsg('Первый элемент хлебных крошек'));
                  expect(breadcrumbs.getText(1)).toBe('Блог',
                    ph.getErrorMsg('Второй элемент хлебных крошек'));
                  expect(breadcrumbs.gatActivePage()).toBe(name,
                    ph.getErrorMsg('Активный элемент хлебных крошек должен быть '
                      + ' названием категории'));
                  expect(blogTitle.getTitle()).toBe(name.toUpperCase(),
                    ph.getErrorMsg('Заголовок страницы должен быть ' +
                      'названием категории'));
                  browser.manage().addCookie("catName", name);
                  ph.setErrorMsg(4, 'Список статей в категории');
                  blogLayout.getItemsCount().then(function(count) {
                    if (num > browser.params.limit.blogPosts) {
                      expect(count).toBe(browser.params.limit.blogPosts,
                        ph.getErrorMsg('В выдаче должно быть максимально ' +
                          'возможное количество статей на странице'));
                    } else {
                      expect(count).toBe(parseInt(num),
                        ph.getErrorMsg('Количество статей в выдаче должно быть '
                          + ' равно числу в счетчике категории'));
                    }
                  });
                });
                layout.verifyLayout(true);
              });
            }
          });
        });
      });

      it('Страница записи блога', function() {
        page.blog.get(city);
        blogLayout.getItems().each(function(item, index) {
          blogLayout.waitNoLoader();
          if (!browser.params.smoke ||
            (browser.params.smoke &&
              index < browser.params.limitSmoke.blogPosts)) {
            blogLayout.getItemTitle(index).then(function(title) {
              request({
                uri: browser.params.api.path + "lkuser/login?api_key="
                 + browser.params.api.key,
                method: "POST",
                form: {
                  "login": browser.params.lkUser.login,
                  "password": browser.params.lkUser.password
                }
              }, function(error, response, body) {
                if (response.statusCode != 200) {
                  console.log('Response code: ' + response.statusCode);
                  console.log('Body: ' + body);
                } else {
                  var info = JSON.parse(body);
                  request({
                    uri: browser.params.api.path + "lkuser/" + info.data.auth_hash
                     + "?api_key=" + browser.params.api.key,
                    method: "PUT",
                    form: {
                      "i": 'Пользователь'
                    }
                  }, function(error, response, body) {
                    if (response.statusCode != 200) {
                      console.log('Response code: ' + response.statusCode);
                      console.log('Body: ' + body);
                    }
                  })
                }
              });
              ph.logStep('Статья №' + (index + 1) + ': ' + title, false);
              browser.manage().addCookie("blogTitle", title);
              browser.manage().addCookie("blogViews",
                blogLayout.getItemViews(index));
              browser.manage().addCookie("blogComment",
                blogLayout.getItemComments(index));
              blogLayout.open(index).then(function() {
                post.verifyBlogTitle();
                post.verifyBreadcrumbs();
                post.verifyBlogPost();
                post.verifyBlogReading();
                post.verifyBlogReadAlso();
                post.verifyBlogComments();
                ph.back();
              });
            });
          }
        });
      });
    })
  })
}