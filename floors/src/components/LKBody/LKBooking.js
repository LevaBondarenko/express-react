/**
 * LK Booking component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, values, forEach, find} from 'lodash';
import moment from 'moment/moment';
import {getFromBack} from '../../utils/requestHelpers';
import emptyFunction from 'fbjs/lib/emptyFunction';
import HelpIcon from '../../shared/HelpIcon';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

import s from './LKBooking/style.scss';
import LKBookingMain from './LKBooking/LKBookingMain';
import LKBookingModal from './LKBooking/LKBookingModal';
import LKBookingHead from './LKBooking/LKBookingHead';
import LKBookingList from './LKBooking/LKBookingList';
import LKBookingDetail from './LKBooking/LKBookingDetail';
import LKBookingHelp from './LKBooking/LKBookingHelp';
import LKBookingFAQ from './LKBooking/LKBookingFAQ';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import wss from '../../stores/WidgetsStateStore';

/*global data*/

class LKBooking extends Component {
  static propTypes = {
    booking: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    user: PropTypes.object,
    bookingId: PropTypes.string,
    paymentsUrl: PropTypes.string,
    paymentsScid: PropTypes.number,
    paymentState: PropTypes.string,
    objects: PropTypes.object,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    })
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);
    this.state = this.bookingRedirects(props, false, true);

  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => (
      this.bookingRedirects(nextProps, this.state.requestSended)
    ));
  }

  bookingRedirects = (props, sended, firstRun = false) => {
    const {bookingId, booking, paymentState} = props;
    const state = {requestSended: false};

    if((firstRun || paymentState === 'paymentOk') && !sended) {
      UserActions.forceRefresh();
      state.requestSended = true;
    }
    if(bookingId) {
      const book = find(booking, item => {
        return item.details.selectedId === parseInt(bookingId);
      });

      if(size(book) === 0) {
        window.location.hash = paymentState ?
          `/booking/${paymentState}` : '/booking/';
      }
    }
    return state;
  }

  componentWillMount() {
    this.removeCss = s._insertCss();
    this.wssChange();

    wss.onChange(this.wssChange);
    getFromBack({
      action: 'modular_search',
      subAction: 'count',
      class: 'rent',
      city_id: data.options.cityId.toString() // eslint-disable-line camelcase
    }, 'get', '/msearcher_ajax.php').then(response => {
      this.setState({
        rentCount: response.count
      });
    });
  }

  componentWillUnmount() {
    this.removeCss();
    wss.offChange(this.wssChange);
  }

  wssChange = () => {
    const {selectedCity, currency} = wss.get();
    const state = {};

    if(selectedCity) {
      const weekend = ['0', '6'].indexOf(moment().format('d')) !== -1;
      const tomorrowWeekend = ['0', '6'].indexOf(
        moment().add(1, 'days').format('d')
      ) !== -1;
      const timeregex = /([\d]{0,1}\d\:\d\d)/g;
      const officeHours = (weekend ?
        selectedCity.office_hours_weekend : selectedCity.office_hours)
        .match(timeregex);
      const tomorrowOfficeHours = (tomorrowWeekend ?
        selectedCity.office_hours_weekend : selectedCity.office_hours)
        .match(timeregex);
      const worktimeStart =
        moment({
          hours: officeHours[0].split(':')[0],
          minute: officeHours[0].split(':')[1]
        }).format('YYYY-MM-DD HH:mm');
      const worktimeStop =
        moment({
          hours: officeHours[1].split(':')[0],
          minute: officeHours[1].split(':')[1]
        }).format('YYYY-MM-DD HH:mm');
      const worktime = moment().isBetween(worktimeStart, worktimeStop);

      state.worktime = worktime;
      state.officeHours = officeHours;
      state.tomorrowOfficeHours = tomorrowOfficeHours;
    }
    if(currency) {
      state.currency = {
        course: currency.nominal / currency.value,
        unit: currency.symbol
      };
    }
    if(size(state)) {
      this.setState(() => (state));
    }
  }

  getBookingCount = props => {
    const {booking, objects} = props;
    let count = 0;

    forEach(booking, item => {
      objects.rent && objects.rent[item.objectId] && (count++);
    });

    return(count);
  }

  onBookingUpdate = (action, oid) => {
    const needConfirm = [
      'cancel',
      'delete',
      'not_settle',
      'select'
    ];
    const needRedirect = [
      'settle'
    ];

    if(needConfirm.indexOf(action) === -1) {
      this.setState(() => ({requestSended: true}));
      UserActions.updateBooking(oid, action);
      if(needRedirect.indexOf(action) !== -1) {
        window.location.hash = '/booking/';
      }
    } else {
      this.setState(() => ({event: {action: action, oid: oid}}));
    }
  }

  confirmedAction = result => {
    const needRedirect = [
      'not_settle'
    ];

    if(result === 'userCancel') {
      this.setState(() => ({event: null}));
    } else {
      const {event} = this.state;

      this.setState(() => ({event: null, requestSended: true}));
      UserActions.updateBooking(event.oid, event.action);
      if(needRedirect.indexOf(event.action) !== -1) {
        window.location.hash = '/booking/';
      }
    }
  }

  paymentClear = () => {
    const reg = /(paymentOk|paymentFail)$/g;

    window.location.hash = window.location.hash.replace(reg, '');
  }

  onNeedRefresh = () => {
    this.setState(() => ({requestSended: true}));
    UserActions.forceRefresh();
  }

  render() {
    const {
      comission, offworkPhone, workPhone, contractLink, timeToPay,
      ownerUnavailableTime
    } = data.options.rentOnline;
    const {
      bookingId, paymentsUrl, paymentsScid, user, paymentState
    } = this.props;
    const {worktime, event} = this.state;
    const phone = worktime ? workPhone : offworkPhone;
    const bookingList = values(this.props.booking);
    let book = null, alreadyPayed = false, notSettled = false;

    forEach(bookingList, item => {
      if(item.details.selectedId === parseInt(bookingId)) {
        book = item;
      }
      if(item.state === 3 && item.paymentId) {
        alreadyPayed = true;
      }
      if(item.state !== 3 && item.paymentId) {
        notSettled = true;
      }
    });

    const step = book && book.state === 3 && book.paymentId ? 3 :
      (book && book.state === 7 ? 2 : 1);
    const bookingCount = this.getBookingCount(this.props);
    const activeBooking = size(bookingList) > 0;
    const head = activeBooking ? (
      <LKBookingHead
        {...this.props}
        step={step}
        comission={comission}

        timeToPay={timeToPay}
        bookingCount={bookingCount}
        bookingList={bookingList} />

    ) : null;
    const body = activeBooking ? (
      parseInt(bookingId) > 0 ? (
        <LKBookingDetail
          {...this.props}
          {...this.state}
          step={step}
          book={book}
          user={user}
          phone={phone}
          comission={comission}
          paymentsUrl={paymentsUrl}
          paymentsScid={paymentsScid}
          contractLink={contractLink}
          alreadyPayed={alreadyPayed}
          timeToPay={timeToPay}
          onBookingUpdate={this.onBookingUpdate}
          onNeedRefresh={this.onNeedRefresh}/>
      ) : (
        <LKBookingList
          {...this.props}
          {...this.state}
          timeToPay={timeToPay}
          ownerUnavailableTime={ownerUnavailableTime}
          bookingList={bookingList}
          comission={comission}
          phone={phone}
          alreadyPayed={alreadyPayed}
          notSettled={notSettled}
          onBookingUpdate={this.onBookingUpdate}
          onNeedRefresh={this.onNeedRefresh}/>
      )
    ) : <LKBookingMain {...this.prop} comission={comission} />;

    return (
      <div className={s.lkBodyBooking}>
        <Row>
          <Col xs={5}>
            <div className='lkbody-pagetitle'>
              Аренда-онлайн
              <HelpIcon
                placement='top'
                className='help-text-left'
                helpText={(
                  <span>
                    Аренда онлайн - это сервис, который поможет вам снять или
                    сдать недвижимость самостоятельно и безопасно. Комиссия
                    снижена!
                  </span>
                )}/>
            </div>
          </Col>
          {bookingId ? (
              <Col xs={7}>
                <div className='lkbody-pagetitle'>
                  <Button
                    bsStyle='link'
                    bsSize='small'
                    href='#/booking/'>
                    <i className='fa fa-angle-left' />
                    <span className={s.lkBodyBookingSpan}
                      onClick={this.trackEvent}>
                       Вернуться к списку бронирований
                    </span>
                  </Button>
                </div>
              </Col>) : null}
        </Row>
        <div className='lkbody-booking-wrapper'>
          {head}
          {body}
        </div>
        <Row>
          <Col xs={12}>
            <LKBookingHelp
              phone={phone}
              ticketId={this.props.bookingId} />
          </Col>
          <Col xs={12}>
            <LKBookingFAQ currentStep={activeBooking ? step : 0} />
          </Col>
        </Row>
        {paymentState ? (

          <LKBookingModal
            event={paymentState}
            onClear={this.paymentClear}
            phone={phone}
            trackPay={this.trackPayOk}/>
        ) : (event ? (
          <LKBookingModal
            event={event.action}
            onClear={this.confirmedAction}/>
        ) : null)}
      </div>
    );
  }
}

export default LKBooking;
