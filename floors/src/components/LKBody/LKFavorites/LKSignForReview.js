/**
 * LK Sign For Review component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import {map, size, union} from 'lodash';
import LKReviewThumbs from './LKReviewThumbs';
import DateTimePicker from '../../../shared/DateTimePicker';
import {phoneFormatter, testPhone, rusTypes} from '../../../utils/Helpers';
import {postOrder, getFromBack} from '../../../utils/requestHelpers';
import moment from 'moment/moment';
import ReactDOM from 'react-dom';
/**
 * Bootstrap 3 elements
 */
import FormControl from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
/**
 * React/Flux entities
 */
import UserActions from '../../../actions/UserActions';
import WidgetsActions from '../../../actions/WidgetsActions';

/* global data */

class LKSignForReview extends Component {
  static propTypes = {
    favorites: React.PropTypes.array,
    forReview: React.PropTypes.array,
    user: React.PropTypes.object,
    isAuthorized: React.PropTypes.bool,
    objects: React.PropTypes.object
  };
  constructor(props) {
    super(props);
    this.onScroll = this.onScroll.bind(this);
    this.state = {
      positionFixed: false,
      phone: props.user.phone ? props.user.phone.replace('8', '+7 ') : '',
      isAuthorized: props.isAuthorized,
      favorites: props.favorites,
      forReview: props.forReview,
      datetime:
        `${moment().add(1, 'days').format('YYYY-MM-DD')}T10:00:00+05:00`,
      drag: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      favorites: nextProps.favorites,
      forReview: nextProps.forReview,
      phone: nextProps.user.phone ?
        nextProps.user.phone.replace('8', '+7 ') : '',
      isAuthorized: nextProps.isAuthorized
    }));
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  getNH(nhId) {
    const nhs = size(this.props.objects) ? this.props.objects.nh_flats : null;
    const obj = nhs ? this.props.objects.nh_flats[nhId] : null;

    return obj ? obj.gp : '';
  }

  onScroll() {
    let positionFixed;
    const el = ReactDOM.findDOMNode(this.refs.forreviewbox);
    const offsetTop = this.offsetTop ? this.offsetTop : el.offsetTop + 40;
    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;

    if(!this.offsetTop) {
      this.offsetTop = el.offsetTop + 40;
    }
    if(scrollTop > offsetTop) {
      el.style.position = 'fixed';
      positionFixed = true;
    } else {
      el.style.position = 'relative';
      positionFixed = false;
    }
    this.state.positionFixed !== positionFixed && this.setState(() => ({
      positionFixed: positionFixed
    }));
  }

  handlePhoneChange(e) {
    const value = e.target.value;

    this.setState(() => ({phone: value}));
  }

  sign() {
    const {phone, forReview, datetime} = this.state;
    const cleanedPhone = phone.replace(/[^0-9+]*/g, '').replace('+7', '8');
    const {user} = this.props;
    const objs = {};

    if((!user.phone || !user.phone.length) && !testPhone(cleanedPhone, true)) {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо указать номер Вашего телефона.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else if(!size(forReview)) {
      if(!user.phone || !user.phone.length) {
        UserActions.updateUser({phone: cleanedPhone});
      }
      WidgetsActions.set('notify',[{
        msg: 'Ошибка отправки заявки. Необходимо выбрать объекты для просмотра.', //eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      let phoneForTicket;

      if(user.phone && user.phone.length) {
        phoneForTicket = user.phone;
      } else {
        phoneForTicket = cleanedPhone;
        UserActions.updateUser({phone: cleanedPhone});
      }
      let textBlock = '';
      const dateFormatted =
        moment(datetime)
          .toDate()
          .toLocaleString(
            'ru',
            {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
          );
      const forReviewBlock = map(forReview, item => {
        textBlock += item.class === 'nh_flats' ?
          `Квартира в новостройке ${this.getNH(item.id)} кв №${item.id}, ` :
          `${rusTypes(item.class)} №${item.id}, `;
        if(!objs[item.class]) {
          objs[item.class] = [item.id];
        } else {
          objs[item.class].push(item.id);
        }
        return (
          <Row key={`fr${item.class}${item.id}`}>
            <Col xsOffset={2} xs={2}><b>{item.id}</b></Col>
            <Col xs={6} className='text-left'>Дата: <b>{dateFormatted}</b></Col>
          </Row>
        );
      });
      const dataSend = {
        phone: phoneForTicket,
        message: `Запрос на просмотр объектов от пользователя ЛК, список выбранных объектов: ${textBlock} выбранное время: ${dateFormatted} `, //eslint-disable-line max-len
        source: 'LK',
        advanced_source: 'LK Objects Review Request', //eslint-disable-line camelcase
        type_id: 132,  //eslint-disable-line camelcase
        city_id: data.options.cityId,  //eslint-disable-line camelcase
        objectId: 0,
        extra: JSON.stringify({
          datetime: datetime,
          objs: objs
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
          const notifyBlock =
            (
              <div>
                <div className='notify-header'>Запись на просмотр</div>
                <div className='notify-body'>
                  <span>Заявка на просмотр отправлена</span><br/>
                  <span>Объекты ({size(forReview)}) для просмотра:</span><br/>
                  <div>{forReviewBlock}</div>
                  <span>
                    В ближайшее время с Вами свяжется специалист службы
                    просмотров и уточнит детали
                  </span><br/>
                  <span>
                    Номер созданной заявки <b>{response.ticket_id}</b>
                  </span>
                </div>
              </div>
            );

          WidgetsActions.set('notify',[{
            msg: notifyBlock,
            type: 'custom',
            time: 30
          }]);
          for(const i in forReview) {
            if(forReview[i]) {
              const favData = forReview[i];

              favData.forreview =
                datetime.replace(/\+[0-9]{4}/g, '').replace('T', ' ');
              UserActions.updateFavorites(
                'add',
                favData.id,
                favData.class,
                favData
              );
            }
          }
          UserActions.set(null, {
            forReview: []
          });
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
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
            type: 'dang'
          }]);
        }
      }, error => {
        error;
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки заявки. Пожалуйста, обновите страницу и попробуйте еще раз.', //eslint-disable-line max-len
          type: 'dang'
        }]);
      });
    }
  }

  allowDrop(e) {
    e.preventDefault();
  }

  onDragEnter() {
    this.setState(() => ({drag: true}));
  }

  onDragLeave() {
    this.setState(() => ({drag: false}));
  }

  onDrop(e) {
    const oid = parseInt(e.dataTransfer.getData('id'));
    const oclass = e.dataTransfer.getData('class');
    const {favorites, forReview, datetime} = this.state;
    let favData = null, forReviewExist = null;

    e.preventDefault();
    for(const i in forReview) {
      if(forReview[i] &&
        forReview[i].class === oclass &&
        forReview[i].id === oid) {
        forReviewExist = forReview[i];
        break;
      }
    }
    if(forReviewExist) {
      const notifyBlock =
        (
          <div>
            <div className='notify-header'>Запись на просмотр</div>
            <div className='notify-body'>
              <span>Объект </span>
              <span><b>{forReviewExist.id}</b> уже присутствует</span><br/>
              <span>в списоке объектов на просмотр</span><br/>
              <span>
                Для отправки заявки на просмотр, после выбора всех интересующих
                Вас объектов, нажмите кнопку "Записаться на просмотр", в
                правом нижнем блоке
              </span>
            </div>
          </div>
        );

      WidgetsActions.set('notify',[{
        msg: notifyBlock,
        type: 'custom',
        time: 30
      }]);
      this.setState(() => ({drag: false}));
    } else {
      for(const i in favorites) {
        if(favorites[i] &&
          favorites[i].class === oclass &&
          favorites[i].id === oid) {
          favData = favorites[i];
          break;
        }
      }
      const dateFormatted =
        moment(datetime)
          .toDate()
          .toLocaleString(
            'ru',
            {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
          );
      const notifyBlock =
        (
          <div>
            <div className='notify-header'>Запись на просмотр</div>
            <div className='notify-body'>
              <span>Объект </span>
              <span><b>{favData.id}</b></span><br/>
              <span>добавлен в список объектов на просмотр</span><br/>
              <span>Дата и время просмотра:</span><br/>
              <span><b>{dateFormatted}</b></span><br/>
              <span>
                Для отправки заявки на просмотр, после выбора всех интересующих
                Вас объектов, нажмите кнопку "Записаться на просмотр", в
                правом нижнем блоке
              </span>
            </div>
          </div>
        );

      WidgetsActions.set('notify',[{
        msg: notifyBlock,
        type: 'custom',
        time: 30
      }]);
      UserActions.set(null, {
        forReview: union(forReview, [favData])
      });
      this.setState(() => ({drag: false}));
    }
  }

  dateTimeChange(e) {
    if(e !== false) {
      this.setState(() => ({datetime: `${e}+05:00`}));
    }
  }

  render() {
    const {phone, isAuthorized, datetime, drag, positionFixed} = this.state;
    const minDate = moment().add(1, 'days').format('YYYY-MM-DD');
    const maxDate = moment().add(14, 'days').format('YYYY-MM-DD');
    const phoneFormatted = phone && phone.length ? phoneFormatter(
      phone,
      data.options.countryCode.current,
      data.options.countryCode.avail
    ) : '';
    const dateFormatted = moment(datetime).toDate().toLocaleString('ru',
          {month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'}
      );

    return isAuthorized ? (
      <div
        ref='forreviewbox'
        className={classNames('lkbody-forreview',{'dragover': drag})}>
        <div className='lkbody-forreview-title'>
          <span>Запишитесь</span>
          <span>на бесплатный просмотр</span>
        </div>
        <div className='lkbody-forreview-body'>
          <span>выбранных квартир в удобное время на автомобиле агентства</span>
          <Row className='lkbody-forreview-body-formgroup form-horizontal'>
            <div className='form-group'>
              <label className='control-label col-xs-6'>
                <span>Удобное время</span>
              </label>
              <div className='col-xs-6'>
                <DateTimePicker
                  title={dateFormatted}
                  cancelTitle='Отмена'
                  saveTitle='Выбрать'
                  rightAlign={true}
                  topAlign={!positionFixed}
                  datetime={datetime}
                  maxDate={maxDate}
                  minDate={minDate}
                  onDateTimeChange={this.dateTimeChange.bind(this)}/>
              </div>
            </div>
            <div className="form-group" >
              <label className="control-label col-xs-4">
                <span>Телефон</span>
              </label>
              <div className="col-xs-8">
                <FormControl type='text'
                  value={phoneFormatted}
                  label='Телефон'
                  onChange={this.handlePhoneChange.bind(this)}/>
              </div>
            </div>
          </Row>
          <div className='lkbody-forreview-body-dropzone'>
            <div className='dropzone-target'
              onDrop={this.onDrop.bind(this)}
              onDragOver={this.allowDrop.bind(this)}
              onDragEnter={this.onDragEnter.bind(this)}
              onDragLeave={this.onDragLeave.bind(this)}/>
            <span className='dropzone-title'>
              <i className='fa fa-hand-o-up' />
              <span> Перетащите сюда</span>
            </span><br/>
            <span>
              квартиры из "Избранного" или кликните на карточке квартиры
            <br/>
              "Записаться на просмотр"
            </span>
          </div>
        </div>
        <div className='lkbody-forreview-controls'>
          <Button bsStyle='danger' onClick={this.sign.bind(this)}>
            Записаться на просмотр
          </Button>
        </div>
        <div className='lkbody-forreview-thumbs'>
          <LKReviewThumbs {...this.props} />
        </div>
      </div>
    ) : null;
  }
}

export default LKSignForReview;
