/**
 * LK Booking Head component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import {size, map} from 'lodash';
import {declOfNum} from '../../../utils/Helpers';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './style.scss';

class LKBookingHead extends Component {
  static propTypes = {
    user: PropTypes.object,
    objects: PropTypes.object,
    bookingList: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    step: PropTypes.number,
    bookingId: PropTypes.string,
    bookingCount: PropTypes.number,
    comission: PropTypes.number,
    timeToPay: PropTypes.number
  };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.removeCss = s._insertCss();
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    const {step, bookingCount, comission, timeToPay} = this.props;
    const bookingCountDecl = declOfNum(bookingCount, [
      'бронирование',
      'бронирования',
      'бронирований'
    ]);
    const stepNames = {
      1: '1 шаг. бронирование', 2: '2 шаг. оплата', 3: '3 шаг. заселение'
    };
    let steps = map(stepNames, (item, key) => {
      const className = parseInt(key) === step ? s.lkBodyBookingStepActive : (
        parseInt(key) < step ? s.lkBodyBookingStepComplete : s.lkBodyBookingStep
      );

      return (
        <div
          key={key}
          className={className}>
          <span className={s.bookingStepItem}>{key}</span>
          <span className={s.bookingStepItemTitle}>{item}</span>
        </div>
      );
    });
    const description = {
      1: (
        <div>
          <span>
            У Вас есть {bookingCount} {bookingCountDecl}. Отслеживайте статус
            ваших бронирований онлайн или ожидайте смс с подтверждением.
          </span>
          <br/>
          <span>
            После подтверждения бронирования от собственника вы увидите статус
            "Забронировано" и сможете перейти к оплате.
          </span>
          <br/>
          <span className={s.important}>
            Единожды оплатив комиcсию&nbsp;
            <Price price={comission}> <PriceUnit/></Price>
            , вы получите контакты собственников по трем одобренным квартирам.
          </span>
        </div>
      ),
      2: (
        <div>
          <span>
            Поздравляем! Собственник будет рад сдать вам квартиру! Бронь на
            квартиру активна в течение {timeToPay}
            {declOfNum(timeToPay, [' часа', ' часов', ' часов'])}.
          </span>
          <br/>
          <span>
            За это время вам необходимо оплатить комиссию за пользование
            сервисом - <Price price={comission}> <PriceUnit/></Price>&nbsp;
            Иначе бронь аннулируется.
          </span>
        </div>
      ),
      3: (
        <div>
          <span>
            Оплата прошла успешно! С этого момента можете созвонится с
            собственником и заселяться.
          </span>
        </div>
      )
    };

    steps = size(steps) > 0 ?
      createFragment({steps: steps}) :
      createFragment({steps: <div/>});

    return (
      <div className={s.lkBodyBookingHead}>
        {description[step]}
        <div className={s.lkBodyBookingSteps}>
          {steps}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(LKBookingHead);
