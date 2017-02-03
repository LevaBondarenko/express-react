/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; //eslint-disable-line no-unused-vars
import NewhousesModalControl from './NewhousesModalControl';
import NewhousesModalWindow from './NewhousesModalWindow';
import emptyFunction from 'fbjs/lib/emptyFunction';
import {testPhone} from 'etagi-helpers';
import {isEmpty} from 'lodash';
import userStore from '../../stores/UserStore';
import WidgetsActions from '../../actions/WidgetsActions';
import UserActions from '../../actions/UserActions';
import {postOrder, getFromBack} from '../../utils/requestHelpers';
import moment from 'moment/moment';
import extend from 'extend';
import ga from '../../utils/ga';
import yaCounter from '../../utils/yaCounter';

/* global data */

class NewhousesModal extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    flat: PropTypes.object,
    text: PropTypes.string,
    linkClassName: PropTypes.string,
    rieltorId: PropTypes.string,
    fio: PropTypes.string,
    agentPhoto: PropTypes.string,
    agentPhone: PropTypes.string,
    orderType: PropTypes.string,
    description1: PropTypes.string,
    description2: PropTypes.string,
    description3: PropTypes.string,
    btnName: PropTypes.string,
    placeholder: PropTypes.string,
    favBtn: PropTypes.func,
    compareBtn: PropTypes.func,
    toggleModal: PropTypes.func,
    showModal: PropTypes.bool,
    activeKey: PropTypes.string,
    spriteStyles: PropTypes.object,
    typeLayout: PropTypes.string,
    layout3d: PropTypes.string,
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
    this.state = {
      layout: props.typeLayout === '2' ? 'layout3d' : 'layout2d',
      avaliableDays: [],
      name: '',
      phone: '',
      min: '',
      hour: '',
      favorites: [],
      isAuthorized: false,
      date: {},
      rieltorId: props.rieltorId || '',
      fio: props.fio  || '',
      agentPhoto: props.agentPhoto  || '',
      agentPhone: props.agentPhone  || '',
      description1: props.description1  || '',
      description2: props.description2  || '',
      description3: props.description3  || '',
      btnName: props.btnName,
      placeholder: props.placeholder,
      spriteStyles: props.spriteStyles,
      avaliable3d: props.layout3d
    };
  }

  componentWillMount() {
    const avaliableDays = [];

    for (let i = 4; i < 16; i++) {
      avaliableDays.push(moment().locale('ru').day(i).format('MMMM, D, dd'));
    }

    this.setState({
      avaliableDays: avaliableDays
    });
    userStore.onChange(this.onChange);
  }

  componentDidMount() {
    this.onChange();
  }

  componentWillReceiveProps(nextProps) {
    const layouts = {
      0: 'layout2d',
      1: 'layout2d',
      2: 'layout3d'
    };

    this.setState({
      layout: layouts[parseInt(nextProps.typeLayout)]
    });
  }

  onChange = () => {
    if(userStore.get('isAuthorized')) {
      this.setState({
        isAuthorized: userStore.get('isAuthorized'),
        favorites: userStore.get('favorites'),
        name: userStore.get('userInfo').i,
        hash: userStore.get('userInfo').authHash,
        phone: ` +${userStore.get('userInfo').phone}`
      });
    } else {
      this.setState({
        hash: ''
      });
    }
  };

  toggleLayout = (event) => {
    if(event.target.dataset.target === 'layout2d') {
      ga('button', 'zastr_popup_podrobnee_o_kvartire_Planirovka_kvartiry');
    }
    if(event.target.dataset.target === 'layoutFloor') {
      ga('button', 'zastr_popup_podrobnee_o_kvartire_Plan_jetazha');
    }

    this.setState({
      layout: event.target.dataset.target
    });
  };

  toggleLayoutSprite = (layout) => {
    this.setState({
      layout: layout
    });
  };

  getDatetime = () => {
    const {date, hour, min} = this.state;
    const year = moment().year();
    const month = moment().month(date.month).format('M');

    return moment([year, month, parseInt(date.day), `${hour}:${min}`]).format();
  };

  orderData = (phone, typeId) => {
    const {flat} = this.props;
    const {isAuthorized, name} = this.state;

    const orderData = {
      action: 'create_ticket',
      phone: phone,
      message: this.getMessageText(phone, typeId),
      source: 'Web',
      advanced_source: typeId === 7 ? 'Zastr Object Booking Request' : 'Zastr Object Review Request', //eslint-disable-line
      type_id: typeId,  //eslint-disable-line camelcase
      city_id: data.options.cityId,  //eslint-disable-line camelcase
      objectId: data.object.info.id,
    };

    if(!isAuthorized && typeId === 7) {
      orderData.name = name;
    }

    return typeId === 7 ? orderData : extend(true, {}, orderData, {
      extra: JSON.stringify({
        datetime: this.getDatetime(),
        objs: {['nh_flats']: [flat.id]}
      }, (key, value) => {
        if(typeof value === 'number') {
          return value.toString();
        }
        if(value) {
          return value;
        }
      })
    });
  };

  getMessageText = (phone, typeId) => {
    const {date, hour, min} = this.state;
    const {flat} = this.props;
    const dateFormatted = `${date.month},${date.day}`;
    const timeFormatted = `${hour}:${min === '' ? '00' : min}`;
    const review = `Запись на просмотр объекта от пользователя сайта,
      телефон: ${phone}, дата:${dateFormatted},
      время: ${timeFormatted},
      выбранный объект: ${flat.gp}(${data.object.info.id}),
      квартира №${flat.id},
      подъезд: ${flat.section},
      этаж: ${flat.floor},
      на этаже: ${flat.on_floor}`;
    const booking = `Запрос на бронирование объекта от пользователя сайта,
      имя: ${this.state.name},
      телефон: ${phone},
      выбранный объект: ${flat.gp}(${data.object.info.id}),
      квартира №${flat.id},
      подъезд: ${flat.section},
      этаж: ${flat.floor},
      на этаже: ${flat.on_floor}`;

    return typeId === 7 ? booking : review;
  };

  handleReviewSubmit = (event) => {
    const {phone, date, hour, min, isAuthorized} = this.state;
    const {flat} = this.props;
    let cleanedPhone = phone.replace(/[^0-9+]*/g, '')
      .replace('+8', '8')
      .replace('+7', '8');

    cleanedPhone = cleanedPhone.length >= 12 ?
      cleanedPhone.substring(0, 11) : cleanedPhone;


    if((!phone || !phone.length) || !testPhone(cleanedPhone, true)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо указать номер Вашего телефона.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else if(isEmpty(date)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо выбрать дату для просмотра.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else if(isEmpty(hour)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо выбрать время для просмотра.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      const dateFormatted = `${date.month},${date.day}`;
      const timeFormatted = `${hour}:${min === '' ? '00' : min}`;
      const dataSend = this.orderData(cleanedPhone, 132);

      let favData;

      if(this.state.isAuthorized) {
        const {favorites} = this.state;

        favData = find(favorites, favItem => {
          return favItem.id === parseInt(flat.id) ?
            favItem : false;
        });

        if(!favData) {
          favData = {
            id: flat.id,
            class: 'nh_flats'
          };

          UserActions.updateFavorites(
            'add',
            flat.id,
            'nh_flats'
          );
          WidgetsActions.set('notify',[{
            msg: `Объект ${flat.id} добавлен в избранное`,
            type: 'info'
          }]);
        }

        favData.forreview = this.getDatetime().replace('T', ' ');
        favData.forreview = this.getDatetime().replace('+0500', '');
      }

      postOrder(dataSend).then(response => {
        if (response.ok) {
          ga('pageview', '/virtual/thank-you/?from=zastr_popup_podrobnee_' +
              'o_kvartire_zapisatsya_na_prosmotr');
          WidgetsActions.set('notify',[{
            msg: this.getNotifyReview(
              response.ticket_id, flat.gp, dateFormatted, timeFormatted
            ),
            type: 'custom',
            time: 30
          }]);
          if(isAuthorized) {
            UserActions.updateFavorites(
              'add',
              favData.id,
              favData.class,
              favData
            );
            getFromBack({
              action: 'user_get_all'
            }).then(response => {
              if(response.ok) {
                UserActions.fill(response.data);
              } else {
                WidgetsActions.set('notify',[{
                  msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
                  type: 'warn'
                }]);
              }
            });
          }
        } else {
          this.errorNotify();
        }
      }).catch(() => {
        this.errorNotify();
      });
    }

    event.preventDefault();
  };

  handleBookingSubmit = (event) => {
    const {phone} = this.state;
    let cleanedPhone = phone.replace(/[^0-9+]*/g, '')
      .replace('+8', '8')
      .replace('+7', '8');

    cleanedPhone = cleanedPhone.length >= 12 ?
      cleanedPhone.substring(0, 11) : cleanedPhone;

    if((!phone || !phone.length) || !testPhone(cleanedPhone, true)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо указать номер Вашего телефона.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      const dataSend = this.orderData(cleanedPhone, 7);

      postOrder(dataSend).then(response => {
        if (response.ok) {

          WidgetsActions.set('notify',[{
            msg: this.getNotifyBook(response.ticket_id),
            type: 'custom',
            time: 30
          }]);
          ga('pageview', '/virtual/thank-you/?from=zastr_popup_' +
              'podrobnee_o_kvartire_zabronirovat');
          yaCounter('zastr_bron');
        } else {
          this.errorNotify();
        }
      }).catch(() => {
        this.errorNotify();
      });
    }

    event.preventDefault();
  };

  errorNotify = () => {
    WidgetsActions.set('notify',[{
      msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
      type: 'dang'
    }]);
  };

  getNotifyBook = (ticketId) => {
    return (
      <div>
        <div className='notify-header'>Спасибо!</div>
        <div className='notify-body'>
          <span>Ваша заявка на бронирование принята, </span>
          <span>мы обязательно свяжемся с Вами</span><br/>
          <span>для уточнения условий покупки</span><br/>
          <span>и подтверждения брони</span><br/>
          <span>
            Номер созданной заявки <b>{ticketId}</b>
          </span>
        </div>
      </div>
    );
  };

  getNotifyReview = (ticketId, gp, date, time) => {
    return (
      <div>
        <div className='notify-header'>Запись на просмотр</div>
        <div className='notify-body'>
          <span>Заявка отправлена, объект </span>
          <span><b>{gp}</b></span><br/>
          <span>Дата и время просмотра:</span><br/>
          <span><b>{date}, {time}</b></span><br/>
          <span>
            Номер созданной заявки <b>{ticketId}</b>
          </span>
        </div>
      </div>
    );
  };

  handleChange = (event) => {
    const {name} = event.target.dataset;

    this.setState({
      [name]: event.target.value
    });
    event.preventDefault();
  };

  setDate = (event) => {
    this.setState({
      date: JSON.parse(event.currentTarget.dataset.date)
    });
    event.preventDefault();
  };

  trackInfo = () => {
    ga('click', 'zastr_popup_podrobnee_o_kvartire_Informacija_o_kvartire');
  }

  trackZapis = () => {
    ga('click',
      'zastr_popup_podrobnee_o_kvartire_Zapisatsja_na_prosmotr_kvartiry');
  }

  trackKv = () => {
    ga('click', 'zastr_popup_podrobnee_o_kvartire_Zabronirovat_kvartiru');
  }

  render() {

    return (
      <div ref='component'>
        <NewhousesModalControl
          text={this.props.text}
          linkClassName={this.props.linkClassName}
          toggleModal={this.props.toggleModal}
          flat={this.props.flat} />
        <NewhousesModalWindow
          toggleModal={this.props.toggleModal}
          flat={this.props.flat}
          toggleLayout={this.toggleLayout}
          trackInfo={this.trackInfo}
          trackKv={this.trackKv}
          trackZapis={this.trackZapis}
          trackRieltor={this.trackRieltor}
          orderType={this.props.orderType}
          toggleLayoutSprite={this.toggleLayoutSprite}
          handleBookingSubmit={this.handleBookingSubmit}
          handleReviewSubmit={this.handleReviewSubmit}
          handleChange={this.handleChange}
          setDate={this.setDate}
          favBtn={this.props.favBtn}
          compareBtn={this.props.compareBtn}
          showModal={this.props.showModal}
          activeKey={this.props.activeKey}
          placeholder={this.props.placeholder}
          {...this.state} />
      </div>
    );
  }
}

export default NewhousesModal;
