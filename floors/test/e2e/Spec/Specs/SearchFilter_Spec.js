/* Helpers */
var ph = Object.create(require("../Helpers/pageHelpers.js"));
var sh = Object.create(require("../Helpers/specHelpers.js"));
/* Pages */
var page = Object.create(require("../Pages/Page.js"));
/* Steps */
var s = Object.create(require("./Steps/SearchFilter/SearchFilter_Steps.js"));
var SearchByDistrictsSteps = require("./Steps/Search/SearchByDistricts_Steps.js");
var sd = new SearchByDistrictsSteps();
/* Widgets */
var group = Object.create(require("../Widgets/FilterGroupSwitcher_Widget.js"));
var checkbox = Object.create(require("../Widgets/FilterCheckbox_Widget.js"));
var msCheckbox = Object.create(require("../Widgets/MSearcherCheckBox_Widget.js").filter);
var msRange = Object.create(require("../Widgets/MSearcherRange_Widget.js"));
var msDistricts = Object.create(require("../Widgets/MSearcherDistricts_Widget.js"));
var range = Object.create(require("../Widgets/FilterRange_Widget.js"));
var searcherSubmit = Object.create(require("../Widgets/MSearcherSubmit_Widget.js"));
var r = Object.create(require("../Widgets/FilterRange_Widget.js"));
var clearAll = Object.create(require("../Widgets/MSearcherClear_Widget.js"));

var smoke = browser.params.smoke;

sh.getCities().forEach(function(city) {
  describe('Фильтр объектов', function() {
    beforeAll(function(done) {
      sh.getCitiesFromApi().then(function() {
        done();
      });
    }, 60000);

    var filter = function(page) {
      if (sh.forPage(page)) {
        describe(page.getName() + ' - ' + city, function() {
          beforeEach(function() {
            sh.getPage(page, city);
            ph.setErrorMsg(0);
          });

          it('Очистить всё', function() {
            browser.getCurrentUrl().then(function(url) {
              checkbox.getAllWidgets().each(function(widget, wIndex) {
                checkbox.clickItem(wIndex, 0);
              });
              msCheckbox.getAllWidgets().each(function(widget, wIndex) {
                msCheckbox.clickItem(wIndex);
              });

              browser.getCurrentUrl().then(function(urlBeforeCleanAll) {
                // expect(url).not.toBe(urlBeforeCleanAll,
                  // "URL страницы должен отличаться от изначального (должны быть выбраны параметры)");
              });

              clearAll.clickBtn().then(function() {
                ph.wait(2);
                browser.getCurrentUrl().then(function(urlAfterCleanAll) {
                  // expect(url).toBe(urlAfterCleanAll,
                    // "URL страницы не должен отличаться от изначального (параметры очищены)");
                });
              });
            });
          });

          it('Фильтр (чекбоксы)', function() {
            checkbox.getAllWidgets().each(function(widget, wIndex) {
              if (!smoke || (smoke && wIndex < 1)) {
                checkbox.getName(wIndex).then(function(name) {
                  sh.logStep('Фильтр по параметру: ' + name.bold);
                  s.verifyClearBtn(checkbox.hasClearBtn(wIndex));
                  checkbox.isRadio(wIndex).then(function(isRadio) {
                    checkbox.getItems(wIndex).each(function(item, index) {
                      checkbox.getItemName(wIndex, index)
                      .then(function(itemName) {
                        checkbox.getDataType(wIndex, index)
                        .then(function(param) {
                          checkbox.getValue(wIndex, index)
                          .then(function(value) {
                            sh.logStep('Значение: ' + itemName
                              + ' (' + param + ', ' + value + ')');
                            sh.logStep('└ Клик');
                            checkbox.clickItem(wIndex, index).then(function() {
                              checkbox.getHint(wIndex).then(function(hint) {
                                s.verifyHint(hint);
                              });
                              s.verifyCheckbox([param], [value], 'Клик', false);

                              sh.logStep('└ Обновление страницы');
                              browser.refresh();
                              s.verifyCheckbox([param], [value],
                                'Обновление страницы', false);
                              searcherSubmit.getDiasbled().then(function(result){
                                if (!result) {
                                  sh.logStep('└ Нажатие "Найти"');
                                  searcherSubmit.submit();
                                  s.verifyCheckbox([param], [value],
                                    'Нажатие "Найти"', false);
                                }
                              });
                            });
                            if (!isRadio) {
                              checkbox.clear(wIndex);
                              s.verifyCheckbox([param], [value], 'Очистить', true)
                              s.verifyClearBtn(checkbox.hasClearBtn(wIndex));
                            } else if (index > 0) {
                              checkbox.getDataType(wIndex, index - 1)
                              .then(function(prevParam) {
                                checkbox.getValue(wIndex, index - 1)
                                .then(function(prevValue) {
                                  s.verifyCheckbox([prevParam], [prevValue],
                                    'Предыдущий (радио)', true);
                                });
                              });

                              checkbox.clear(wIndex);

                              s.verifyClearBtn(checkbox.hasClearBtn(wIndex));
                            }
                          });
                        });
                      });
                    });


                    if (!isRadio) {
                      sh.logStep('Все значения (мультиселект)');
                      var verifyMultiselect = function(not) {
                        checkbox.getValues(wIndex).reduce(function(acc, elem) {
                          return elem.getAttribute('value').then(function(value) {
                            return acc.concat([value]);
                          });
                        }, []).then(function(values) {
                          checkbox.getValues(wIndex).reduce(function(acc, elem) {
                            return elem.getAttribute('data-type')
                            .then(function(dataType) {
                              return acc.concat([dataType]);
                            });
                          }, []).then(function(params) {
                            s.verifyCheckbox(params, values, 'Мультиселект', not);
                          });
                        });
                      };

                      checkbox.getItems(wIndex).each(function(item, index) {
                        checkbox.clickItem(wIndex, index);
                      });
                      verifyMultiselect(0);
                      checkbox.clear(wIndex);
                      s.verifyClearBtn(checkbox.hasClearBtn(wIndex));
                      verifyMultiselect(1);
                    }
                  });
                });
              }
            });
          });

          it('Фильтр (слайдеры)', function() {
            range.getAllWidgets().each(function(widget, wIndex) {
              if (!smoke || (smoke && wIndex < 1)) {
                range.getName(wIndex).then(function(name) {
                  range.getDataProp(wIndex).then(function(param) {
                    range.getId(wIndex).then(function(id) {
                      var bounds = s.getMinMaxByParam(param);
                      var min = bounds[0];
                      var max = bounds[1];

                      var clearIndex = -1;
                      var clearIndexFinal = -1;

                      group.getAllWidgets().each(function(allWidget, allIndex) {
                        group.getId(allIndex).then(function(allId) {
                          group.getClass(allIndex).then(function(cl) {
                            if (cl.indexOf('filtergroupswitcher--wrapper') > -1) {
                              clearIndex = allIndex;
                            } else if (id === allId && clearIndexFinal === -1
                              && clearIndex !== -1) {
                              clearIndexFinal = clearIndex;
                            }
                          });
                        });
                      });

                      sh.logStep('Фильтр по параметру: ' + name.bold
                        + ' (' + param + '_min=' + min + ', '
                        + param + '_max=' + max + ')');
                      browser.getCurrentUrl().then(function(url) {
                        sh.logStep('└ Страница по url');
                        browser.get(url + (url.indexOf('?') === -1 ? '?' : '&')
                          + s.addParams(param, min, max));
                        s.verifyRange(param, min, max,
                          'Страница по url', false);
                        searcherSubmit.getDiasbled().then(function(result){
                          if (!result) {
                            sh.logStep('└ Нажатие "Найти"');
                            searcherSubmit.submit();
                            s.verifyRange(param, min, max,
                              'Нажатие "Найти"', false);
                          }
                        });
                        group.clear(clearIndexFinal);
                        s.verifyRange(param, min, max, 'Очистить', true);
                      });
                    });
                  });
                });
              }
            });
          });

          it('Фильтр (чекбоксы модульного поисковика)', function() {
            msCheckbox.getAllWidgets().each(function(widget, wIndex) {
              if (!smoke || (smoke && wIndex < 1)) {
                msCheckbox.getId(wIndex).then(function(id) {
                  var clearIndex = -1;
                  var clearIndexFinal = -1;
                  group.getAllWidgets().each(function(allWidget, allIndex) {
                    group.getId(allIndex).then(function(allId) {
                      group.getClass(allIndex).then(function(cl) {
                        if (cl.indexOf('filtergroupswitcher--wrapper') > -1) {
                          clearIndex = allIndex;
                        } else if (id === allId && clearIndexFinal === -1
                          && clearIndex !== -1) {
                          clearIndexFinal = clearIndex;
                        }
                      });
                    });
                  });

                  /*wIndex == 0 && */
                  msCheckbox.getName(wIndex).then(function(name) {
                    msCheckbox.getDataType(wIndex).then(function(param) {
                      msCheckbox.getValue(wIndex).then(function(value) {
                        sh.logStep('Фильтр по параметру: ' + name.bold
                            + ' (' + param + '=' + value + ')');
                        sh.logStep('└ Клик');
                        msCheckbox.clickItem(wIndex).then(function() {
                          msCheckbox.getHint(wIndex).then(function(hint) {
                            s.verifyHint(hint);
                          });
                          s.verifyCheckbox([param], [value], 'Клик', false);
                          sh.logStep('└ Обновление страницы');
                          browser.refresh();
                          s.verifyCheckbox([param], [value],
                            'Обновление страницы', false);

                          searcherSubmit.getDiasbled().then(function(result) {
                            if (!result) {
                              sh.logStep('└ Нажатие "Найти"');
                              searcherSubmit.submit();
                              s.verifyCheckbox([param], [value],
                                'Нажатие "Найти"', false);
                            }
                          });

                          group.clear(clearIndexFinal);
                          s.verifyCheckbox([param], [value], 'Очистить', true);
                        });
                      });
                    });
                  });
                });
              }
            });
          });

          /*xit('Поисковик (диапазон)', function() {
            browser.getCurrentUrl().then(function(url) {
              msRange.getAllWidgets().each(function(widget, wIndex) {
                Promise.all([
                  msRange.getName(wIndex, 'min'),
                  msRange.getName(wIndex, 'max')
                ]).then(function(names){
                  sh.logStep('Поиск по параметру: ' + names.join(", ").bold);
                });
                msRange.getDataType(wIndex, 'min').then(function(param) {
                  var bounds = s.getMinMaxByParam(param);
                  var min = bounds[0];
                  var max = bounds[1];

                  sh.logStep('└ Ввод');
                  msRange.sendValue(wIndex, 'min', min);
                  msRange.sendValue(wIndex, 'max', max);
                  s.verifyRange(param, min, max, '└ Ввод', false);
                  sh.logStep('└ Обновление страницы');
                  browser.refresh();
                  s.verifyRange(param, min, max, '└ Обновление страницы', false);
                  searcherSubmit.getDiasbled().then(function(result) {
                    if (!result) {
                      sh.logStep('└ Нажатие "Найти"');
                      searcherSubmit.submit();
                      s.verifyRange(param, min, max,'Нажатие "Найти"', false);
                    }
                  });
                });
                browser.get(url);
              });
            });
          });

          xit('Поисковик (Районы)', function() {
            var v = function(dCount, sCount) {
              sh.logStep('Поиск по параметру: '
                + ('районы - ' + dCount + ', улицы - ' + sCount).bold);
              msDistricts.openDialog().then(function(res) {
                return res;
              }).then(function() {
                Promise.all([
                  msDistricts.getDictrictDataTypes(dCount),
                  msDistricts.getDictrictValues(dCount),
                  msDistricts.getStreetDataTypes(sCount),
                  msDistricts.getStreetValues(sCount)
                ]).then(function(params) {
                  var dParams = params[0];
                  var dValues = params[1];
                  var sParams = params[2];
                  var sValues = params[3];

                  msDistricts.closeDialog().then(function() {
                    sh.logStep('Значение: ' + params.join(", ") + '=' + values.join(", ")); //
                    sh.logStep('└ Выбор');
                    sd.select([dCount, sCount], page.getUrl());
                    dCount > 0 && s.verifyCheckbox(dParams, dValues, 'Выбор (районы)', false, true);
                    sCount > 0 && s.verifyCheckbox(sParams, sValues, 'Выбор (улицы)', false, true);
                    sd.verify([dCount, sCount], page.getUrl(), city);
                    sh.logStep('└ Обновление страницы');
                    browser.refresh();
                    dCount > 0 && s.verifyCheckbox(dParams, dValues, 'Обновление страницы (районы)', false, true);
                    sCount > 0 && s.verifyCheckbox(sParams, sValues, 'Обновление страницы (улицы)', false, true);
                    sd.verify([dCount, sCount], page.getUrl(), city);
                    searcherSubmit.getDiasbled().then(function(result) {
                      if (!result) {
                        sh.logStep('└ Нажатие "Найти"');
                        searcherSubmit.submit();
                        dCount > 0 && s.verifyCheckbox(dParams, dValues, 'Нажатие "Найти" (районы)', false, true, true);
                        sCount > 0 && s.verifyCheckbox(sParams, sValues, 'Нажатие "Найти" (улицы)', false, true, true);
                        sd.verify([dCount, sCount], page.getUrl(), city);
                      }
                    });
                  });
                });
              });
            };

            v(1, 0);
            v(2, 0);
            v(0, 1);
            v(0, 2);
            v(1, 1);
            v(2, 2);
          });

          xit('Поисковик (Заселиться в текущем году)', function() {});
          xit('Поисковик (Переключатели)', function() {});
          xit('Поисковик (Список)', function() {});
          xit('Поисковик (Срок сдачи)', function() {});
          xit('Поисковик (Текст)', function() {});
          xit('Поисковик (Тракты, районы)', function() {});
          xit('Поисковик (Флажок)', function() {});*/
        });
      }
    };

    filter(page.realty);
    filter(page.zastr);
    filter(page.realtyOut);
    filter(page.realtyRent);
    filter(page.commerce);
  });
});