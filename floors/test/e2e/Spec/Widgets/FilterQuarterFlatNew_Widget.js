var OrderWidget = require("./Order_Widget.js");
var h = Object.create(require("../Helpers/pageHelpers.js"));

FilterQuarterFlatNewWidget = OrderWidget.modal.extend({
  keyElement: $$('.nh-flat-info .nh-flat-button-order + .nh-flat-button-order'),
  name: 'Информация о квартире, модальное окно',
  phoneFormat: 2,
  widget: 'flat',
  insideNewNhObject: true,
  waitNotification: true,
  info: {
    title: $('.nh-flat-info .nh-flat-title'),
    layoutLinks: $$('.nh-flat-info a.nh-flat-link'),
    flatProps: $$('.nh-flat-prop'),
    propLabels: $$('.nh-flat-prop .nh-flat-proplabel'),
    propValues: $$('.nh-flat-prop .nh-flat-propvalue:not(.nh-flat-propvalue-biggreen)'),
    price: $('.nh-flat-propvalue-biggreen > span'),
    oldPrice: $('.nh-flat-oldPrice'),
    updated: $('.nh-flat-updated'),
    buttons: $$('.nh-flat-button-order'),
    dolshikLabel: $('.nh-flat-orders p'),

    getTitle: function() {
      return this.title.getText();
    },
    getLayoutLinksCount: function() {
      return this.layoutLinks.count();
    },
    getLayoutLinkText: function(index) {
      return this.layoutLinks.get(index).getText();
    },
    getPropsCount: function() {
      return this.flatProps.count();
    },
    getPropLabel: function(index) {
      return this.propLabels.get(index).getText();
    },
    getPropValue: function(index) {
      return this.propValues.get(index).getText();
    },
    getPropValues: function() {
      return this.propValues;
    },
    getPrice: function() {
      return this.price.getText();
    },
    hasOldPrice: function() {
      return this.oldPrice.isPresent();
    },
    getOldPrice: function() {
      return this.oldPrice.getText();
    },
    getUpdated: function() {
      return this.updated.getText();
    },
    getButtonsCount: function() {
      return this.buttons.count();
    },
    getButtonText: function(index) {
      return this.buttons.get(index).getText();
    },
    getButtonLink: function(index) {
      return this.buttons.get(index).getAttribute('href');
    },
    getDolshikLabelText: function() {
      return this.dolshikLabel.getText();
    }
  },
  popup: {
    btn: $$('.nh-flat-orders button').get(1),
    btnClose: $('.modal-body > button'),
    floor: $$('#left-tabs > div:first-child > div:first-child > div:first-child'),
    section: $$('#left-tabs > div:first-child > div:first-child > div:last-child'),
    tabs: $$('li a[id^="left-tabs-tab-"]'),
    bookParams: $$('#left-tabs-pane-book h3 + div p'),
    propLabels: $$('#left-tabs > div:nth-child(2) > div:not(.tab-content) > .row > div > p'),
    propValues: $$('#left-tabs div:nth-child(2) > div > .row > div'),
    rieltorPhoto: $('#left-tabs .jk-person .jk-avatar img'),
    layouts: {
      links: $$('#left-tabs-pane-info .btn-group button'),
      flat: $('img.img-responsive[src]'),
      floorCanvas: $('.nh-flat-sprite-canvas'),
      floor: $('img.img-responsive[src]'),
      ddd: $('iframe'),

      clickLink: function(index) {
        this.links.get(index).click();
        h.wait();
      },
      getLinkText: function(index) {
        return this.links.get(index).getText();
      },
      getLinksCount: function() {
        return this.links.count();
      },
      hasFlat: function() {
        return this.flat.isPresent()
      },
      hasFloorCanvas: function() {
        return this.floorCanvas.isPresent()
      },
      hasFloor: function() {
        return this.floor.isPresent()
      },
      has3D: function() {
        h.wait(2);
        return this.ddd.isPresent()
      }
    },

    show: function() {
      this.btn.click();
    },
    hide: function() {
      this.btnClose.click();
    },
    getRieltorPhoto: function() {
      return this.rieltorPhoto.getAttribute('src');
    },
    getFloor: function() {
      return this.floor.get(0).getText();
    },
    getSection: function() {
      return this.section.get(0).getText();
    },
    getTabText: function(index) {
      return this.tabs.get(index).getText();
    },
    clickTab: function(index) {
      this.tabs.get(index).click();
    },
    getPropLabel: function(index) {
      return this.propLabels.get(index).getText();
    },
    getPropValue: function(index) {
      return this.propValues.get(index).getText();
    },
    getPropValueSpan: function(index) {
      return this.propValues.get(index).$$('span:first-child').get(0).getText();
    },
    getBookParam: function(index) {
      return this.bookParams.get(index).getText();
    },
    getPropsCount: function() {
      return this.propLabels.count();
    }
  },
  lk: {
    addToFav: $$('button i.fa-heart-o'),
    addToCompare: $$('button i.fa-list-ul'),

    getAddToFavBtnCount: function() {
      return this.addToFav.count();
    },
    getAddToCompareCount: function() {
      return this.addToCompare.count();
    }
  }
});

module.exports = FilterQuarterFlatNewWidget;

module.exports.rieltor = FilterQuarterFlatNewWidget.extend({
  container: $$('.modalWindowRieltor .jk-person'),
  button: $$('button[data-activekey="review"]'),
  name: 'риэлтор',
  comment: ['nhId', 'nhName', 'fio']
});
module.exports.review = FilterQuarterFlatNewWidget.extend({
  container: $$('#left-tabs-pane-review'),
  button: $$('button[data-activekey="review"]'),
  name: 'запись на просмотр',
  redirectToThankYouPage: false,
  phoneFormat: 0,
  comment: ['reviewData','nhId', 'nhName'],
  date: {
    day: $('.slideItem.active .slideContent'),
    month: $('.slideItem.active .slideFooter'),
  },
  time: {
    hour: $('#formControlsSelect[data-name="hour"]'),
    min: $('#formControlsSelect[data-name="min"]'),
  },
  setDate: function() {
    this.container.get(0).$$('.slideItem').first().click();
  },
  getDateDay: function() {
    return this.container.get(0).element(this.date.day.locator()).getText();
  },
  getDateMonth: function() {
    return this.container.get(0).element(this.date.month.locator()).getText();
  },
  setHour: function(value) {
    this.container.get(0).element(this.time.hour.locator())
      .$('option[value="' + value + '"]').click();
  },
  setMin: function(value) {
    this.container.get(0).element(this.time.min.locator())
      .$('option[value="' + value + '"]').click();
  },
  fillReviewData: function() {
    var h = 10;
    var m = 15;
    var self = this;

    this.setDate(0);
    this.setHour(h);
    this.setMin(m);
    this.getDateDay().then(function(day) {
      self.getDateMonth().then(function(month) {
        browser.manage().addCookie("E2E_sendTicket_nhReview_date",
          'дата:' + month.toLowerCase() + ', ' + day);
      });
    });
    browser.manage()
      .addCookie("E2E_sendTicket_nhReview_time", 'время: ' + h + ':' + m);
    this.wh.wait(2);
  }
});
module.exports.book = FilterQuarterFlatNewWidget.extend({
  container: $$('#left-tabs-pane-book'),
  button: $$('button[data-activekey="book"]'),
  name: 'бронирование',
  comment: ['nhId', 'nhName'],
  phoneFormat: 0,
  redirectToThankYouPage: false,
  hasNameField: true
});