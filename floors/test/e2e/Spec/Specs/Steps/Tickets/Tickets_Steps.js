/* Helpers */
var h = Object.create(require("../../../Helpers/pageHelpers.js"));
var wh = Object.create(require("../../../Helpers/waitHelpers.js"));
/* Pages */
var thankYouPage = Object.create(require("../../../Pages/Page.js")).thankYou;
var commonPage = Object.create(require("../../../Pages/Page.js")).common;
/* Steps */
var login = Object.create(require("../LK/Login_Steps.js"));
var api = Object.create(require("./TicketsApi_Steps.js"));
/* Widgets */
var JobListWidget = require("../../../Widgets/JobList_Widget.js");
var JobSeekerProfile = require("../../../Widgets/JobSeekerProfile_Widget.js");
var mortgageSearch = Object.create(require("../../../Widgets/MortgageSearchResult_Widget.js"));
var notify = Object.create(require("../../../Widgets/Notify_Widget.js"));
var rieltor = Object.create(require("../../../Widgets/Rieltor_Widget.js"));
var builderObjects = Object.create(require("../../../Widgets/BuilderObjects_Widget.js"));
var searcherSubmit = Object.create(require("../../../Widgets/MSearcherSubmit_Widget.js"));
var searcherSelect = Object.create(require("../../../Widgets/MSearcherSelect_Widget.js")).operation;
var layout = Object.create(require("../../../Widgets/SearchLayout_Widget.js"));
var objInfo = Object.create(require("../../../Widgets/FlatInfo_Widget.js"));
var filterQuarter = Object.create(require("../../../Widgets/FilterQuarterNew_Widget.js"));
var newhousesParameter = Object.create(require("../../../Widgets/NewhousesParameter_Widget.js"));
var searchFilter = Object.create(require("../../../Widgets/SearchFilter_Widget.js"));
/* Global data */
var LkUserPhone = '';
var LkUserName = '';

var TicketsSteps = require("../../../Common/Element.js").extend({
  prepare: function(order, city, page, typeId, index) {
    if (order.needAuth) {
      h.api('Авторизация в ЛК', 'POST', 'lkuser/login', '', {
        "login": browser.params.lkUser.login,
        "password": browser.params.lkUser.password
      }).then(function(authData) {
        h.api('Получение данных авторизованного пользователя ЛК',
          'GET', 'lkuser/' + authData.auth_hash, '').then(function(userData) {
          LkUserPhone = userData.phone;
          LkUserName = userData.i;
        });

        h.api('Список заявок пользователя ЛК',
          'GET', 'lkuser/' + authData.auth_hash + '/tickets', '')
          .then(function(ticketsData) {
          ticketsData.filter(function(elem) {
            return (elem.type_id == typeId) && (elem.active == 1);
          }).forEach(function(activeElem) {

            h.api('Удаление заявки', 'PUT',
              'lkuser/' + authData.auth_hash + '/tickets/' + activeElem.id,
              '', {
                "result": "ticket deleted",
                "active": "0"
              });
          });
        });
      });
    }

    index = index ? index : 0;

    if (browser.params.customUrl) {
      commonPage.get(browser.params.customUrl);
      browser.manage().addCookie('send', 'true');
    } else {
      page.get(city).then(function() {
        if (browser.params.pageNotFound) {
          browser.manage().addCookie('send', 'false');
        } else {
          if (browser.params.needRefreshAfterLogout) {
            browser.refresh();
            browser.params.needRefreshAfterLogout = false;
          }
          browser.manage().addCookie('send', 'true');
          if (order.insideProgram) {
            mortgageSearch.getProgramLink(0).then(function(programLink) {
              commonPage.get(programLink);
            });
          } else if (order.insideBank) {
            mortgageSearch.getBankLink(0).then(function(bankLink) {
              commonPage.get(bankLink);
            });
          } else if (order.insideObject || order.insideLayout
            || order.insideBuilder || order.insideNewNhObject) {
            if (typeId === 16) {
              searcherSelect.openList();
              searcherSelect.selectLease();
            }
            searcherSubmit.getDiasbled().then(function(result) {
              if (!result) {
                searcherSubmit.submit();

                if (order.insideNewNhObject) {
                  searchFilter.displayed().then(function(oldFilter) {
                    if (oldFilter) {
                      searchFilter.clickBuilder();
                    } else {
                      browser.getCurrentUrl().then(function(url) {
                        browser.get(url + (url.indexOf('?') > -1 ? '&' : '?')
                         + 'dolshik=f');
                      });
                    }
                  });
                  layout.getObjectsCount().then(function(count) {
                    if (count === 0) {
                      browser.manage().addCookie('send', 'false');
                    }
                  });
                } else if (order.insideBuilder) {
                  layout.hasBuilderLink(0).then(function(hasBuilder) {
                    if (hasBuilder) {
                      layout.getBuilderLink(0).then(function(builderLink) {
                        commonPage.get(builderLink);
                      });
                    } else {
                      browser.manage().addCookie('send', 'false');
                    }
                  });
                }

                if (order.insideObject || order.insideNewNhObject) {
                  layout.getObjectLink(0).then(function(objectLink) {
                    commonPage.get(objectLink);
                  });
                  if (order.insideNewNhObject) {
                    filterQuarter.flats.getCount().then(function(count) {
                      if (count > 0) {
                        filterQuarter.flats.isClickableSome().then(function(displayed) {
                          if (displayed) {
                            filterQuarter.flats.isDolshikActive().then(function(result) {
                              if (result) {
                                filterQuarter.flats.getNotDolshikFlatsCount()
                                  .then(function(count) {
                                  if (count > 0) {
                                    filterQuarter.flats.clickAnyNotDolshikFlat();
                                    h.wait(3);
                                  } else {
                                    browser.manage().addCookie('send', 'false');
                                  }
                                });
                              }
                            });
                          } else {
                            browser.manage().addCookie('send', 'false');
                          }
                        });
                      } else {
                        browser.manage().addCookie('send', 'false');
                      }
                    });
                  }
                }
              } else {
                browser.manage().addCookie('send', 'false');
              }
            });
          }

          if (JobSeekerProfile.isPrototypeOf(order)) {
            order.displayed().then(function(res) {
              if (res) {
                order.openProfile();
                h.selectTab(1);
              } else {
                browser.manage().addCookie('send', 'false');
              }
            })
          }
        }
      });
    }
  },

  sendTicket: function(order, city, page, typeId, index) {
    var commentParts = new Array();
    var phone = order.needAuth ? null : h.getRandomPhone();
    browser.params.phone = phone;

    browser.getCurrentUrl().then(function(url) {
      browser.params.ticketUrl = url;
    });

    index = index ? index : 0;
    return order.displayed(index).then(function(resultDisplayed) {
      if (resultDisplayed || !order.mayBeMissing) {
        if (order.button) {
          order.openModal(index);
        }
        phone = phone || LkUserPhone;

        browser.manage().addCookie("E2E_sendTicket_ID", "");

        // Заполнение заявки и комментарий (заполнение commentParts)

        if (order.comment.indexOf('objId') > -1) {
          objInfo.getObjectID().then(function(objId) {
            commentParts.push(objId);
          });
        }

        if (order.comment.indexOf('nhId') > -1) {
          browser.getCurrentUrl().then(function(nhId) {
            var urlArr = nhId.split('-');
            commentParts.push(urlArr[urlArr.length - 1]);
          });
        }

        if (order.comment.indexOf('nhName') > -1) {
          newhousesParameter.title.get().then(function(gpName) {
            commentParts.push(gpName);
          });
        }

        if (order.comment.indexOf('fio') > -1) {
          rieltor.isV2().then(function(isV2) {
            if (isV2) {
              rieltor.v2.getName().then(function(fio) {
                fio.split(/\s/).forEach(function(elem) {
                  commentParts.push(elem);
                });
              });
            } else {
              rieltor.v1.getRieltorFIO().then(function(fio) {
                fio.split(/\s/).forEach(function(elem) {
                  commentParts.push(elem);
                });
              });
            }
          });
        }

        if (order.comment.indexOf('builderName') > -1) {
          builderObjects.getBuilderName().then(function(builderName) {
            commentParts.push(builderName.split('ПРОЕКТЫ ЗАСТРОЙЩИКА')[1]);
          });
        }

        if (order.comment.indexOf('reviewData') > -1) {
          order.fillReviewData();
          browser.manage().getCookie("E2E_sendTicket_nhReview_date")
            .then(function(res) {
              commentParts.push(res.value);
            });
          browser.manage().getCookie("E2E_sendTicket_nhReview_time")
            .then(function(res) {
              commentParts.push(res.value);
            });
        }

        if (order.comment.indexOf('broker') > -1) {
          commentParts.push('Заявку следует назначить на выбранного клиентом персонального менеджера');
        }

        if (JobListWidget.isPrototypeOf(order)) {
          commentParts.push('Резюме не прикреплено');
          expect(order.getJobName()).toBe(order.getListJobName(), phone);
        }

        if (JobSeekerProfile.isPrototypeOf(order)) {
          order.fillProfile();
          order.getDataArray().forEach(function(elem) {
            commentParts.push(elem);
          });
          browser.manage().getCookie("E2E_sendTicket_vacancy")
            .then(function(vacany) {
              commentParts.push(vacany.value);
            });
        }

        //Телефон

        if (order.hasPhoneField) {
          order.fillPhone(phone, index);
        }
        commentParts.push(h.getFormattedPhone(phone, order.phoneFormat, city));

        //Имя клиента

        if (order.hasNameField) {
          var name = browser.params.ticket.name;
          order.fillName(name, index);
        } else {
          var name = browser.params.ticket.defaultName;
        }

        if (order.needAuth) {
          name = '';
        } else if (order.hasNameField) {
          commentParts.push(name);
        }

        //Дополнительная информация

        if (order.hasCustomField) {
          var custom = browser.params.ticket.custom;
          order.fillCustom(custom, index);
          commentParts.push(custom);
        }

        //Отправляем заявку

        order.submitFrm(index);

        if (order.needAuth) {
          login.authInPresentForm();
        }

        var handleTicket = function() {
          return Promise.all([
            browser.manage().getCookie("E2E_sendTicket_ID")
          ]).then(function(resParams){
            var id = resParams[0] ? resParams[0].value : null;
            commentParts = order.noComment ? [] : commentParts;

            if (order.needAuth) {
              browser.params.needRefreshAfterLogout = true;
              browser.manage().getCookie("auth_hash").then(function(authHash) {
                if (authHash) {
                  h.api('Выход из ЛК', 'GET','lkuser/'
                    + authHash.value.split("%22").join("") + '/logout',
                    '').then(function(authData) {
                  });
                } else {
                  login.logout();
                }
              });
            }

            return api.handleTicket(id,
              phone,
              typeId,
              name,
              city,
              h.getToday(),
              commentParts,
              !order.needAuth);
          });
        };

        if (order.redirectToThankYouPage || order.waitRedirect) {
          return wh.waitUrlChanged(browser.params.ticketUrl,
            200000).thenFinally(function() {
            h.logCurrentPageUrl();
            browser.getCurrentUrl().then(function(url) {
              if (url.indexOf('ticket_id') > -1) {
                var ticket_id = url.split('?')[1].split('&')
                .filter(function(param) {
                  return param.indexOf('ticket_id') > -1;
                })[0].split('=')[1];
                browser.manage().addCookie("E2E_sendTicket_ID", ticket_id);
              }
            });
            return handleTicket();
          });
        } else if (order.waitNotification) {
          notify.getBodyBold().then(function(ticket_id) {
            browser.manage().addCookie("E2E_sendTicket_ID", ticket_id);
          });
          return handleTicket();
        } else {
          return handleTicket();
        }
      } else {
        browser.params.ticketNotFound = true;
      }
    });
  }
});

module.exports = TicketsSteps;