/**
 * LK Booking Payment type selector component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import moment from 'moment/moment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {capitalizeString, getTitle, getAdress} from 'etagi-helpers';
import {isAbsolutePath, priceFormatter, priceCleanup}
 from '../../../utils/Helpers';
import {getApiMediaUrl, getAgavaUrl} from '../../../utils/mediaHelpers';
import {clone, map} from 'lodash';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
import CheckButton from '../../../shared/CheckButton';
import HelpIcon from '../../../shared/HelpIcon';
import request from 'superagent';
import ga from '../../../utils/ga';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import s from './style.scss';
/**
 * React/Flux entities
 */
import wss from '../../../stores/WidgetsStateStore';
import WidgetsActions from '../../../actions/WidgetsActions';

class LKBookingPaymentType extends Component {
  static propTypes = {
    price: PropTypes.number,
    book: PropTypes.object,
    bookingId: PropTypes.number,
    buttonLoader: PropTypes.bool,
    comission: PropTypes.number,
    paymentsUrl: PropTypes.string,
    paymentsScid: PropTypes.number,
    phone: PropTypes.string,
    timeToPay: PropTypes.number,
    user: PropTypes.object,
    obj: PropTypes.object,
    objId: PropTypes.number,
    mediaSource: PropTypes.number,
    ticketId: PropTypes.number,
    servicesInfo: PropTypes.array,
    officeHours: PropTypes.array,
    tomorrowOfficeHours: PropTypes.array,
    onPrint: PropTypes.func,
    onNeedRefresh: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      paymentType: 'bankCard',
      selectedCity: {}
    };
  }

  componentWillMount() {
    this.onChange();
    wss.onChange(this.onChange);
  }

  componentDidMount() {
    if(this.calcTimeleft()) {
      this.timer = setInterval(() => {
        this.calcTimeleft();
      }, 1000);
    }
  }

  componentWillUnmount() {
    wss.offChange(this.onChange);
  }

  calcTimeleft = () => {
    const {book, timeToPay} = this.props;
    const {bookConfirmDate} = book.details;

    if(bookConfirmDate && book.state === 7) {
      const paymentDeadline = moment(bookConfirmDate).add(timeToPay, 'hours');

      if(moment().isAfter(paymentDeadline)) {
        this.props.onNeedRefresh();
        clearInterval(this.timer);
        window.location.hash = '/booking/';
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  typeChange = e => {
    const {value} = e.target;

    this.setState(() => ({paymentType: value}));
    value === 'cash' ?
    ga('radiobutton', 'click',
      'rent_online_LK_step2_Nalichnymi_v_ofise') : null;
    value === 'bankCard' ?
    ga('radiobutton', 'click', 'rent_online_LK_step2_Bankovskoj_kartoj') : null;
  }

  onChange = () => {
    const {selectedCity, currency} = wss.get();

    this.setState(() => ({
      currency: currency,
      selectedCity: selectedCity
    }));
  }

  onPay = () => {
    console.log('onPay'); //eslint-disable-line no-console
    ga('button', 'rent_online_LK_step2_oplata');
  }

  onSend = () => {
    const {
      bookingId,
      comission,
      mediaSource,
      obj,
      phone,
      price,
      servicesInfo,
      user
    } = this.props;
    const {currency} = this.state;

    if (obj && user.email) {
      this.setState({
        buttonLoader: true
      });

      const title = obj.type !== 'flat' ?
        (obj.type_ru ? capitalizeString(obj.type_ru) : 'квартира') :
        getTitle(obj.rooms);
      const course = currency ? currency.nominal / currency.value : 1;
      const unit = currency ? currency['symbol'] : 'руб.';
      const objPrice =
       `${priceFormatter(Math.round(parseInt(priceCleanup(obj.price)) *
        course))} ${unit}/мес.`;
      const services = map(servicesInfo, (value) => {
        const service = clone(value);

        service.price =
         `${priceFormatter(Math.round(parseInt(priceCleanup(value.price)) *
          course))} ${unit}`;

        return service;
      });
      const comissionFee =
       `${priceFormatter(Math.round(parseInt(priceCleanup(comission)) *
        course))} ${unit}`;
      const totalPrice =
       `${priceFormatter(Math.round(parseInt(priceCleanup(price)) *
        course))} ${unit}`;
      const square = `${obj.square} м²`;
      const floorCount = `${obj.floor}/${obj.floors}`;
      let address = getAdress(
        obj.district, obj.street, obj.house_num
      );

      address = `${obj.city}, ${address}`;

      const visual = obj.visual;
      const width = 240;
      const height = 160;
      const imageType = visual !== 'layout' && visual !== 'photo' ?
        visual : (visual === 'layout' ? 'layouts' : 'photos');
      let image = obj.main_photo;

      if (!isAbsolutePath(image)) {
        if (image === '0' || image === null) {
          image = mediaSource ?
            getApiMediaUrl('content', 'no_photo', 'photos.png', mediaSource) :
            getAgavaUrl(width, height, 'photos', 1, 1, 0, 'no_photo');
        } else {
          image = mediaSource ?
            getApiMediaUrl(`${width}${height}`, imageType, image, mediaSource) :
            getAgavaUrl(width, height, imageType, 1, 1, 1, image);
        }
        image = `https:${image}`;
      }

      request
      .post('/backend/')
      .send({
        action: 'send_rolk_receipt',
        actionType: 'bill',
        address: address,
        bookingId: bookingId,
        comission: comissionFee,
        email: user.email,
        floorCount: floorCount,
        image: image,
        objPrice: objPrice,
        phone: phone,
        price: totalPrice,
        services: JSON.stringify(services),
        square: square,
        title: title
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки сообщения на почту. Попробуйте обновить страницу', // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Сообщение с квитанцией на оплату успешно отправлено', // eslint-disable-line max-len
            type: 'info'
          }]);
          this.setState({
            buttonLoader: false
          });
        }
      });
    } else {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки сообщения на почту. Попробуйте обновить страницу',
        type: 'dang'
      }]);
    }

    ga('button', 'rent_online_LK_step2_Otpravit_na_pochtu');
  }

  paymentDeadline = simple => {
    const settings = {
      calendar: {
        lastDay: '[вчера до] HH:mm',
        sameDay: '[сегодня до] HH:mm',
        nextDay: '[завтра до] HH:mm'
      }
    };

    moment.updateLocale('ru', settings);

    const {book, timeToPay} = this.props;
    const paymentDeadline = moment(book.details.bookConfirmDate)
      .add(timeToPay, 'hours');
    const isDeadlineTomorrow = moment().endOf('day').isBefore(paymentDeadline);
    const isLate = moment().isAfter(paymentDeadline);

    if(simple) {
      return isLate ? (
        <span className={s.colorRed}>
          Мы сожалеем, но вы не успели оплатить это бронирование
          <br/><br/>
        </span>
      ) : (
        <span>
          Вы необходимо оплатить это бронирование<br/>
          {isDeadlineTomorrow ? <span>сегодня или </span> : null}
          {paymentDeadline.calendar()}
          <br/><br/>
        </span>
      );
    } else {
      const {officeHours, tomorrowOfficeHours} = this.props;
      const worktimeStart =
        moment({
          hours: officeHours[0].split(':')[0],
          minute: officeHours[0].split(':')[1]
        });
      const worktimeStop =
        moment({
          hours: officeHours[1].split(':')[0],
          minute: officeHours[1].split(':')[1]
        });
      const isBeforeWork = paymentDeadline.isBefore(worktimeStart);
      const isAfterWork = paymentDeadline.isAfter(worktimeStop);
      const isNowBeforeWork = moment().isBefore(worktimeStart);
      let res = <span/>;

      if(isDeadlineTomorrow) {
        const tomorrowWorktimeStart =
          moment({
            hours: tomorrowOfficeHours[0].split(':')[0],
            minute: tomorrowOfficeHours[0].split(':')[1]
          }).add(1, 'days');
        const tomorrowWorktimeStop =
          moment({
            hours: tomorrowOfficeHours[1].split(':')[0],
            minute: tomorrowOfficeHours[1].split(':')[1]
          }).add(1, 'days');
        const isNowAfterWork = moment().isAfter(worktimeStop);
        const isTomorrowBeforeWork =
          paymentDeadline.isBefore(tomorrowWorktimeStart);
        const isTomorrowAfterWork =
          paymentDeadline.isAfter(tomorrowWorktimeStop);
        const today = isNowAfterWork ? null : (
          <span>
            сегодня&nbsp;
            {isNowBeforeWork ? (
              <span> с {worktimeStart.format('HH:mm')} </span>
            ) : null}
            до {worktimeStop.format('HH:mm')}
          </span>
        );
        const tomorrow = isTomorrowBeforeWork ? null : (
          <span>
            завтра c {tomorrowWorktimeStart.format('HH:mm')}&nbsp;
            до&nbsp;
            {isTomorrowAfterWork ?
              tomorrowWorktimeStop.format('HH:mm') :
              paymentDeadline.format('HH:mm')
            }
          </span>
        );

        res = isLate || (!today && !tomorrow) ? (
          <span className={s.colorRed}>
            Мы сожалеем, но оплатить наличными вы уже не сможете
            <br/><br/>
          </span>
        ) : (
          <span>
            Ждем вас в офисе&nbsp;
            {today}
            {today && tomorrow ? <span> или </span> : null}
            {tomorrow}
            <br/><br/>
          </span>
        );
      } else {
        res = isLate || isBeforeWork ? (
          <span className={s.colorRed}>
            Мы сожалеем, но оплатить наличными вы уже не сможете
            <br/><br/>
          </span>
        ) :
        (
          <span>
            Ждем вас в офисе сегодня&nbsp;
            {isNowBeforeWork ? (
              <span> с {worktimeStart.format('HH:mm')} </span>
            ) : null}
            до&nbsp;
            {isAfterWork ? worktimeStop.format('HH:mm') :
              paymentDeadline.format('HH:mm')}
            <br/><br/>
          </span>
        );
      }

      return res;
    }
  }

  focusOnHelp = e => {
    let ancestor = e.target;

    while(!ancestor.dataset.bookid && (ancestor = ancestor.parentNode)) {};

    const {bookid} = ancestor.dataset;

    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    document.getElementById(bookid) && document.getElementById(bookid).click();
  }

  render() {
    const {buttonLoader, paymentType, selectedCity} = this.state;
    const {
      price, paymentsUrl, paymentsScid, user, objId, ticketId, servicesInfo
    } = this.props;
    const redirectURI = `${window.location.protocol}//${window.location.host}/backend/`; //eslint-disable-line max-len

    return (
      <Row className={s.lkBodyBookingPaymentType}>
        <Col xs={12} className={s.paymentTypeTitle}>
          Выберите способ оплаты
        </Col>
        <Col xs={12}>
          <Col xs={4}>
            <CheckButton
              itemID='payments-bankCard'
              onValue='bankCard'
              radiomode={true}
              onChange={this.typeChange}
              checked={paymentType === 'bankCard'}
              itemLabel={(
                <span>
                  <strong>Банковской картой</strong> (выбирают 98% людей)
                </span>
              )}/>
            {paymentType === 'bankCard' ? (
              <div className={s.paymentInfo}>
                <i className='ico-card-visa'/>
                <i className='ico-card-mastercard'/>
              </div>
            ) : null}
          </Col>
          {paymentType === 'bankCard' ? (
            <Col xs={5} className={s.paymentDesc}>
              {this.paymentDeadline(true)}
              Оплата проводится через Яндекс.Деньги.
            </Col>
          ) : null}
          {paymentType === 'bankCard' ? (
            <Col xs={3} className={s.withMargin}>
              <form action={paymentsUrl} method='post'>
                <input name='shopId' value={49282} type='hidden'/>
                <input name='paymentType' value='AC' type='hidden'/>
                <input name='scid' value={paymentsScid} type='hidden'/>
                <input name='customerNumber'
                  value={user.riesId || ''} type='hidden'/>
                <input name='object_id' value={objId} type='hidden'/>
                <input name='ticket_id' value={ticketId} type='hidden'/>
                <input name='sum' value={price} type='hidden'/>
                <input name='servicesInfo'
                  value={JSON.stringify(servicesInfo)} type='hidden'/>
                <input name='shopSuccessURL' value={redirectURI} type='hidden'/>
                <input name='shopFailURL' value={redirectURI} type='hidden'/>
                <Button
                  bsStyle='primary'
                  type='submit'
                  onClick={this.onPay}>
                  Оплатить&nbsp;
                  <Price price={price}> <PriceUnit/></Price>
                </Button>
              </form>
            </Col>
          ) : null}
        </Col>
        <Col xs={12}>
          <Col xs={4}>
            <CheckButton
              itemID='payments-cash'
              onValue='cash'
              radiomode={true}
              onChange={this.typeChange}
              checked={paymentType === 'cash'}
              itemLabel={(
                <span>
                  <strong>Наличными в офисе</strong> (выбирают 2% людей)
                </span>
              )}/>
            {paymentType === 'cash' ? (
              <div className={s.paymentInfo}>
                <span>Адрес офиса:</span><br/>
                <span className={s.officeAddress}>
                  г. {selectedCity.name}, {selectedCity.address}
                </span>
              </div>
            ) : null}
          </Col>
          {paymentType === 'cash' ? (
            <Col xs={5} className={s.paymentDesc}>
              {this.paymentDeadline(false)}
              По возможности возьмите с собой распечатанную квитанцию<br/>
              или отправьте ее себе на почту, чтобы показать на телефоне в<br/>
              офисе. Это ускорит процесс оплаты
            </Col>
          ) : null}
          {paymentType === 'cash' ? (
            <Col xs={3}>
              {user.email ?
                (<Button
                  bsStyle='default'
                  disabled={buttonLoader}
                  onClick={this.onSend}>
                  {buttonLoader ?
                    <i className='fa fa-spinner fa-spin' /> :
                    <span>Отправить на почту</span>
                  }
                </Button>) :
                (<Button
                  data-bookid={`bookId${objId}`}
                  className='btn-disabled'
                  bsStyle='default'
                  onClick={this.focusOnHelp}>
                  Отправить на почту
                  <HelpIcon
                    id={`bookId${objId}`}
                    closeButton={true}
                    className='help-valign-center2 help-border-circle help-text-left' // eslint-disable-line max-len
                    placement='top'
                    helpText={(
                      <span>
                        Для того, чтобы отправить квитанцию на почту,<br />
                        в профиле ЛК должен быть указан ее адрес.
                      </span>
                    )}/>
                </Button>)
              }
              <Button
                bsStyle='primary'
                onClick={this.props.onPrint}>
                Распечатать квитанцию
              </Button>
            </Col>
          ) : null}
        </Col>
      </Row>
    );
  }
}

export default withStyles(s)(LKBookingPaymentType);
