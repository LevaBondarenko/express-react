/**
 * BuilderPromo Widget
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class LandingAnimation extends Component {

  constructor(props) {
    super(props);
  }

  // ф-я проверяет, находится ли переданный элемент в области экрана
  isScrolledIntoView(selector) {
    var $query = $(selector);
    var $window = $(window);
    var result = false;

    $query.each((key, elem) => {
      var $elem = $(elem);
      var docViewTop = $window.scrollTop();
      var docViewBottom = docViewTop + $window.height();

      var elemTop = $elem.offset().top;
      var elemBottom = elemTop + $elem.height() - 100;

      result = result ||
        (elemBottom < docViewBottom) && (elemTop > docViewTop);
    });

    return result;
  }

  componentDidMount() {

    $(() => {
      // анимация виджетов "Наши сервисы"
      const selector = '.landingServices',
        targetElem = $('.landingservice--wrap'),
      // анимация виджетов "Возможности ЛК"
        selector2 = '.landingFeatureWrapper_normal .landingfeature_btn',
        targetElem2 = $('.landingfeature--wrap-normal'),
      // анимация виджета "Торги"
        selector3 = '.anchor_btn',
        targetElem3 = $('.landingTrades'),
      // анимация ноутбука
        selector4 = '.landingtop_regBtn',
        targetElem4 = $('.landingtop--wrap'),

        selector5 = '.landingFeatureWrapper_reverse .landingfeature_btn',
        targetElem5 = $('.landingfeature--wrap-reverse'),
      // анимация программы тренинга
        selector6 = '.landingLearn',
        targetElem6 = $('.landinglearn-wrapper'),
        selector7 = '.landingLearn-pics',
        targetElem7 = $('.landingservice--wrap');


      if (this.isScrolledIntoView(selector4)) {
        targetElem4.removeClass('transformed');
      }

      if (this.isScrolledIntoView(selector)) {
        targetElem.removeClass('transformed');
      }

      if (this.isScrolledIntoView(selector2)) {
        targetElem2.removeClass('transformed');
      }

      if (this.isScrolledIntoView(selector5)) {
        targetElem5.removeClass('transformed');
      }

      if (this.isScrolledIntoView(selector6)) {
        targetElem6.removeClass('transformed');
      }
      if (this.isScrolledIntoView(selector7)) {
        targetElem7.removeClass('transformed');
      }
      if (this.isScrolledIntoView(selector3)) {
        targetElem3.removeClass('transformed');
      }

      $(document).on('scroll', () => {
        if (this.isScrolledIntoView(selector) &&
          targetElem.hasClass('transformed')) {
          targetElem.removeClass('transformed');
        }

        if (this.isScrolledIntoView(selector2) &&
          targetElem2.hasClass('transformed')) {
          targetElem2.removeClass('transformed');
        }

        if (this.isScrolledIntoView(selector3) &&
          targetElem3.hasClass('transformed')) {
          targetElem3.removeClass('transformed');
        }

        if (this.isScrolledIntoView(selector4) &&
          targetElem4.hasClass('transformed')) {
          targetElem4.removeClass('transformed');
        }

        if (this.isScrolledIntoView(selector5) &&
          targetElem5.hasClass('transformed')) {
          targetElem5.removeClass('transformed');
        }

        if (this.isScrolledIntoView(selector6) &&
            targetElem6.hasClass('transformed')) {
          targetElem6.removeClass('transformed');
        }
        if (this.isScrolledIntoView(selector7) &&
          targetElem7.hasClass('transformed')) {
          targetElem7.removeClass('transformed');
        }
      });
    });

  }

  render() {
    return (
      <div style={{display: 'none'}}></div>
    );
  }
}

export default LandingAnimation;
