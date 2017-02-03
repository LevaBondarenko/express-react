import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import DateTimePicker from '../../shared/DateTimePicker';
import {phoneFormatter, testPhone, phoneCleanup, rusTypes}
  from '../../utils/Helpers';
import withStyles from '../../decorators/withStyles';
import {postOrder, getFromBack} from '../../utils/requestHelpers';
import {find} from 'lodash';
import moment from 'moment/moment';
/**
 * Bootstrap 3 elements
 */
import {FormControl} from 'react-bootstrap/lib/';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import styles from './FlatInfoSignForReview.css';
import ga from '../../utils/ga';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import userStore from '../../stores/UserStore';
import WidgetsActions from '../../actions/WidgetsActions';

const ModalBody = Modal.Body;
const ModalHeader = Modal.Header;
/*global data*/

@withStyles(styles)
class FlatInfoSignForReview extends Component {

  static propTypes = {
    oid: PropTypes.number,
    oclass: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      collapsible: false,
      datetime: null,
      phone: '',
      showModal: false,
      isAuthorized: false,
      requestOpen: false,
      favorites: []
    };
  }

  componentWillMount() {
    userStore.onChange(this.onChange);
  }

  componentDidMount() {
    this.onChange();
  }

  onChange = () => {
    const {isAuthorized, requestOpen} = this.state;

    if(isAuthorized && requestOpen) {
      this.setState(() => ({
        showModal: true,
        requestOpen: false
      }));
    } else {
      this.setState(() => ({
        isAuthorized: userStore.get('isAuthorized'),
        favorites: userStore.get('favorites'),
        phone: userStore.get('userInfo').phone
      }));
    }

  };

  dateTimeChange = (event) => {
    if(event !== false) {
      this.setState(() => ({datetime: `${event}+0500`}));
    }
  };

  handlePhoneChange = (event) => {
    const {value} = event.target;
    const cleanedPhone = phoneCleanup(phoneFormatter(
      value,
      data.options.countryCode.current,
      data.options.countryCode.avail
    ));

    this.setState(() => ({
      phone: cleanedPhone
    }));
  };

  open = () => {
    const {isAuthorized} = this.state;

    if(isAuthorized) {
      this.setState(() => ({
        showModal: true
      }));
    } else {
      UserActions.showLogin();
      this.setState(() => ({
        requestOpen: true
      }));
    }
  }

  close = () => {
    this.setState(() => ({
      showModal: false
    }));
  }

  get track() {
    if(data.object.info.table === 'offices') {
      return ga('pageview', '/virtual/thank-you/?from=' +
            'lk_commerce_zapisatsya_na_prosmotr');
    }else if(data.object.info.table === 'rent') {
      return ga('pageview', '/virtual/thank-you/?from=' +
            'lk_realty_rent_zapisatsya_na_prosmotr');
    }else if(data.object.info.table === 'cottages') {
      return ga('pageview', '/virtual/thank-you/?from=' +
            'lk_realty_out_zapisatsya_na_prosmotr');
    }else{
      return ga('pageview', '/virtual/thank-you/?from=' +
            'lk_realty_zapisatsya_na_prosmotr');
    };
  }

  sign = () => {
    const {phone, datetime, favorites} = this.state;
    const {oid, oclass} = this.props;
    const cleanedPhone = phoneCleanup(phone);
    let favData;

    favData = find(favorites, favItem => {
      return favItem.id === parseInt(oid) ?
        favItem : false;
    });


    if(!favData) {
      favData = {
        id: oid,
        class: oclass
      };

      UserActions.updateFavorites(
        'add',
        oid,
        oclass
      );
      WidgetsActions.set('notify',[{
        msg: `Объект ${oid} добавлен в избранное`,
        type: 'info'
      }]);
    }

    if(datetime) {
      favData.forreview = datetime.replace('T', ' ');
      favData.forreview = datetime.replace('+0500', '');
    }

    if((!phone || !phone.length) ||
      !testPhone(cleanedPhone, true, data.options.countryCode.avail) ||
      !datetime) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо указать номер Вашего телефона и выбрать время для просмотра.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      const dateFormatted =
        (new Date(datetime))
          .toLocaleString(
            'ru',
            {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
          );
      const dataSend = {
        action: 'create_ticket',
        phone: cleanedPhone,
        message: `Запрос на просмотр объектов от пользователя ЛК, выбранный объект: ${rusTypes(favData.class)} №${favData.id} выбранное время: ${dateFormatted} `, //eslint-disable-line max-len
        source: 'LK',
        advanced_source: 'LK Objects Review Request', //eslint-disable-line camelcase
        type_id: 132,  //eslint-disable-line camelcase
        city_id: data.options.cityId,  //eslint-disable-line camelcase
        objectId: 0,
        extra: JSON.stringify({
          datetime: datetime,
          objs: {[oclass]: [oid]}
        }, (key, value) => {
          if(typeof value === 'number') {
            return value.toString();
          }
          if(value) {
            return value;
          }
        })
      };

      postOrder(dataSend).then(response => {
        if (response.ok) {
          WidgetsActions.set('notify',[{
            msg: this.getNotifyBlock(favData.id, datetime, response.ticket_id),
            type: 'custom',
            time: 30
          }]);

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
              this.track;
              UserActions.fill(response.data);
            } else {
              WidgetsActions.set('notify',[{
                msg: 'Ошибка получения данных с сервера, пожалуйста, обновите страницу', //eslint-disable-line max-len
                type: 'warn'
              }]);
            }
          });
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
            type: 'dang'
          }]);
        }

      }).catch(() => {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
          type: 'dang'
        }]);
      });
    }

    this.close();
  }


  getNotifyBlock = (oid, datetime, ticketId) => {
    const dateFormatted = (new Date(datetime))
      .toLocaleString('ru', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });

    const notify = (
      <div>
        <div className='notify-header'>Запись на просмотр</div>
        <div className='notify-body'>
          <span>Заявка отправлена, объект </span>
          <span><b>{oid}</b></span><br/>
          <span>Дата и время просмотра:</span><br/>
          <span><b>{dateFormatted}</b></span><br/>
          <span>
            Номер созданной заявки <b>{ticketId}</b>
          </span>
        </div>
      </div>
    );

    return notify;
  };

  getBtnTitle = () => {
    const {favorites} = this.state;
    const {oid} = this.props;
    let hasSign;

    const favData = find(favorites, favItem => {
      return favItem.id === parseInt(oid) ?
        favItem : false;
    });

    if(favData && favData.forreview !== '' &&
    new Date(favData.forreview) > new Date()) {
      hasSign = true;
    } else {
      hasSign = false;
    }

    return hasSign ? 'Изменить время просмотра' : 'Записаться на просмотр';
  };

  getDatePickerTitle = () => {
    const {favorites, datetime} = this.state;
    const {oid} = this.props;
    let hasSign, dateFormatted;

    const favData = find(favorites, favItem => {
      return favItem.id === parseInt(oid) ?
        favItem : false;
    });

    if(datetime) {
      hasSign = true;
      dateFormatted =
        (new Date(datetime))
          .toLocaleString(
            'ru',
            {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
          );
    } else if(favData && favData.forreview !== '' &&
      new Date(favData.forreview) > new Date()) {
      hasSign = true;
      dateFormatted =
        (new Date(`${favData.forreview}+0500`))
          .toLocaleString(
            'ru',
            {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
          );
    } else {
      hasSign = false;
    }

    return hasSign ? dateFormatted : 'Выбрать время просмотра';
  };

  render() {
    const {datetime, phone, showModal} = this.state;
    const minDate = moment().add(1, 'days').format('YYYY-MM-DD');
    const maxDate = moment().add(14, 'days').format('YYYY-MM-DD');

    return (
      <div>
        <Button
          className='btn-green btn-enrol'
          bsStyle='default'
          onClick={this.open}>
          {this.getBtnTitle()}
        </Button>
        <Modal
          className='lkbody--modal'
          show={showModal}
          onHide={this.close}
          animate
        >
        <ModalHeader closeButton>
          <h3 className='text-center'>{this.getBtnTitle()}</h3>
        </ModalHeader>
        <ModalBody>
          <Row className='lkbody-forreview-body-formgroup form-horizontal'>
            <div className="form-group">
              <label className="control-label col-xs-6">
                <span>Удобное время</span>
              </label>
              <div className="col-xs-6">
                <DateTimePicker
                  className='lkbody-forreview__popup'
                  title={this.getDatePickerTitle()}
                  cancelTitle='Отменить просмотр'
                  saveTitle='Выбрать'
                  datetime={datetime}
                  maxDate={maxDate}
                  minDate={minDate}
                  onDateTimeChange={this.dateTimeChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="control-label col-xs-6">
                <span>Телефон</span>
              </label>
              <div className="col-xs-6">
                <FormControl type='text'
                  value={phoneFormatter(
                    phone,
                    data.options.countryCode.current,
                    data.options.countryCode.avail
                  )}
                  style={{
                    marginLeft: '-15px'
                  }}
                  onChange={this.handlePhoneChange}/>
              </div>
              </div>
          </Row>
          <div className='lkbody-forreview-controls text-center'>
            <Button
              type='submit'
              bsStyle='primary'
              className='lkbody--modal_btn'
              onClick={this.sign}>
              {this.getBtnTitle()}
            </Button>
          </div>
        </ModalBody>
      </Modal>
      </div>

    );
  }
}

export default FlatInfoSignForReview;
