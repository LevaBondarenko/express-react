var h = Object.create(require("../../../Helpers/helpers.js"));
/* Steps */
var login = Object.create(require("../LK/Login_Steps.js"));
/* Widgets */
var w = "../../../Widgets/";
var blogReading = Object.create(require(w + "BlogReading_Widget.js"));
var blogComments = Object.create(require(w + "BlogComments_Widget.js"));
var blogPost = Object.create(require(w + "BlogPost_Widget.js"));
var breadcrumbs = Object.create(require(w + "Breadcrumbs_Widget.js"));
var blogTitle = Object.create(require(w + "BlogTitle_Widget.js"));
var blogReadAlso = Object.create(require(w + "BlogReadAlso_Widget.js"));

module.exports = require("../../../Common/Element.js").extend({
  verifyBlogReading: function() {
    browser.getCurrentUrl().then(function(url) {

      expect(blogReading.getLabelMin())
        .toMatch("Время чтения: [0-9]+ мин", url);
      expect(blogReading.getNoTimeToReadBtnText())
        .toBe('НЕТ ВРЕМЕНИ ЧИТАТЬ?', url);
      expect(blogReading.hasReadLaterInput())
        .toBe(false, 'Поле ввода почты не отображается ' + url);
      expect(blogReading.hasReadLaterConfirm())
        .toBe(false, 'Кнопка отправки письма не отображается' + url);
      blogReading.toggleNoTimeToRead();
      expect(blogReading.getNoTimeToReadBtnText())
        .toBe('ПРОЧТУ СЕЙЧАС', url);
      h.wait(0.5);
      expect(blogReading.getNoTimeToReadLabel())
        .toBe('Отправим материал вам на почту:', url);
      expect(blogReading.hasReadLaterInput())
        .toBe(true, 'Поле ввода почты  отображается', url);
      expect(blogReading.hasReadLaterConfirm())
        .toBe(true, 'Кнопка отправки письма отображается', url);
      blogReading.clickReadLaterConfirm();
      expect(blogReading.getHelpBlock())
        .toBe('E-mail введен некорректно', url);
      blogReading.toggleNoTimeToRead();
      expect(blogReading.getNoTimeToReadBtnText())
        .toBe('НЕТ ВРЕМЕНИ ЧИТАТЬ?', url);
      h.wait(2);
      expect(blogReading.hasReadLaterInput())
        .toBe(false, 'Не отображается поле ввода email', url);
      expect(blogReading.hasReadLaterConfirm())
        .toBe(false, 'Не отображается кнопка отправки', url);
      blogReading.toggleNoTimeToRead();
      h.wait(2);
      blogReading.setEmail(browser.params.user.email);
      blogReading.clickReadLaterConfirm();
      h.wait(3);
      expect(blogReading.getSubscribed())
        .toBe('СПАСИБО!', url);
      expect(blogReading.getSubscribed2())
        .toBe('Скоро вы получите статью по почте', url);
      expect(blogReading.hasViewsIcon())
        .toBe(true, 'У записи должна быть иконка просмотров ', url);
      expect(blogReading.hasCommentsIcon())
        .toBe(true, 'У записи должна быть иконка комментариев ', url);

      browser.manage().getCookie("blogViews").then(function(views) {
        expect(blogReading.getViews()).not.toBeLessThan(views.value, url);
      });

      browser.manage().getCookie("blogComment").then(function(comments) {
        blogReading.getComments().then(function(commentsPost) {
          expect(commentsPost).not.toBeLessThan(comments.value, url);
          blogComments.getCount().then(function(commentsPost2) {
            expect(commentsPost).toBe(commentsPost2, url);
          });
        });
      });
    });
  },
  verifyBlogReadAlso: function(){
    browser.getCurrentUrl().then(function(url) {
      blogReadAlso.displayed().then(function(result) {
        if (result) {
          h.wait();
          expect(blogReadAlso.getTitle()).toBe('ЧИТАЙТЕ ТАКЖЕ:', url);
          blogReadAlso.getItemsCount().then(function(count) {
            blogReadAlso.getItems().each(function(item, index) {
              expect(blogReadAlso.hasImage(item)).toBe(true, url);
              expect(blogReadAlso.getName(item)).toMatch(".+",
                'Заголовок не пустой ' + url);
              if (index === count - 1) {
                browser.manage()
                  .addCookie("blogAlsoTitle", blogReadAlso.getName(item));
                browser.manage()
                  .addCookie("blogAlsoViews", blogReadAlso.getViews(item));
                browser.manage()
                  .addCookie("blogAlsoComments", blogReadAlso.getComments(item));

                blogReadAlso.clickReadMore(item).then(function() {
                  return h.wait(3);
                }).then(function() {
                  return browser.manage().getCookie("blogAlsoTitle")
                    .then(function(name) {
                    expect(blogTitle.getTitle())
                      .toContain(name.value.split(' ...')[0], url);
                  });
                }).then(function() {
                  return browser.manage().getCookie("blogAlsoViews")
                    .then(function(views) {
                    expect(blogReading.getViews())
                      .not.toBeLessThan(views.value, url);
                  });
                }).then(function() {
                  return browser.manage().getCookie("blogAlsoComments")
                    .then(function(comments) {
                    expect(blogReading.getComments())
                      .not.toBeLessThan(comments.value, url);
                  });
                }).then(function() {
                  h.back();
                });
              }
            });
          });
        }
      });
    });
  },
  verifyBlogPost: function() {
    browser.getCurrentUrl().then(function(url) {
      expect(blogPost.getContent())
        .toMatch(".+", 'Контент не пустой ' + url);
      expect(blogPost.hasFb())
        .toBe(true, 'У записи должна быть кнопка поделиться ВК ' + url);
      expect(blogPost.hasVk())
        .toBe(true, 'У записи должна быть кнопка поделиться FB ' + url);
    });
  },
  verifyBreadcrumbs: function() {
    browser.getCurrentUrl().then(function(url) {
      browser.manage().getCookie("blogTitle").then(function(title) {
        breadcrumbs.getText(3).then(function(br) {
          expect(title.value)
            .toContain(br.split(' ...')[0], 'Название статьи в ХК ' + url);
        });
      });
      expect(breadcrumbs.getItemsCount()).toBe(4,
        'Количество пунктов в хлебных крошках ' + url);
      expect(breadcrumbs.getText(0))
        .toBe('Главная', 'Первый пункт в ХК ' + url);
      expect(breadcrumbs.getText(1))
        .toBe('Блог', 'Второй пункт в КК ' + url);
    });
  },
  verifyBlogTitle: function() {
    browser.getCurrentUrl().then(function(url) {
      browser.manage().getCookie("blogTitle").then(function(title) {
        expect(blogTitle.getTitle()).toBe(title.value, url);
      });
    });
  },
  verifyBlogComments: function() {
    browser.getCurrentUrl().then(function(url) {
      h.wait();
      blogComments.getCount().then(function(commentsCount) {
        login.isNotLoggedIn().then(function(res) {
          if (res) {
            expect(blogComments.getName())
              .toBe('Пожалуйста, авторизуйтесь или зарегистрируйтесь, ' +
                'чтобы оставить комментарий.', url);
            expect(blogComments.buttonDisabled()).toBe(true, url);
          }
        });

        blogComments.getCount().then(function(commentsPost) {
          if (commentsPost > 0) {
            blogComments.getFirstCommentsCount().then(function(fcount) {
              expect(fcount)
                .toBe(1, 'Первый комментарий только 1 ' + url);
              blogComments.getCommentsCount().then(function(count) {
                expect(fcount + count)
                  .toBe(parseInt(commentsPost),
                    'Количество комментариев верное ' + url);
              });
            });

            var verifyCommentList = function(comment) {
              expect(blogComments.getAvatarUrl(comment))
                .toMatch(".+", 'Аватар не пустой ' + url);
              expect(blogComments.getAuthor(comment))
                .toMatch(".+", 'Автор комментария не пустой ' + url);
              expect(blogComments.getTime(comment))
                .toMatch(".+", 'Время комментария не пустое ' + url);
              expect(blogComments.getContent(comment))
                .toMatch(".+", 'Текст комментария не пустой ' + url);
              expect(blogComments.getVotes(comment))
                .toMatch("[0-9]+", 'Количество голосов - число ' + url);
              expect(blogComments.getReplyBtnText(comment))
                .toBe("Ответить", url);
              expect(blogComments.hasReplyForm(comment))
                .toBe(false, 'Форма ответа не отображается ' + url);
              blogComments.openReplyForm(comment);
              expect(blogComments.hasReplyForm(comment))
                .toBe(true, 'Форма ответа отображается ' + url);
            };

            blogComments.getFirstComments().each(function(comment, index) {
              verifyCommentList(comment);
            });
            blogComments.getComments().each(function(comment, index) {
              verifyCommentList(comment);
            });
          }
        });
        blogComments.commentsDisabled().then(function(disabled) {
          if (!disabled) {
            login.auth();
            h.wait(2);
            expect(blogComments.buttonDisabled())
              .toBe(true, 'Кнопка отправки комментария неактивна ' + url);
            blogComments.setName('Пользователь').then(function() {
              return expect(blogComments.buttonDisabled())
                .toBe(true, 'Кнопка отправки комментария неактивна ' + url);
            }).then(function() {
              return blogComments.setName('_2');
            }).then(function() {
              return blogComments.setComment('Текст комментария');
            }).then(function() {
              if (browser.params.domain === 'dev') {
                blogComments.publishComment().then(function() {
                  blogComments.getCount().then(function(commentsCount2) {
                    expect(commentsCount)
                      .toBe(commentsCount2,
                        'Количество комментариев не поменялось ' + url);
                  });
                });
              }
            });
            login.logoutNotFromLK();
          } else {
            expect(blogComments.getCommentInputPlaceholder())
              .toBe('Комментарии к данной записи отключены', url);
          }
        });
      });
    });
  }
});