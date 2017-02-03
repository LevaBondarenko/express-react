/**
 * LK Booking List Item component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import moment from 'moment/moment';
import classNames from 'classnames';
import HelpIcon from '../../../shared/HelpIcon';
import {generateSearchUrl, declOfNum, priceFormatter} from 'etagi-helpers';
import {includes, clone} from 'lodash';

import ga from '../../../utils/ga';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './style.scss';
import LKBookingObjInfo from './LKBookingObjInfo';

/*global data*/

class LKBookingListItem extends Component {
  static propTypes = {
    user: PropTypes.object,
    book: PropTypes.object,
    obj: PropTypes.object,
    similarityParams: PropTypes.array,
    onBookingUpdate: PropTypes.func,
    onNeedRefresh: PropTypes.func,
    rentCount: PropTypes.string,
    phone: PropTypes.string,
    comission: PropTypes.number,
    timeToPay: PropTypes.number,
    ownerUnavailableTime: PropTypes.number,
    currency: PropTypes.object,
    alreadyPayed: PropTypes.bool,
    notSettled: PropTypes.bool,
    requestSended: PropTypes.bool,
    event: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      timeLeft: false
    };
  }

  componentWillMount() {
    this.removeCss = s._insertCss();
  }

  componentDidMount() {
    if(this.calcTimeleft()) {
      this.timer = setInterval(() => {
        const timeLeft = this.calcTimeleft();

        if(timeLeft) {
          this.setState(() => ({timeLeft: timeLeft}));
        } else {
          this.setState(() => ({timeLeft: false}));
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.removeCss();
  }

  cancelBooking = () => {
    this.props.onBookingUpdate('cancel', this.props.book.objectId);
    ga('button', 'rent_online_LK_step1_Otmenit_bronirovanie');
  }

  cancelPayedBooking = () => {
    this.props.onBookingUpdate('not_settle', this.props.book.objectId);
  }

  deleteBooking = () => {
    this.props.onBookingUpdate('delete', this.props.book.objectId);
    ga('button', 'rent_online_LK_step1_Udalit_iz_spiska');
  }

  selectNewBooking = () => {
    this.props.onBookingUpdate('select', this.props.book.objectId);
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

  trackPay = () => {
    ga('button', 'rent_online_LK_step1_Perejti_k_oplate');
  }

  descReplacing(desc) {
    const {
      rentCount, timeToPay, comission, book, currency, phone,
      ownerUnavailableTime
    } = this.props;
    const bookingId = book.details.selectedId;
    let newDesc = desc;

    newDesc = newDesc.replace(
      '${COUNT}',
      `${rentCount} ${declOfNum(rentCount, ['предложение', 'предложения', 'предложений'])}` //eslint-disable-line max-len
    );
    newDesc = newDesc.replace(
      '${PTIME}',
      `${timeToPay} ${declOfNum(timeToPay, ['часа', 'часов', 'часов'])}`
    );
    newDesc = newDesc.replace(
      '${UTIME}',
      `${ownerUnavailableTime} ${declOfNum(ownerUnavailableTime, ['часа', 'часов', 'часов'])}` //eslint-disable-line max-len
    );
    newDesc = newDesc.replace(
      '${COMISSION}',
      currency ?
        `${priceFormatter(currency.course * comission)} ${currency.unit}` :
        `${priceFormatter(comission)} руб.`
    );
    newDesc = newDesc.replace('${PHONE}', phone);
    newDesc = newDesc.replace('${BOOKINGID}', bookingId);

    return newDesc;
  }

  calcTimeleft = () => {
    const {book, timeToPay} = this.props;
    const {bookConfirmDate} = book.details;

    if(bookConfirmDate && book.state === 7) {
      const paymentDeadline = moment(bookConfirmDate).add(timeToPay, 'hours');

      if(moment().isAfter(paymentDeadline)) {
        this.props.onNeedRefresh();
        clearInterval(this.timer);
        return false;
      } else {
        return moment(
          paymentDeadline - moment()
        ).subtract(5, 'hours').format('HH:mm:ss');
      }
    } else {
      return false;
    }
  }

  trackLink = () => {
    ga('button', 'rent_online_LK_step1_najti_pohozhie_varianty');
  }

  get analogsLink() {
    const {obj} = this.props;
    const like = this.props.similarityParams;
    const filter = {
      class: obj.class
    };
    const searchUrls = {
      flats: '/realty/search/',
      newhousesflats: '/zastr/search/',
      cottages: '/realty_out/search/',
      offices: '/commerce/search/',
      rent: '/realty_rent/search/'
    };
    const mustBeArrays = ['type', 'rooms'];

    for(const l in like) {
      if(like[l] && obj[like[l].param]) {
        const param = like[l].param;
        const percent = like[l].percent;
        let deviation = parseFloat(like[l].deviation);

        if(percent) {
          deviation = Math.floor(
            parseInt(obj[param]) * deviation / 100
          );
        }

        if(param !== 'distance') {
          if(deviation === 0) {
            filter[param] = includes(mustBeArrays, param) ?
              [obj[param].toString()] : obj[param].toString();
          } else {
            filter[`${param}_min`] =
              (parseFloat(obj[param]) - deviation).toString();
            filter[`${param}_max`] =
              (parseFloat(obj[param]) + deviation).toString();
          }
        } else if(parseFloat(obj.la) > 0 && parseFloat(obj.lo) > 0) {
          filter.distance = deviation.toString();
          filter.la = obj.la.toString();
          filter.lo = obj.lo.toString();
        }
      }
    }
    return generateSearchUrl(
      filter,
      `${searchUrls[obj.class]}?`,
      true
    );
  }

  get timeLeft() {
    const {timeLeft} = this.state;

    return timeLeft ? (
      <div className={classNames(
        s.bookingTimeLeft, {[s.active]: timeLeft !== false}
      )}>
        <span className={s.timeLeftTitle}>
          До отмены бронирования осталось:
        </span>&nbsp;
        <span className={s.timeLeftValue}>
          {timeLeft}
        </span>
      </div>
    ) : (
      <div className={s.bookingTimeLeft}/>
    );
  }

  get actionPrimary() {
    const {book, alreadyPayed, notSettled, requestSended} = this.props;
    let button = null;

    switch(book.state) {
    case 1:
      //Ожидайте подтверждения от собственника
    case 2:
      //Ожидайте звонка
    case 8:
      //Ожидайте подтверждения от собственника. Все еще не дозвонились
      button = (
        <Button
          data-bookid={`bookId${book.id}`}
          className='btn-disabled'
          bsStyle='primary'
          onClick={this.focusOnHelp}>
          Перейти к оплате
          <HelpIcon
            id={`bookId${book.id}`}
            closeButton={true}
            className='help-valign-center help-border-circle help-text-left'
            placement='top'
            helpText={(
              <span>
                Это действие станет доступно после<br/>
                подтверждения бронирования от собственника.<br/>
                Ожидайте изменения статуса
              </span>
            )}/>
        </Button>
      );
      break;
    case 3:
      //Оплачено
      button = (
        <Button
          bsStyle='primary'
          disabled={requestSended}
          href={`#/booking/${book.details.selectedId}`}>
          {requestSended ?
            <i className='fa fa-spin fa-spinner'/> : 'Заселиться'}
        </Button>
      );
      break;
    case 4:
      //Отменено. Отказ собственника
    case 5:
      //Отменено. Квартира уже сдана
    case 6:
      //Вы отказались
    case 10:
      //не заселился
      button = (
        <Button
          target='_blank'
          bsStyle='primary'
          href={this.analogsLink}
        onClick={this.trackLink}>
          Найти похожий вариант
        </Button>
      );
      break;
    case 7:
      //Забронировано
      button = alreadyPayed ? (
        <Button
          data-bookid={`bookId${book.id}`}
          className='btn-disabled'
          bsStyle='primary'
          onClick={this.focusOnHelp}>
          Заселиться
          <HelpIcon
            id={`bookId${book.id}`}
            closeButton={true}
            className='help-valign-center help-border-circle help-text-left'
            placement='top'
            helpText={(
              <span>
                Для заселения можно выбрать только одну<br/>
                квартиру. Для того чтобы заслиться в эту,<br/>
                необходимо отменить предыдущее бронирование.
              </span>
            )}/>
        </Button>
      ) : (notSettled ? (
        <Button
          bsStyle='primary'
          disabled={requestSended}
          onClick={this.selectNewBooking}>
          {requestSended ?
            <i className='fa fa-spin fa-spinner'/> :
            'Выбрать и заселиться'}
        </Button>
      ) :
      (
        <Button
          bsStyle='primary'
          disabled={requestSended}
          href={`#/booking/${book.details.selectedId}`}
        onClick={this.trackPay}>
          {requestSended ?
            <i className='fa fa-spin fa-spinner'/> :
            'Перейти к оплате'}
        </Button>
      ));
      break;
    case 9:
      //успех. заселился
    case 11:
      //не оплатил
    default:
      //do nothing
    }
    return button;
  }

  get actionSecondary() {
    const {book, requestSended} = this.props;
    let button = null;

    switch(book.state) {
    case 1:
      //Ожидайте подтверждения от собственника
    case 2:
      //Ожидайте звонка
    case 7:
      //Забронировано
    case 8:
      //Ожидайте подтверждения от собственника. Все еще не дозвонились
      button = (
        <Button
          bsStyle='link'
          disabled={requestSended}
          onClick={this.cancelBooking}>
          {requestSended ?
            <i className='fa fa-spin fa-spinner'/> :
            'Отменить бронирование'}
        </Button>
      );
      break;
    case 3:
      //Оплачено
      button = (
        <Button
          bsStyle='link'
          disabled={requestSended}
          onClick={this.cancelPayedBooking}>
          {requestSended ?
            <i className='fa fa-spin fa-spinner'/> :
            'Отменить бронирование'}
        </Button>
      );
      break;
    case 4:
      //Отменено. Отказ собственника
    case 5:
      //Отменено. Квартира уже сдана
    case 6:
      //Вы отказались
    case 11:
      //не оплатил
      button = (
        <Button
          bsStyle='link'
          disabled={requestSended}
          onClick={this.deleteBooking}>
          {requestSended ?
            <i className='fa fa-spin fa-spinner'/> :
            'Удалить из списка'}
        </Button>
      );
    case 9:
      //успех. заселился
    case 10:
      //не заселился
    default:
      //do nothing
    }
    return button;
  }

  render() {
    const obj = clone(this.props.obj);
    const {book} = this.props;
    const status = data.options.rentOnline.steps[book.state];

    return (
      <Row className={s.lkBodyBookingListItem}>
        <LKBookingObjInfo obj={obj}/>
        <Col xs={5} className={s.bookingInfo}>
          <h3 className={s.bookingTitle}>
            Номер брони&nbsp;
            <span className={s.bookingTitleId}>{book.details.selectedId}</span>
          </h3>
          <div className={s.bookingStatus}>
            Статус:
            <span className={s.bookingStatusValue}>
              <i className={status.className} />
              {status.title}
            </span>
          </div>
          <div className={s.bookingStatusDescr}>
            {this.descReplacing(status.descr)}
          </div>
        </Col>
        <Col xs={2} className={s.bookingActions}>
          {this.timeLeft}
          {this.actionPrimary}
          {this.actionSecondary}
        </Col>
      </Row>
    );
  }
}

export default withStyles(s)(LKBookingListItem);
