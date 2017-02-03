/**
 * Rent booking container component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import moment from 'moment/moment';
import request from 'superagent';

import {priceFormatter, priceCleanup, declOfNum, testPhone, phoneCleanup}
 from '../../utils/Helpers';
import {getFromBack} from '../../utils/requestHelpers';
import {generateSearchUrl} from 'etagi-helpers';
import {phoneFormatter, testEmail} from '../../utils/Helpers';
import {forEach, map, includes, size} from 'lodash';

import RentBookingForm from '../RentBooking/RentBookingForm';
import RentSwitcherForm from '../RentBooking/RentSwitcherForm';
import Rieltor2 from '../Rieltor2/Rieltor2';
import ga from '../../utils/ga';
import ContextType from '../../utils/contextType';

import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';
import userStore from '../../stores/UserStore';
import UserActions from '../../actions/UserActions';

/* global data */

class RentBooking extends Component {
  static propTypes = {
    agentPhone: PropTypes.string,
    agentPhoto: PropTypes.string,
    btnName: PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    description1: PropTypes.string,
    description2: PropTypes.string,
    description3: PropTypes.string,
    fio: PropTypes.string,
    lkPath: PropTypes.string,
    pluses: PropTypes.string,
    rieltorId: PropTypes.string,
    similarityParams: PropTypes.array,
    googleEvent: PropTypes.string
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.state = {
      activeObjects: 0,
      booking: true,
      bookingNumber: 0,
      bookingStep: 0,
      buttonLoader: false,
      clientEmail: '',
      clientPhone: '',
      clientPhoneTyped: '',
      comissionAmount: '?',
      emailButtonLoader: false,
      emailFormHelp: '',
      emailFormInitial: true,
      emailFormState: 0,
      emailFormStyle: null,
      emailFormTransitionEnd: true,
      modalState: 0,
      objId: 0,
      offerAccepted: true,
      ownerAddress: '',
      ownerName: '',
      ownerPhone: '',
      phoneFormHelp: '',
      phoneFormInitial: true,
      phoneFormStyle: null,
      phoneSubmitted: false,
      priceAsIs: false,
      rentCount: '',
      rentOnlineData: false,
      showModal: false,
      submitLink: '',
      userHasPhone: true,
      statelink: false,
      problem: false
    };
  }

  componentWillMount() {
    const {lkPath, similarityParams} = this.props;
    const contractLink = data.options && data.options.rentOnline &&
     data.options.rentOnline.contractLink ?
      data.options.rentOnline.contractLink : '';
    const offerLink = data.options && data.options.rentOnline &&
     data.options.rentOnline.offerLink ?
      data.options.rentOnline.offerLink : '';
    const comission = data.object && data.object.info ?
     data.object.info.comission : '?';
    const minComissionSumm = data.object && data.object.info ?
      data.object.info.min_comission_summ : '?';
    const price = data.object && data.object.info ?
     data.object.info.price : '?';
    const reducedComission = data.object && data.object.info &&
     data.object.info.contract_type && data.widget &&
      data.widget.FlatInfo_Widget &&
       data.widget.FlatInfo_Widget[0].reducedComission ?
        data.widget.FlatInfo_Widget[0].reducedComission : false;
    const rentOnlineData = data.options && data.options.rentOnline ?
     data.options.rentOnline : false;
    const timeToCallLater = data.options && data.options.rentOnline &&
     data.options.rentOnline.timeToCallLater ?
      data.options.rentOnline.timeToCallLater : '';
    const actualComission = reducedComission ? reducedComission : comission;
    const objId = data.object && data.object.info ?
     parseInt(data.object.info.object_id) : 0;
    const cityId = data.options ? data.options.cityId.toString() : '23';
    const object = data.object && data.object.info ?
     data.object.info : undefined;
    let comissionAmount = false;
    let priceAsIs = false;

    UserActions.forceRefresh();

    if (actualComission.match(/^(\d+)%/)) {
      const parsed = actualComission.match(/^(\d+)%/);

      comissionAmount = parseInt(parsed[1]) / 100 * price;
    } else if (!isNaN(actualComission.replace(/ /g, ''))) {
      comissionAmount = actualComission.replace(/ /g, '');
    } else {
      comissionAmount = actualComission;
      priceAsIs = true;
    }

    if (minComissionSumm && comissionAmount < minComissionSumm) {
      comissionAmount = minComissionSumm;
    }

    getFromBack({
      action: 'modular_search',
      subAction: 'count',
      class: 'rent',
      city_id: cityId // eslint-disable-line camelcase
    }, 'get', '/msearcher_ajax.php').then(response => {
      this.setState({
        rentCount: response.count
      });
    }, error => {
      error;
    });

    this.setState({
      comissionAmount: comissionAmount,
      contractLink: contractLink,
      lkPath: lkPath ? lkPath : '/my/',
      object: object,
      objId: objId,
      offerLink: offerLink,
      priceAsIs: priceAsIs,
      rentOnlineData: rentOnlineData,
      similarityParams: similarityParams,
      timeToCallLater: timeToCallLater
    });
  }

  componentDidMount() {
    wss.onChange(this.onChange);
    userStore.onChange(this.onChange);
  }

  componentWillUnmount() {
    wss.offChange(this.onChange);
    userStore.offChange(this.onChange);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.bookingStep !== prevState.bookingStep) {
      this.setState({
        buttonLoader: false
      });
    }
  }

  onChange = () => {
    const {selectedCity, currency} = wss.get();
    const {booking, isAuthorized, userInfo} = userStore.get();
    const {objId, lkPath, phoneSubmitted} = this.state;
    const state = {};
    const statusCheckLink = `${lkPath}#/booking/`;
    const userHasPhone = userInfo.phone ? true : false;
    let activeObjects = 0;
    let bookingStep, bookingNumber, objectStatusCheckLink;
    let ownerName, ownerAddress, ownerPhone;

    forEach(booking, (val) => {
      if (objId === val.objectId) {
        bookingStep = val.state;
        bookingNumber = val.details.selectedId;
        objectStatusCheckLink = `${lkPath}#/booking/${val.details.selectedId}`;
        ownerName = val.details.owner ? val.details.owner.name : '';
        ownerAddress = val.details.owner ? val.details.owner.address : '';
        ownerPhone = val.details.owner ? val.details.owner.phone : '';
      }

      activeObjects = [4,5,6,10,11].indexOf(val.state) === -1 ?
       activeObjects + 1 : activeObjects;
    });

    if(selectedCity) {
      const weekend = ['0', '6'].indexOf(moment().format('d')) !== -1;
      const timeregex = /([\d]{0,1}\d\:\d\d)/g;
      const officeHours = (weekend ?
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
      state.endWorkDay = officeHours[1];
    }

    this.setState({
      activeObjects: activeObjects,
      bookingNumber: bookingNumber ? bookingNumber : 0,
      bookingStep: bookingStep ? bookingStep : 0,
      currency: currency,
      isAuthorized: isAuthorized,
      objectStatusCheckLink: objectStatusCheckLink,
      ownerAddress: ownerAddress,
      ownerName: ownerName,
      ownerPhone: ownerPhone,
      statusCheckLink: statusCheckLink,
      userHasPhone: userHasPhone,
      workTime: size(state) ? state : false
    });

    if (phoneSubmitted && phoneSubmitted === phoneFormatter(
      userInfo.phone,
      data.options.countryCode.current,
      data.options.countryCode.avail
    )) {
      this.handleSubmit();
    }
  }

  rentSwitched = () => {
    this.setState({
      booking: !this.state.booking
    });
    this.state.booking ?
    ga('tabs', 'rent_online_object_s_rijeltorom') :
    ga('tabs', 'rent_online_object_bez_rijeltora');
  }


  analogsLink = () => {
    const obj = this.state.object;
    const like = this.state.similarityParams;
    const filter = {
      class: 'rent'
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
      '/realty_rent/search/?',
      true
    );
  }

  phoneValidation = (clientPhone) => {
    const results = {
      success: ['success', ''],
      warning: ['warning', 'Номер телефона введен некорректно'],
      error: ['error', 'Это поле обязательно к заполнению']
    };
    const phoneStyle = !size(clientPhone) ?
      results.error[0] :
      (!testPhone(
        phoneCleanup(clientPhone),
        true,
        data.options.countryCode.avail
      ) ?
        results.warning[0] :
        results.success[0]);
    const phoneHelp = !size(clientPhone) ?
      results.error[1] :
      (!testPhone(clientPhone) ?
        results.warning[1] :
        results.success[1]);

    this.setState({
      phoneFormHelp: phoneHelp,
      phoneFormStyle: phoneStyle
    });
  }

  handleOfferState = () => {
    this.setState({
      offerAccepted: !this.state.offerAccepted
    });
  }

  handleSubmit = () => {
    const {
      activeObjects,
      bookingNumber,
      bookingStep,
      clientPhone,
      isAuthorized,
      objId,
      userHasPhone
    } = this.state;

    if (!isAuthorized) {
      UserActions.showLogin();
      WidgetsActions.set('notify',[{
        msg: 'Для того чтобы воспользоваться услугой "Аренда-онлайн", вы должны быть авторизованы в личном кабинете', // eslint-disable-line max-len
        type: 'info'
      }]);
      ga('button', 'rent_online_object_zabronirovat_sejchas');
    } else {
      if (!userHasPhone && !testPhone(clientPhone)) {
        ga('button', 'rent_online_object_zabronirovat_sejchas');
        WidgetsActions.set('notify',[{
          msg: 'Для того чтобы воспользоваться услугой "Аренда-онлайн", вам необходимо указать свой телефон в формате', // eslint-disable-line max-len
          type: 'info'
        }]);
        this.phoneValidation(clientPhone);
      } else if (!bookingStep) {
        if (!userHasPhone) {
          ga('button', 'rent_online_object_zabronirovat_sejchas');
          UserActions.updateUser({phone: clientPhone});
          this.setState({
            phoneSubmitted: clientPhone
          });

        } else if (activeObjects < 3) {
          ga('button', 'rent_online_object_zabronirovat_sejchas_success');
          this.setState({
            buttonLoader: true,
            phoneSubmitted: false
          });
          UserActions.updateBooking(objId, 'set');
        } else {
          ga('button', 'rent_online_object_zabronirovat_sejchas');
          this.setState({
            modalState: 0,
            phoneSubmitted: false,
            showModal: true
          });
        }
      } else {
        this.setState({
          buttonLoader: true
        });
        ga('button', 'rent_online_Podtverdite_zaselenie');
        UserActions.updateBooking(objId, 'settle');
      }
    }

    this.setState({
      bookingNumber: bookingNumber,
      phoneFormInitial: false
    });
  }

  openModal = () => {
    const {bookingStep} = this.state;
    const modalState = bookingStep === 3 ? 3 : 1;

    this.setState({
      modalState: modalState,
      showModal: true,
    });

    if (bookingStep === 1 || bookingStep === 2 || bookingStep === 8) {
      ga('button', 'rent_online_object_otmenit_bronirovanie');
    } else {
      ga('button', 'rent_online_object_udalit_bronirovanie');
    }
  };

  openModalProblem = () => {
    const {bookingStep} = this.state;
    const modalState = bookingStep === 3 ? 3 : 1;

    ga('button', 'rent_online_problemy_s_zaseleniem');

    this.setState({
      modalState: modalState,
      showModal: true
    });
  }

  closeModal = () => {
    const {bookingStep} = this.state;

    if (bookingStep === 1 || bookingStep === 2 || bookingStep === 8) {
      ga('button', 'rent_online_popup_net_otmenit');
    }
    if (bookingStep === 6) {
      ga('button', 'rent_online_poput_net_udalit');
    }

    this.setState({
      buttonLoader: false,
      showModal: false
    });
  }

  closePopover = () => {
    document.body.click();
  }

  cancelBooking = () => {
    const {objId, bookingStep} = this.state;
    let bookingCancelled = true;

    if (bookingStep === 1 || bookingStep === 2 || bookingStep === 8) {
      UserActions.updateBooking(objId, 'cancel');
      ga('button', 'rent_online_popup_da_otmenit');
    } else if (bookingStep === 3) {
      UserActions.updateBooking(objId, 'not_settle');
      ga('button', 'rent_online_popup_net_udlit');
    } else {
      bookingCancelled = false;
      UserActions.updateBooking(objId, 'delete');
      ga('button', 'rent_online_popup_da_udlit');
    }

    this.setState({
      bookingCancelled: bookingCancelled,
      modalState: 2
    });
  }

  handlePrint = () => {
    const body = document.getElementsByTagName('BODY')[0];
    const className = body.className;

    body.className = `print-selected ${className}`;
    window.print();
    setTimeout(() => {
      body.className = className;
    }, 100);
  }

  handleEmail = () => {
    const {
      clientEmail,
      emailButtonLoader,
      emailFormHelp,
      emailFormState,
      emailFormStyle
    } = this.state;
    const {userInfo} = userStore.get();
    const userHasEmail = userInfo && userInfo.email ?
      userInfo.email :
      false;
    const emailFormNewState = !emailFormState ?
      1 :
      (emailButtonLoader ?
        emailFormState :
        0);

    this.setState({
      clientEmail: userHasEmail && !clientEmail ? userHasEmail : clientEmail,
      emailFormHelp: userHasEmail && !clientEmail ? '' : emailFormHelp,
      emailFormState: emailFormNewState,
      emailFormStyle: userHasEmail && !clientEmail ? null : emailFormStyle,
      userHasEmail: userHasEmail ? true : false
    });

    ga('button', 'rent_online_object_otpravit_na_pochtu');
  }

  handleEmailBlur = (event) => {
    const {emailFormInitial} = this.state;
    const clientEmail = event.target.value;
    const emailValid = testEmail(clientEmail);

    if (emailFormInitial) {
      this.setState({
        emailFormHelp: emailValid ? '' : 'Некорректный адрес электронной почты',
        emailFormInitial: false,
        emailFormStyle: emailValid ? 'success' : 'error'
      });
    }
  }

  handleEmailChange = (event) => {
    const {emailFormInitial} = this.state;
    const clientEmail = event.target.value;
    const emailValid = testEmail(clientEmail);

    if (emailFormInitial && emailValid) {
      this.setState({
        clientEmail: clientEmail,
        emailFormHelp: '',
        emailFormInitial: false,
        emailFormStyle: 'success'
      });
    } else {
      this.setState({
        clientEmail: clientEmail,
        emailFormHelp: !emailFormInitial && !emailValid ?
          'Некорректный адрес электронной почты' :
          '',
        emailFormStyle: !emailFormInitial && !emailValid ?
          'error' :
          (!emailFormInitial && emailValid ?
            'success' :
            null)
      });
    }
  }

  handleEmailFocus = (event) => {
    const {emailFormInitial} = this.state;
    const clientEmail = event.target.value;
    const emailValid = testEmail(clientEmail);

    if (!(emailFormInitial && clientEmail === '')) {
      this.setState({
        emailFormHelp: emailValid ? '' : 'Некорректный адрес электронной почты',
        emailFormInitial: false,
        emailFormStyle: emailValid ? 'success' : 'error'
      });
    }
  }

  handleEmailKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.handleEmailSend(event);
    }

    event.stopPropagation();
  }

  handleEmailSend = (event) => {
    const {clientEmail, userHasEmail} = this.state;
    const {owneraddress, ownername, ownerphone} = event.target.dataset;

    this.setState({
      emailButtonLoader: true
    });

    if(testEmail(clientEmail)) {
      request
      .post('/backend/')
      .send({
        action: 'send_ro_receipt',
        address: owneraddress,
        clEmail: clientEmail,
        name: ownername,
        phones: ownerphone
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки данных. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else {
          if (!userHasEmail) {
            UserActions.updateUser({email: clientEmail});
          }

          this.setState({
            emailButtonLoader: false,
            emailFormState: 2,
            emailFormTransitionEnd: false,
            userHasEmail: true
          });
        }
      });
    } else {
      this.setState(() => ({
        emailButtonLoader: false,
        emailFormHelp: 'Некорректный адрес электронной почты',
        emailFormInitial: false,
        emailFormStyle: 'error'
      }));
    }
  }

  handleEmailFormTransitionEnd = () => {
    this.setState({
      emailFormTransitionEnd: true
    });
  }

  trackPay = () =>{
    ga('button', 'rent_online_object_oplatit');
  }

  trackLink = () =>{
    ga('button', 'rent_online_object_skachat_dogovor');
  }

  trackLike = () =>{
    ga('button', 'rent_online_object_najti_pohozhie_varianty');
  }

  trackShow = () =>{
    ga('button', 'rent_online_object_posmotret_bronirovanie');
  }

  trackCont = () =>{
    ga('button',
      'rent_online_LK_step3_problemy_s_zaseleniem_popup_da_ya_uveren');
  }

  handlePhoneChange = (event) => {
    const {phoneFormInitial} = this.state;
    const value = phoneFormatter(
      event.target.value,
      data.options.countryCode.current,
      data.options.countryCode.avail
    );

    this.setState({
      clientPhone: value,
      clientPhoneTyped: value
    });

    if (size(value) > 16 && phoneFormInitial) {
      this.setState({
        phoneFormInitial: false
      });
    }

    if (!phoneFormInitial || size(value) > 16) {
      this.phoneValidation(value);
    }
  }

  handlePhoneFocus = () => {
    const {clientPhone, clientPhoneTyped, phoneFormInitial} = this.state;
    const actualClientPhone = clientPhoneTyped === '' ?
     clientPhoneTyped : clientPhone;

    if (clientPhoneTyped === '') {
      this.setState({
        clientPhone: clientPhoneTyped
      });
    }
    if (!phoneFormInitial) {
      this.phoneValidation(actualClientPhone);
    }
  }

  handlePhoneBlur = () => {
    const {clientPhone, clientPhoneTyped} = this.state;
    const actualClientPhone = clientPhoneTyped === '' ?
      clientPhoneTyped : clientPhone;

    this.setState({
      phoneFormInitial: false
    });

    if (clientPhoneTyped === '') {
      this.setState({
        clientPhone: ''
      });
    }
    this.phoneValidation(actualClientPhone);
  }

  handlePhoneKeyDown = (event) => {
    if (event.keyCode === 13) {
      this.handleSubmit();
    }

    event.stopPropagation();
  }

  render() {
    const {
      booking,
      bookingCancelled,
      bookingNumber,
      bookingStep,
      buttonLoader,
      clientEmail,
      clientPhone,
      comissionAmount,
      contractLink,
      currency,
      emailButtonLoader,
      emailFormHelp,
      emailFormStyle,
      emailFormState,
      emailFormTransitionEnd,
      isAuthorized,
      modalState,
      objectStatusCheckLink,
      offerAccepted,
      offerLink,
      ownerAddress,
      ownerName,
      ownerPhone,
      phoneFormHelp,
      phoneFormStyle,
      priceAsIs,
      rentCount,
      showModal,
      statusCheckLink,
      timeToCallLater,
      userHasPhone,
      workTime,
      googleEvent
    } = this.state;
    const {
      comission,
      detailsLink,
      ownerUnavailableTime,
      workPhone,
      offworkPhone,
      steps,
      timeToPay
    } = this.state.rentOnlineData;
    const priceWO = comission ? priceFormatter(comission) : '?';
    const course = currency ? currency.nominal / currency.value : 1;
    const unit = currency ? currency['symbol'] : 'руб.';
    const price =
     `${priceFormatter(Math.round(parseInt(priceCleanup(priceWO)) *
      course))} ${unit}`;
    const comReg = unit === 'руб.' ?
      /\${COMISSION}\.?/g : /\${COMISSION}/g;
    const phone = workTime ? workPhone : offworkPhone;
    const callLaterTime = workTime ?
     `В течение ${timeToCallLater}${declOfNum(parseInt(timeToCallLater),
      ['-ой минуты', '-х минут', '-ти минут'])}` : 'Завтра';
    const modStepsData = steps ?
      map(steps, (value) => {
        const resVal = {};

        forEach(value, (val, index) => {
          resVal[index] = val.replace(comReg, price)
            .replace(/\${UTIME}/g, `${ownerUnavailableTime}${declOfNum(
              parseInt(ownerUnavailableTime),
               ['-го часа', '-х часов', '-ти часов'])}`)
            .replace(/\${PTIME}/g, `${timeToPay}${declOfNum(
              parseInt(timeToPay), ['-го часа', '-х часов', '-ти часов'])}`)
            .replace(/\. \${CTIME}/g, callLaterTime)
            .replace(/ \${CTIME}/g,
             ` ${callLaterTime[0].toLowerCase() + callLaterTime.slice(1)}`)
            .replace(/\${CTIME}/g, callLaterTime)
            .replace(/\${COUNT}/g, `${rentCount} ${declOfNum(
              parseInt(rentCount), ['предложения', 'предложений',
                'предложений'])}`)
            .replace(/\${PHONE}/g, phone)
            .replace(/\${BOOKINGID}/g, bookingNumber);
        });

        return resVal;
      }) :
      false;
    const computedPrice = comissionAmount.toString();
    const priceW = priceAsIs ? computedPrice : priceFormatter(computedPrice);
    const buttonText = !bookingStep ? 'Забронировать сейчас' :
     (bookingStep === 3 ? 'Подтвердить заселение' :
      (bookingStep === 7 ? `Оплатить ${price}` :
        (bookingStep === 1 || bookingStep === 2 || bookingStep === 8 ?
        'Посмотреть бронирование' : 'Найти похожие варианты')));
    const submitLink = (bookingStep > 3 && bookingStep < 7) ||
     (bookingStep > 9 && bookingStep < 12) ? this.analogsLink() :
      (!bookingStep || bookingStep === 2 || bookingStep === 8 ?
       statusCheckLink : objectStatusCheckLink);
    const phones = ownerPhone ? ownerPhone.split(',') : '';
    const existPhone = size(phones) > 0 && size(phones[0]) > 0;
    const modPhones = existPhone ?
      map(phones, item => {
        return phoneFormatter(
          item,
          data.options.countryCode.current,
          data.options.countryCode.avail
        );
      }).join(', ') : `Н/Д. Обратитесь в ТП: ${phone}`;
    const modName = ownerName && size(ownerName.replace(/\s/g, '')) ?
     ownerName : 'Н/Д';
    const modAddress = size(ownerAddress) ? ownerAddress : 'Н/Д';

    const GaEvent = bookingStep === 7 ? this.trackPay :
      (bookingStep === 1 || bookingStep === 2 || bookingStep === 8 ?
      this.trackShow : this.trackLike);

    return (
      <div>
        <RentSwitcherForm
          toggleButton={this.rentSwitched}
          toggled={booking}
          priceAsIs={priceAsIs}
          priceW={priceW}
          priceWO={priceWO}
          {...this.props}/>
        {booking ?
          (<RentBookingForm
            bookingCancelled={bookingCancelled}
            bookingNumber={bookingNumber}
            bookingStep={bookingStep}
            buttonLoader={buttonLoader}
            buttonText={buttonText}
            cancelBooking={this.cancelBooking}
            closeModal={this.closeModal}
            closePopover={this.closePopover}
            contractLink={contractLink}
            emailButtonLoader={emailButtonLoader}
            emailFormHelp={emailFormHelp}
            emailFormState={emailFormState}
            emailFormStyle={emailFormStyle}
            emailFormTransitionEnd={emailFormTransitionEnd}
            emailValue={clientEmail}
            handleEmail={this.handleEmail}
            handleEmailBlur={this.handleEmailBlur}
            handleEmailChange={this.handleEmailChange}
            handleEmailFocus={this.handleEmailFocus}
            handleEmailFormTransitionEnd={this.handleEmailFormTransitionEnd}
            handleEmailKeyDown={this.handleEmailKeyDown}
            handleEmailSend={this.handleEmailSend}
            handleOfferState={this.handleOfferState}
            handlePhoneBlur={this.handlePhoneBlur}
            handlePhoneChange={this.handlePhoneChange}
            handlePhoneFocus={this.handlePhoneFocus}
            handlePhoneKeyDown={this.handlePhoneKeyDown}
            handlePrint={this.handlePrint}
            handleSubmit={this.handleSubmit}
            isAuthorized={isAuthorized}
            modalState={modalState}
            offerAccepted={offerAccepted}
            offerLink={offerLink}
            officePhone={phone}
            openModal={this.openModal}
            openModalProblem={this.openModalProblem}
            ownerAddress={modAddress}
            ownerName={modName}
            ownerPhone={modPhones}
            phoneFormHelp={phoneFormHelp}
            phoneFormStyle={phoneFormStyle}
            phoneValue={clientPhone}
            rentLink={detailsLink}
            showModal={showModal}
            stepsData={modStepsData}
            submitLink={submitLink}
            GaEvent={GaEvent}
            trackPay={this.trackPay}
            trackLink={this.trackLink}
            userHasPhone={userHasPhone}
            trackCont={this.trackCont}
            {...this.props} />) :
          (<div className='rieltor2-block'>
            <Rieltor2
              position='realty'
              orderType='auto'
              googleEvent={googleEvent}
              {...this.props} />
          </div>)
        }
      </div>
    );
  }
}

export default RentBooking;
