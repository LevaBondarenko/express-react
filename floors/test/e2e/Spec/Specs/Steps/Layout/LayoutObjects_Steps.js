var Helpers = require("../../../Helpers/helpers.js");
/* Widgets */
var FlatInfoWidget = require("../../../Widgets/FlatInfo_Widget.js");
var FlatTitleWidget = require("../../../Widgets/FlatTitle_Widget.js");
var FlatDescriptionWidget = require("../../../Widgets/FlatDescription_Widget.js");
var MediaSliderWidget = require("../../../Widgets/MediaSlider_Widget.js");
var SearchLayoutWidget = require("../../../Widgets/SearchLayout_Widget.js");
var MSearcherCountWidget = require("../../../Widgets/MSearcherCount_Widget.js");

var h = Object.create(Helpers);
var flatInfo = Object.create(FlatInfoWidget);
var flatTitle = Object.create(FlatTitleWidget);
var flatDescription = Object.create(FlatDescriptionWidget);
var mediaSlider = Object.create(MediaSliderWidget);
var layout = Object.create(SearchLayoutWidget);
var counter = Object.create(MSearcherCountWidget);

var LayoutObjectsSteps = function() {
  this.verifyObjects = function(page) {
    layout.getObjects().each(function(object, index) {
      layout.getObjectTitle(object).then(function(titleLayout) {
        layout.getObjectPrice(object).then(function(priceLayout) {
          layout.getObjectAddress(object).then(function(addressLayout) {
            layout.getObjectPhoto(object).then(function(photoLayout) {
              layout.getObjectDescription(object)
                .then(function(descriptionLayout) {
                if(index < browser.params.limit.objects) {
                  layout.getObjectLink(index).then(function(link){
                    layout.clickObjLink(index);
                    h.selectTab(1);
                    flatTitle.getTitle().then(function(titleSingle){
                      expect(titleSingle.toUpperCase())
                        .toContain(titleLayout,
                          'Заголовок объекта + 'link);
                    });
                    flatTitle.getAddress().then(function(addressSingle){
                      if(page.getFrom() === 'realty_out'){
                        expect(titleLayout)
                          .toContain(addressSingle.toUpperCase(),
                            'Адрес объекта загородной ' + link);
                      } else {
                        expect(addressLayout)
                          .toBe(addressSingle,
                            'Адрес объекта ' + link);
                      }
                    });
                    flatInfo.getPrice().then(function(priceSingle){
                      expect(priceLayout)
                        .toBe(priceSingle,
                          'Цена объекта ' + link);
                    });
                    flatDescription.getDescription()
                      .then(function(descriptionSingle){
                      expect(descriptionSingle)
                        .toContain(descriptionLayout,
                          'Описание объекта ' + link);
                    });
                    if(photoLayout.indexOf('no_photo') > -1){
                      expect(mediaSlider.hasPhotosTab())
                        .toBe(true,
                          'У объекта есть фото ' + link);
                      expect(mediaSlider.getPhotosCount())
                        .toBeGreaterThan(0,
                          'Количество фото > 0 ' + link);
                    }
                    h.closeAndSelectTab(0);
                  });
                }
              });
            });
          });
        });
      });
    });
  };

  this.verifyPaging = function() {
    counter.getCount().then(function(count) {
      if (h.strToInt(count) > 14) {
        expect(layout.hasPaging()).toBe(true);
        expect(layout.getSelectedPage()).toBe('1');
        layout.getNextPage();
        expect(layout.getSelectedPage()).toBe('2');
        layout.getPrevPage();
        expect(layout.getSelectedPage()).toBe('1');
      }
    });
  };

  this.verifySorting = function() {
    layout.openSortingTypesList();
    layout.selectSortingType('pricedesc');
    layout.getObjectPrices().each(function(element, index) {
      element.getText().then(function(price) {
        if (index > 0 && prev !== price) {
          expect(h.strToInt(price)).toBeLessThan(h.strToInt(prev));
        }
        prev = price;
      });
    });

    layout.openSortingTypesList();
    layout.selectSortingType('priceasc');
    layout.getObjectPrices().each(function(element, index) {
      element.getText().then(function(price) {
        if (index > 0 && prev !== price) {
          expect(h.strToInt(price)).toBeGreaterThan(h.strToInt(prev));
        }
        prev = price;
      });
    });

    layout.openSortingTypesList();
    layout.selectSortingType('squaredesc');
    layout.getObjectSquares().each(function(element, index) {
      element.getText().then(function(square) {
        if (index > 0 && prev !== square) {
          expect(h.squareDeFormat(square)).toBeLessThan(h.squareDeFormat(prev));
        }
        prev = square;
      });
    });

    layout.openSortingTypesList();
    layout.selectSortingType('squareasc');
    layout.getObjectSquares().each(function(element, index) {
      element.getText().then(function(square) {
        if (index > 0 && prev !== square) {
          expect(h.squareDeFormat(square)).toBeGreaterThan(h.squareDeFormat(prev));
        }
        prev = square;
      });
    });
  };

  this.verifyDateFilter = function() {
    expect(layout.getDateFilterButtonsCount()).toBe(4);

    layout.getDateFilterButtons().each(function(button, index) {
      if (index > 0) {
        expect(layout.isDateFilterButtonSelected(index)).toBe(false);
      } else {
        expect(layout.isDateFilterButtonSelected(index)).toBe(true);
      }
      layout.getDateFilterButtonText(button).then(function(text) {
        var count = 0;
        if (text.indexOf('(') !== -1) {
          count = h.strToInt(text.split('(')[1].split(')')[0]);
        }

        if (count > 0) {
          layout.clickDateFilterButton(button);
          expect(layout.isDateFilterButtonSelected(index)).toBe(true);
          if (count > 15) {
            expect(layout.getObjectsCount()).toBe(15);
          } else {
            expect(layout.getObjectsCount()).toBe(count);
          }
        }
      });
    });
  };
};

module.exports = LayoutObjectsSteps;