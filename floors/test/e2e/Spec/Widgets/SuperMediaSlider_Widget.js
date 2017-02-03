var wh = Object.create(require("../Helpers/waitHelpers.js"));

SuperMediaSlider = require("./Widget.js").extend({
  tabs: {
    tabs: $$('.supermediaslider--wrapper > div > div > div:first-child button[data-view]'),

    get: function() {
      return this.tabs;
    },
    click: function(index) {
      this.tabs.get(index).click();
    },
    getText: function(index) {
      return this.tabs.get(index).getText();
    },
    getType: function(index) {
      return this.tabs.get(index).getAttribute('data-view');
    },
    getLabelByType: function(type) {
      switch (type) {
        case 'photos':
          return 'Фотографии';
        case 'layouts':
          return 'Планировки';
        case 'layout3d':
          return '3D-планировка';
        case 'tours':
          return '3D-туры';
        case 'building':
          return 'Ход строительства';
        case 'infrastructure':
          return 'Карта';
        case 'district':
          return 'Виды района';
      }
    }
  },
  slides: {
    thumbs: $$('div[id$="_thumbsContainer"] img[data-thumb]'),
    counter: $('.supermediaslider--wrapper > div > div > div:nth-child(2) > div:nth-child(1)'),
    controlsPrev: $('.supermediaslider--wrapper > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) div:first-child'),
    controlsNext: $('.supermediaslider--wrapper > div > div > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) div:last-child'),
    controls2Prev: $('.supermediaslider--wrapper > div > div > div:nth-child(2) > div:nth-child(2) > div:first-child'),
    controls2Next: $('.supermediaslider--wrapper > div > div > div:nth-child(2) > div:nth-child(2) > div:last-child'),
    map: $('ymaps'),
    dddPlan: $('iframe#frm'),
    districts: $('div.gm-style'),

    getThumbsCount: function() {
      return this.thumbs.count();
    },
    getCounter: function() {
      return this.counter.getText();
    },
    clickThumb: function(index) {
      this.thumbs.get(index).click();
    },
    hasMap: function() {
      return this.map.isPresent();
    },
    has3DPlan: function() {
      return this.dddPlan.isPresent();
    },
    hasDistricts: function() {
      return this.districts.isPresent();
    },
    navigate: function(direction, type) {
      var elem;
      switch (direction) {
        case 'prev':
          switch (type) {
            case 0:
            default:
              elem = this.controlsPrev;
              break;
            case 1:
              elem = this.controls2Prev;
              break;
          }
          break;
        case 'next':
          switch (type) {
            case 0:
            default:
              elem = this.controlsNext;
              break;
            case 1:
              elem = this.controls2Next;
              break;
          }
          break;
      }
      elem.click();
    }
  },
  modal: {
    btn: $('.supermediaslider--wrapper > div > div > div:nth-child(2) > div:last-child'),
    closeBtn: $('.modal-body > span'),
    tabs: $$('.modal-body button[data-view]'),

    getText: function(index) {
      return SuperMediaSlider.getText(this.tabs.get(index));
    },
    getBtnText: function() {
      return SuperMediaSlider.getText(this.btn);
    },
    open: function() {
      SuperMediaSlider.click(this.btn);
    },
    close: function() {
      SuperMediaSlider.click(this.closeBtn);
    }
  }
});

module.exports = SuperMediaSlider;