/* Helpers */
var sh = Object.create(require("../Helpers/specHelpers.js"));
/* Pages */
var page = Object.create(require("../Pages/Page.js"));

var allPages = [
  // Главная
  page.main,
  // Недвижимость
  page.realty,
  page.zastr,
  page.realtyOut,
  page.realtyRent,
  page.commerce,
  // Ипотека
  page.ipoteka,
  // Блог
  page.blog,
  // Лэндинги
  page.students,
  page.rentNh,
  page.forTheLandlord,
  page.forTheSeller,
  page.deals,
  page.action,
  page.actionResults,
  page.vtb,
  page.turnkey,
  page.burningMortgage,
  page.crossRegion,
  page.ipotekaBank,
  page.kvartiraVPodarok,
  page.kvartiryDvuhStolic,
  page.plekhanovo,
  page.elitCottage,
  // Общие
  page.compare,
  page.thankYou,
  page.analytics,
  // Работа
  page.job,
  page.profile,
  // page.openDay
];

var elemsShouldPresent = [
  $('.header--logo')
];
var elemsShouldNotPresent = [
  $('.e404-info'),
  $('.e404object-title'),
  $('.e500-header'),
  element(by.cssContainingText('h1', '404 ошибка: Страница не найдена')),
  element(by.cssContainingText('h1', '404 Not Found')),
  element(by.cssContainingText('h1', '502 Bad Gateway')),
  element(by.cssContainingText('h1', '504 Gateway Time-out'))
];

var verifyPage = function(url) {
  elemsShouldPresent.forEach(function(elem) {
    expect(elem.isPresent()).toBe(true,
      'элемент ' + elem.locator() + ' должен присутствовать на странице ' + url);
  });
  elemsShouldNotPresent.forEach(function(elem) {
    expect(elem.isPresent()).not.toBe(true,
      'элемент ' + elem.locator() + ' должен отсутствовать на странице ' + url);
  });
};

var getIt = function(p, city) {
  it(p.getName(), function() {
    if (p.exists(city)) {
      p.get(city);
      verifyPage(p.getUrl());
    }
  });
};

sh.getCities().forEach(function(city) {
  describe('Все страницы сайта', function() {

    beforeAll(function(done) {
      sh.getCitiesFromApi().then(function() {
        sh.fillObjectCodesFromApi(city);
        done();
      });
    }, 120000);

    allPages.forEach(function(p) {
      if (p.exists(city) && sh.forPage(p)) {
        if (p.getChildren()) {
          describe(p.getName(), function() {
            getIt(p, city);
            p.getChildren().forEach(function(c) {
              it(c.name, function() {
                switch (p.getUrl()) {
                  case "realty":
                    var a = c.addID ? c.url + browser.params.objects.realty : c.url;
                    break;
                  case "realty_out":
                    var a = c.addID ? c.url + browser.params.objects.realtyOut : c.url;
                    break;
                  case "realty_rent":
                    var a = c.addID ? c.url + browser.params.objects.realtyRent : c.url;
                    break;
                  case "commerce":
                    var a = c.addID ? c.url + browser.params.objects.commerce : c.url;
                    break;
                  case "zastr":
                    var a = c.addID ? c.url + browser.params.objects.zastr : c.url;
                    break;
                  default:
                    var a = c.url;
                    break;
                }
                p.getChild(a, city);
                verifyPage(a);
              });
            });
          });
        } else {
          getIt(p, city);
        }
      }
    });
  });
});