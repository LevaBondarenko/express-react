/**
 * LK Profile component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {extend, map, clone, without, union, size, includes} from 'lodash';
import classNames from 'classnames';
import {testEmail, testPhone, testPassword, phoneFormatter}
  from '../../utils/Helpers';
import {loadImage, uploadToPics, getFromBack} from '../../utils/requestHelpers';
import HelpIcon from '../../shared/HelpIcon';
import DateTimePicker from '../../shared/DateTimePicker';
import {getApiMediaUrl} from '../../utils/mediaHelpers';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import createFragment from 'react-addons-create-fragment';
import ga from '../../utils/ga';
/**
 * React/Flux entities
 */
import WidgetsActions from '../../actions/WidgetsActions';
import UserActions from '../../actions/UserActions';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl, {Feedback} from 'react-bootstrap/lib/FormControl';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import Radio from 'react-bootstrap/lib/Radio';
import Dropzone from 'react-dropzone';

const Basil = canUseDOM ? require('basil.js') : {};
/* global data */

class LKProfile extends Component {
  static propTypes = {
    user: React.PropTypes.object,
    meta: React.PropTypes.object,
    socials: React.PropTypes.object,
    confirmEmailPath: React.PropTypes.string,
    confirmEmailTemplate: React.PropTypes.string,
    onProfileUpdate: React.PropTypes.func,
    auth_uri: React.PropTypes.object //eslint-disable-line camelcase
  };
  constructor(props) {
    super(props);
    this.notValidFields = [];
  }

  componentWillMount() {
    this.loadProfile();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close);
  }

  componentWillReceiveProps(nextProps) {
    this.loadProfile(nextProps.user, nextProps.meta);
  }

  loadProfile(user = this.props.user, meta = this.props.meta) {
    const usr = clone(user);
    const fields = extend(
      usr, meta,
      {phone: phoneFormatter(
        usr.phone ? usr.phone.replace('8', '+7 ') : '',
        data.options.countryCode.current,
        data.options.countryCode.avail
      )}
    );
    const birthdayDate = fields.birthday ?
      new Date(fields.birthday) : new Date();

    this.setState(() => ({
      fields: fields,
      loading: false,
      showPhoneConfirm: false,
      showEmailSended: false,
      phoneCode: '',
      day: birthdayDate.getDate(),
      month: birthdayDate.getMonth(),
      year: birthdayDate.getFullYear()
    }));
  }

  onProfileReset() {
    setTimeout(() => {
      this.loadProfile();
    }, 0);
  }

  onProfileUpdate(fieldsToSave = 'all') {
    const updated = {};
    const {fields} = this.state;
    const old = extend(this.props.user, this.props.meta);

    fieldsToSave = fieldsToSave !== 'all' ? fieldsToSave.split(',') : null;

    if(size(this.notValidFields && !fieldsToSave)) {
      WidgetsActions.set('notify',[{
        msg: `Проверьте правильность заполнения данных, полей с ошибками: ${size(this.notValidFields)}`, // eslint-disable-line max-len
        type: 'dang'
      }]);
    }
    for(const i in fields) {
      if(fields[i] && !includes(this.notValidFields, i) &&
        (!fieldsToSave || includes(fieldsToSave , i))) {
        if(i === 'phone') {
          if(fields[i] !== phoneFormatter(
            old[i] ? old[i].replace('8', '+7 ') : '',
            data.options.countryCode.current,
            data.options.countryCode.avail
          )) {
            updated[i] = fields[i];
          }
        } else if(!old[i] || fields[i] !== old[i]) {
          updated[i] = this.state.fields[i];
        }
      }
    }

    if(size(updated)) {
      WidgetsActions.set('notify',[{
        msg: `Обновляется полей: ${size(updated)}`,
        type: 'info'
      }]);
      this.props.onProfileUpdate(updated);
    } else {
      WidgetsActions.set('notify',[{
        msg: 'Изменений не обнаружено, нечего сохранять!',
        type: 'warn'
      }]);
    }
  }

  setValidFields(result, ref) {
    if(result) {
      this.notValidFields = without(this.notValidFields, ref);
    } else {
      this.notValidFields = union(this.notValidFields, [ref]);
    }
  }

  requireValidation(ref, help = 0) {
    const {fields} = this.state;
    const results = {
      success: ['success', ''],
      error: ['error', 'Это поле обязательно к заполнению']
    };
    let result;
    const length = fields[ref] ? fields[ref].length : 0;

    if(ref === 'sex' && fields.sex && parseInt(fields.sex) !== 3) {
      result = results.success[help];
    } else if(ref === 'city' && fields.city && parseInt(fields.city)) {
      result = results.success[help];
    } else if(ref === 'f' && length > 1) {
      result = results.success[help];
    } else if (length > 2) {
      result = results.success[help];
    } else {
      result = results.error[help];
    }
    if(!help) {
      this.setValidFields(result === results.success[0], ref);
    }
    return result;
  }

  phoneValidation(ref, help = 0) {
    const {fields} = this.state;
    const results = {
      success: ['success', ''],
      warning: ['warning', 'Номер телефона введен не корректно'],
      error: ['error', 'Это поле обязательно к заполнению']
    };
    let result;
    const length = fields[ref] ? fields[ref].length : 0;

    if(length < 2) {
      result = results.error[help];
    } else if(!testPhone(fields[ref])) {
      result = results.warning[help];
    } else {
      result = results.success[help];
    }
    if(!help) {
      this.setValidFields(result === results.success[0], ref);
    }
    return result;
  }

  emailValidation(ref, help = 0) {
    const {fields} = this.state;
    const results = {
      success: ['success', ''],
      warning: ['warning', 'Адрес электронной почты введен не корректно'],
      error: ['error', 'Это поле обязательно к заполнению']
    };
    let result;
    const length = fields[ref] ? fields[ref].length : 0;

    if(length < 2) {
      result = results.error[help];
    } else if(!testEmail(fields[ref])) {
      result = results.warning[help];
    } else {
      result = results.success[help];
    }
    if(!help) {
      this.setValidFields(result === results.success[0], ref);
    }
    return result;
  }

  handleChange(e) {
    const {fields} = this.state;
    const field = e.target.dataset.field;
    let value = e.target.value;

    if(field !== 'birthday') {
      //birthday input - read-only, changing only with datepicker
      if(field === 'phone') {
        value = phoneFormatter(
          value,
          data.options.countryCode.current,
          data.options.countryCode.avail
        );
      }
      fields[field] = value || '';
      this.setState(() => ({fields: fields}));
    }
  }

  handleTimeChange(e) {
    if(e) {
      const {fields} = this.state;
      const birthdayDate = new Date(e);

      fields.birthday = e;
      this.setState(() => ({
        fields: fields,
        day: birthdayDate.getDate(),
        month: birthdayDate.getMonth(),
        year: birthdayDate.getFullYear()
      }));
    }
  }

  handleBirthdayChange(e) {
    const field = e.target.dataset.field;
    const value = e.target.value;
    const {fields} = this.state;
    const {birthday} = fields;
    const date = birthday ? new Date(birthday) : new Date();

    switch(field) {
    case 'day' :
      date.setDate(`0${value}`.substr(-2));
      date.setMonth(this.state.month);
      date.setFullYear(this.state.year);
      break;
    case 'month' :
      date.setDate(this.state.day);
      date.setMonth(`0${value}`.substr(-2));
      date.setFullYear(this.state.year);
      break;
    case 'year' :
      date.setDate(this.state.day);
      date.setMonth(this.state.month);
      date.setFullYear(`000${value}`.substr(-4));
      break;
    default :
      //do nothing
    }
    fields.birthday =
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    this.setState(() => ({
      fields: fields,
      [field]: value
    }));
  }

  handleCodeChange(e) {
    const value = e.target.value;

    this.setState(() => ({phoneCode: value}));
  }

  handleDrop = (event) => {
    if(event[0].type !== 'image/png' &&
      event[0].type !== 'image/jpeg' &&
      event[0].type !== 'image/gif') {
      WidgetsActions.set('notify',[{
        msg: 'Ошибка загрузки фото, необходимо изображение в формате jpg, gif, png.', // eslint-disable-line max-len
        type: 'dang'
      }]);
    } else {
      loadImage(event[0]).then(response => {
        uploadToPics(response.file, response.result).then(response => {
          if(response.status) {
            const {fields} = this.state;
            const imgSymbols = response.filename.toString().substr(0, 2);

            fields.photo = `https://cdn-media.etagi.com/content/media/lk/${imgSymbols[0]}/${imgSymbols}/${response.filename}`;
            this.setState(() => ({
              fields: fields
            }));
            WidgetsActions.set('notify',[{
              msg: 'Фото загружено, для сохранения профиля нажнмите "Сохранить" внизу страницы.', // eslint-disable-line max-len
              type: 'info'
            }]);
          } else {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка загрузки фото, если ошибка повторяется - обратитесь в службу поддержки', // eslint-disable-line max-len
              type: 'dang'
            }]);
          }
        }, (error) => {
          WidgetsActions.set('notify',[{
            msg: `Ошибка загрузки фото (${error.err}), если ошибка повторяется - обратитесь в службу поддержки`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        });
      }, (error) => {
        WidgetsActions.set('notify',[{
          msg: `Ошибка чтения файла: ${error.name}`,
          type: 'dang'
        }]);
      });
    }
  }

  loadPhoto() {
    this.refs.dropPhoto.open();
  }

  delPhoto() {
    const {fields} = this.state;

    fields.photo = 'no_photo';
    this.setState(() => ({
      fields: fields
    }));
  }

  authSocial(s, e) {
    const {socials} = this.props;

    if(socials[s]) {
      UserActions.del(`socials/${socials[s].id}`);
    } else {
      const basil = new Basil({namespace: 'etagi_com'});
      const retPath = window.location.href;
      const cookieDomain = window.location.host.replace(/^[^.]*/, '');

      UserActions.clearLocalCachedData();
      basil.set('authSocial', s);
      basil.set('auth_ret_page', retPath, {
        domain: cookieDomain,
        namespace: '',
        storages: ['cookie']
      });
      window.location = this.props.auth_uri[s];
    }
    e.preventDefault();
  }

  phoneAction() {
    const saving = this.phoneState === 'changed';

    if(saving) {
      this.onProfileUpdate('phone');
    } else if(!this.state.showPhoneConfirm) {
      if(this.state.showEmailSended) {
        document.removeEventListener('click', this.close);
      }
      document.addEventListener('click', this.close);
      this.setState(() => ({
        showPhoneConfirm: !this.state.showPhoneConfirm,
        showEmailSended: false
      }));
    }
  }

  getCode() {
    const {phone} = this.state.fields;
    const cleanedPhone = phone.replace(/[^0-9+]*/g, '').replace('+7', '8');

    getFromBack({
      action: 'user_sendcode',
      to: 'phone',
      phone: cleanedPhone
    }).then(response => {
      if(response && response.ok) {
        WidgetsActions.set('notify',[{
          msg: 'Код подтверждения отправлен на Ваш телефон',
          type: 'info'
        }]);
      } else {
        WidgetsActions.set('notify',[{
          msg: 'Ошибка отправки кода подтверждения!',
          type: 'warn'
        }]);
      }
    });
  }

  setCode() {
    const {phoneCode} = this.state;
    const {phone} = this.state.fields;
    const cleanedPhone = phone.replace(/[^0-9+]*/g, '').replace('+7', '8');

    if(phoneCode.length) {
      this.dismiss();
      this.setState(() => ({phoneCode: ''}));
      getFromBack({
        action: 'user_confirmbycode',
        to: 'phone',
        phone: cleanedPhone,
        code: phoneCode
      }).then(response => {
        if(response.ok) {
          UserActions.set(null, response.data);
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Неверный код!',
            type: 'warn'
          }]);
        }
      });
    } else {
      WidgetsActions.set('notify',[{
        msg: 'Необходимо ввести код подтверждения!',
        type: 'warn'
      }]);
    }
  }

  emailAction() {
    const saving = this.emailState === 'changed';

    if(saving) {
      this.onProfileUpdate('email');
    } else if(!this.state.showEmailSended) {
      const {email} = this.state.fields;
      const {protocol, host} = window.location;
      const {confirmEmailPath, confirmEmailTemplate} = this.props;

      if(this.state.showPhoneConfirm) {
        document.removeEventListener('click', this.close);
      }
      this.setState(() => ({
        showPhoneConfirm: false,
        loading: true
      }));
      getFromBack({
        action: 'user_sendcode',
        to: 'email',
        email: email,
        template: confirmEmailTemplate,
        baseurl: `${protocol}//${host}${confirmEmailPath}#`
      }).then(response => {
        if(response && response.ok) {
          document.addEventListener('click', this.close);
          this.setState(() => ({
            showPhoneConfirm: false,
            showEmailSended: !this.state.showEmailSended,
            loading: false
          }));
        } else {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки кода подтверждения!',
            type: 'warn'
          }]);
        }
      });

    }
  }

  dismiss() {
    document.removeEventListener('click', this.close);
    this.setState(() => ({
      showPhoneConfirm: false,
      showEmailSended: false
    }));
  }

  close = (e) => {
    let ancestor = e.target;

    while(!ancestor.classList.contains('lk-popup') &&
      (ancestor = ancestor.parentElement)) {};
    if(!ancestor) {
      this.setState(() => ({showPhoneConfirm: false, showEmailSended: false}));
      document.removeEventListener('click', this.close);
    }
  }

  changed(field) {
    const {user, meta} = this.props;
    const old = extend(user, meta);
    const {fields} = this.state;

    if(field === 'phone') {
      const cleanedPhone =
        fields.phone.replace(/[^0-9+]*/g, '').replace('+7', '8');

      return cleanedPhone !== old.phone;
    } else {
      return fields[field] !== old[field];
    }
  }

  confirmed(field) {
    const {fields} = this.state;
    let res;

    switch(field) {
    case 'phone' :
      const cleanedPhone =
        fields.phone.replace(/[^0-9+]*/g, '').replace('+7', '8');

      res = parseInt(cleanedPhone) === fields.phoneConfirmCode;
      break;
    case 'email' :
      res = fields.email === fields.emailConfirmToken;
      break;
    default :
      res = null;
    }
    return res;
  }

  get changedPhoneExt() {
    return this.changed('phoneExt');
  }

  get phoneState() {
    const changed = this.changed('phone');

    if(this.confirmed('phone') && !changed) {
      return 'confirmed';
    } else if(changed) {
      return 'changed';
    } else {
      return 'saved';
    }
  }

  get emailState() {
    const changed = this.changed('email');

    if(this.confirmed('email') && !changed) {
      return 'confirmed';
    } else if(changed) {
      return 'changed';
    } else {
      return 'saved';
    }
  }

  trackEvent = () => {
    ga('pageview', '/virtual/lk/profile');

    this.trackEvent = () => {};
  }

  render() {
    const {fields, loading, showEmailSended, showPhoneConfirm, phoneCode,
      day, month, year} = this.state;
    const {socials} = this.props;
    const {socProps} = UserActions;
    const sex = {1: 'Мужской', 2: 'Женский', 3: 'Не определен'};
    const subscribes = {
      1: 'каждый день',
      3: 'раз в 3 дня',
      7: 'раз в неделю',
      14: 'каждые 2 недели',
      disable: 'отписаться'
    };
    const months = [
      'январь',
      'февраль',
      'март',
      'апрель',
      'май',
      'июнь',
      'июль',
      'август',
      'сентябрь',
      'октябрь',
      'ноябрь',
      'декабрь'
    ];
    const cities = extend(data.collections.cities, {0: {name: 'Не определен'}});
    const phone = fields.phone.length ?
      phoneFormatter(
        fields.phone,
        data.options.countryCode.current,
        data.options.countryCode.avail
      ) : fields.phone;
    const avaFromPics = (/pics2.etagi.com\/lk\//).test(fields.photo) ||
      (/cdn-media.etagi.com\/content\/media\/lk\//).test(fields.photo);
    const photoUrl = avaFromPics ? fields.photo : getApiMediaUrl(
        avaFromPics ? 'lk' : '160160',
        avaFromPics ? '' : 'profile',
        fields.photo && fields.photo.length ? fields.photo : 'no_photo',
        data.options.mediaSource);
    const dateSelector = (
      <DateTimePicker
        title={<i className='fa fa-calendar' />}
        cancelTitle='Отмена'
        saveTitle='Выбрать'
        withoutTime={true}
        bsStyle='default'
        rightAlign={true}
        className='pull-right'
        popupHeader='Укажите дату Вашего рождения'
        popupComment=''
        datetime={fields.birthday}
        onDateTimeChange={this.handleTimeChange.bind(this)}/>
      );
    const sexOptions = createFragment({
      sexOptions: map(sex, (item, key) => {
        return(
          <option key={key} value={key}>{item}</option>
        );
      })
    });
    const cityOptions = createFragment({
      sexOptions: map(cities, (item, key) => {
        return(
          <option key={key} value={key}>{item.name}</option>
        );
      })
    });
    const monthOptions = createFragment({
      sexOptions: map(months, (item, key) => {
        return(
          <option key={key} value={key}>{item}</option>
        );
      })
    });
    const subscribeOptions = createFragment({
      sexOptions: map(subscribes, (item, key) => {
        const checked = fields.emailSubscribe &&
          fields.emailSubscribe.toString() === key ? 'checked' : '';

        return(
          <FormGroup className='col-xs-12'>
            <Radio checked={checked}
              value={key} key={key}
              name='emailSubscribe'
              data-field='emailSubscribe'
              onChange={this.handleChange.bind(this)}>
                <span>{item}</span>
            </Radio>
            <Feedback />
          </FormGroup>
        );
      })
    });
    const subscribeFavorites = createFragment({
      sexOptions: map(subscribes, (item, key) => {
        const checked = fields.favoritesSubscribe &&
          fields.favoritesSubscribe.toString() === key ? 'checked' : '';

        return(
          <FormGroup className='col-xs-12'>
            <Radio checked={checked}
              label={item} value={key} key={key}
              name='favoritesSubscribe'
              data-field='favoritesSubscribe'
              onChange={this.handleChange.bind(this)}>
              <span>{item}</span>
            </Radio>
            <Feedback />
          </FormGroup>
        );
      })
    });
    const subscribeSearches = createFragment({
      sexOptions: map(subscribes, (item, key) => {
        const checked = fields.searchesSubscribe &&
          fields.searchesSubscribe.toString() === key ? 'checked' : '';

        return(
          <FormGroup className='col-xs-12'>
            <Radio checked={checked}
              value={key} key={key}
              name='searchesSubscribe'
              data-field='searchesSubscribe'
              onChange={this.handleChange.bind(this)}>
               <span>{item}</span>
            </Radio>
            <Feedback />
          </FormGroup>
        );
      })
    });

    const socButtons = map(this.props.auth_uri, (item, key) =>{
      return (
        <Col xs={3} key={key} className='socials'>
          <div className={classNames(
              socProps[key].class.replace(/btn-/, ''),
              'socials-item'
            )}>
            <i className={socProps[key].icon}/>
            <span>{socProps[key].title}</span>
          </div>
          <Button
            onClick={this.authSocial.bind(this, key)}
            className={classNames(
              'pull-right',
              {'btn-gray': !socials[key]}
            )}
            bsStyle={socials[key] ? 'primary' : 'default'}>
            <span>{socials[key] ? 'Привязано' : 'Привязать'}</span>
            <span className='assigned-on-hover'>Отвязать</span>
          </Button>
        </Col>
      );
    });

    this.trackEvent();

    return(
      <div className='lkbody-profile'>
        <Row>
          <Col xs={12}>
            <div className='lkbody-pagetitle'>
              Мой профиль
              <HelpIcon
                placement='top'
                className='help-text-left'
                helpText={(
                  <span>
                    Редактируйте свой профиль. Расскажите о себе больше и наш
                    сервис будет полезнее для вас!
                  </span>
                )}/>
            </div>
          </Col>
        </Row>
        <div className='form-horizontal'>
          <Row className='lkbody-profile-group'>
            <h3>Регистрационные данные</h3>
            <Col xs={6} className='lkbody-profile-avatar'>
              <div className='avatar'>
                <Dropzone className='avatar-drop-here' multiple={false}
                          accept=".jpg,.jpeg,.gif,.png"
                          activeStyle={{background: '#eaffea', opacity: 0.1}}
                          onDrop={this.handleDrop} ref='dropPhoto'>
                    &nbsp;
                </Dropzone>
                <img
                  src={photoUrl} width="125" height="125"
                  alt={`${fields.f} ${fields.i}`} />
              </div>
              <div className='avatar-control'>
                <p className='small'>
                  <span>Формат:&nbsp;</span>
                  <span className='text-muted'>jpg, gif, png</span><br/>
                  <span>Максимальный объем файла:&nbsp;</span>
                  <span className='text-muted'>2Mb</span><br/>
                  <span>Рекомендованный размер:&nbsp;</span>
                  <span className='text-muted'>150x150 px</span>
                </p>
                <input style={{position: 'fixed', top: '-100px'}} type='file'/>
                <Button
                  bsStyle='primary'
                  bsSize='small'
                  type='button'
                  onClick={this.loadPhoto.bind(this)}>
                  Загрузить фото
                </Button>
                &nbsp;&nbsp;&nbsp;
                <Button
                  bsStyle='info'
                  bsSize='small'
                  type='button'
                  title='Удалить фото'
                  onClick={this.delPhoto.bind(this)}>
                  Удалить
                </Button>
                <p className='small' style={{paddingTop: '20px'}}>
                  <i className='fa fa-hand-o-left' />
                  &nbsp;Или перетащите сюда Вашу фотографию.
                </p>
              </div>
            </Col>
            <Col xs={6}>
              <LKProfilePassword {...this.props} />
            </Col>
          </Row>
          <Row className='lkbody-profile-group'>
            <h3>Персональные данные</h3>
            <Col xs={6}>
            <FormGroup validationState={this.requireValidation('i')}>
              <Col xs={4}>
              <ControlLabel style={{float: 'left'}}
              className='col-xs-3'>Имя</ControlLabel>
              </Col>
              <Col xs={8}>
              <FormControl type='text'
                value={fields.i} data-field='i'
                placeholder='Как к Вам обращаться'
                onChange={this.handleChange.bind(this)}
                className='col-xs-6' />
                <Feedback style={{top: '0'}}/>
                <HelpBlock>{this.requireValidation('i', 1)}</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup validationState={this.requireValidation('o')}>
              <Col xs={4}>
                <ControlLabel style={{float: 'left'}}
                className='col-xs-3'>Отчество</ControlLabel>
              </Col>
              <Col xs={8}>
                <FormControl type='text'
                  value={fields.o} data-field='o'
                  placeholder='Ваше отчество'
                  onChange={this.handleChange.bind(this)} />
                  <Feedback style={{top: '0'}} />
                  <HelpBlock>{this.requireValidation('o', 1)}</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup validationState={this.requireValidation('f')}>
              <Col xs={4}>
                <ControlLabel style={{float: 'left'}}
                className='col-xs-3'>Фамилия</ControlLabel>
              </Col>
              <Col xs={8}>
                <FormControl type='text'
                  value={fields.f} data-field='f'
                  placeholder='Введите свою фамилию'
                  onChange={this.handleChange.bind(this)} />
                  <Feedback style={{top: '0'}} />
                  <HelpBlock>{this.requireValidation('f', 1)}</HelpBlock>
              </Col>
            </FormGroup>
            </Col>
            <Col xs={6}>
                <FormGroup validationState={this.requireValidation('sex')}>
                  <Col xs={4}>
                    <ControlLabel style={{float: 'left'}}
                  className='col-xs-3'>Пол</ControlLabel>
                  </Col>
                  <Col xs={8}>
                    <select type='select'
                      value={fields.sex} data-field='sex'
                      placeholder='Укажите пол'
                      onChange={this.handleChange.bind(this)}
                      className='form-control'>
                      {sexOptions}
                    </select>
                    <Feedback style={{top: '0'}} />
                    <HelpBlock>{this.requireValidation('sex', 1)}</HelpBlock>
                  </Col>
                </FormGroup>
              <FormGroup>
                <Col xs={4}>
                  <ControlLabel>Дата рождения</ControlLabel>
                </Col>
                <Col xs={8} className='form-group-birthday'>
                  <Col xs={2}>
                    <input
                      type='text'
                      data-field='day'
                      placeholder='День'
                      className='form-control'
                      value={day}
                      onChange={this.handleBirthdayChange.bind(this)}/>
                  </Col>
                  <Col xs={5}>
                    <select
                      type='select'
                      data-field='month'
                      placeholder='Выберите месяц'
                      className='form-control'
                      value={month}
                      onChange={this.handleBirthdayChange.bind(this)}>
                      {monthOptions}
                    </select>
                  </Col>
                  <Col xs={3}>
                    <input
                      type='text'
                      data-field='year'
                      placeholder='Год'
                      className='form-control'
                      value={year}
                      onChange={this.handleBirthdayChange.bind(this)}/>
                  </Col>
                  <Col xs={2}>
                    {dateSelector}
                  </Col>
                </Col>
              </FormGroup>
              <FormGroup validationState={this.requireValidation('city')}>
                <Col xs={4}>
                  <ControlLabel className='col-xs-3'>
                    Город
                  </ControlLabel>
                </Col>
                <Col xs={8}>
                  <select type='select'
                    value={fields.city} data-field='city'
                    placeholder='Выберите город'
                    onChange={this.handleChange.bind(this)}
                    className='form-control col-xs-6'>
                    {cityOptions}
                  </select>
                  <Feedback style={{top: '0'}} />
                  <HelpBlock>
                    {this.requireValidation('city', 1)}
                  </HelpBlock>
                </Col>
              </FormGroup>
              <Col xs={12}>
                <Button
                  className='pull-right btn-gray'
                  bsStyle='default'
                  type='button'
                  onClick={
                    this.onProfileUpdate.bind(this, 'f,i,o,sex,birthday,city')
                  }>
                  Сохранить изменения
                </Button>
              </Col>
            </Col>
          </Row>
          <Row className='lkbody-profile-group'>
            <h3>Контактная информация</h3>
            <Col xs={6}>
              <div className='lk-popup-wrapper'>
                <FormGroup validationState={this.phoneValidation('phone')}>
                  <Col xs={4}>
                    <ControlLabel>Номер телефона</ControlLabel>
                  </Col>
                  <Col xs={8}  style={{padding: '0'}}>
                    <Button
                      bsStyle='default'
                      className='btn-gray'
                      disabled={this.phoneState === 'confirmed' || loading}
                      onClick={this.phoneAction.bind(this)}
                      style={{
                        float: 'right',
                        margin: '0 14px 0 0',
                        float: 'right',
                        width: '105px'
                      }}>
                      {loading ? <i className='fa fa-spinner fa-pulse'/> : (
                        (this.phoneState === 'confirmed' ? 'Подтвержден' :
                        (this.phoneState === 'changed' ? 'Сохранить' :
                        'Подтвердить'
                      )))}
                    </Button>
                    <FormControl type='text'
                      value={phone} data-field='phone'
                      label=''
                      style={{width: '57%', margin: '0px'}}
                      placeholder='Введите ваш номер телефона'
                      onChange={this.handleChange.bind(this)} />
                      <HelpBlock>{this.phoneValidation('phone', 1)}</HelpBlock>
                      <Feedback style={{top: '0'}} />
                  </Col>
                </FormGroup>
                {showPhoneConfirm ?
                  <div className='lk-popup'>
                    <div className='lk-popup-header'>
                      Подтверждение номера телефона
                    </div>
                    <div className='lk-popup-comment'>
                      Нажмите "Получить код", затем введите,<br/>
                      полученный в смс, код в поле ввода и<br/>
                      нажмите "Ввести код"
                    </div>
                    <Row>
                      <Col xs={12}>
                        <input
                          type='text'
                          value={phoneCode}
                          data-field='phoneCode'
                          className='form-control'
                          onChange={this.handleCodeChange.bind(this)}/>
                      </Col>
                    </Row>
                    <div className='lk-popup-controls'>
                      <Button
                        bsStyle='default'
                        bsSize='small'
                        onClick={this.getCode.bind(this)}>
                        Получить код
                      </Button>
                      <Button
                        bsStyle='primary'
                        bsSize='small'
                        onClick={this.setCode.bind(this)}>
                        Ввести код
                      </Button>
                    </div>
                  </div> : null
                }
              </div>
              <div className='lk-popup-wrapper'>
                <FormGroup validationState={this.emailValidation('email')}>
                  <Col xs={4}>
                  <ControlLabel>Email</ControlLabel>
                  </Col>
                  <Col xs={8}  style={{padding: '0'}}>
                    <Button
                      bsStyle='default'
                      className='btn-gray'
                      disabled={this.emailState === 'confirmed' || loading}
                      onClick={this.emailAction.bind(this)}
                      style={{
                        float: 'right',
                        margin: '0 14px 0 0',
                        float: 'right',
                        width: '105px'
                      }}>
                      {loading ? <i className='fa fa-spinner fa-pulse'/> : (
                        (this.emailState === 'confirmed' ? 'Подтвержден' :
                        (this.emailState === 'changed' ? 'Сохранить' :
                        'Подтвердить'
                      )))}
                    </Button>
                    <FormControl type='text'
                      value={fields.email} data-field='email'
                      label='' placeholder='ivanov@mail.com'
                      style={{width: '57%', margin: '0px'}}
                      onChange={this.handleChange.bind(this)}
                    />
                    <Feedback style={{top: '0'}} />
                    <HelpBlock>{this.emailValidation('email', 1)}</HelpBlock>
                  </Col>
                </FormGroup>
                {showEmailSended ?
                  <div className='lk-popup'>
                    <div className='lk-popup-header'>
                      Подтверждение email
                    </div>
                    <div className='lk-popup-comment'>
                      На Ваш email отправлено письмо<br/>
                      с инструкциями по дальнейшим действиям
                    </div>
                    <Row><Col xs={12}>&nbsp;</Col></Row>
                    <div className='lk-popup-controls'>
                      <Button
                        bsStyle='primary'
                        bsSize='small'
                        onClick={this.dismiss.bind(this)}>
                        Закрыть
                      </Button>
                    </div>
                  </div> : null
                }
              </div>
            </Col>
            <Col xs={6}>
              <FormGroup>
                <Col xs={4}>
                  <ControlLabel>Доп.телефон</ControlLabel>
                </Col>
                <Col xs={8} style={{padding: '0'}}>
                  <Button
                    bsStyle='default'
                    className='btn-gray'
                    disabled={!this.changedPhoneExt}
                    onClick={this.onProfileUpdate.bind(this, 'phoneExt')}
                    style={{
                      float: 'right',
                      margin: '0 14px 0 0',
                      float: 'right',
                      width: '105px'
                    }}>
                    {this.changedPhoneExt ? 'Сохранить' : 'Сохранено'}
                  </Button>
                  <FormControl type='text'
                    value={fields.phoneExt || ''} data-field='phoneExt'
                    placeholder='Доп.телефон'
                    style={{width: '61%', margin: '0px'}}
                    bsStyle={null}
                    onChange={this.handleChange.bind(this)}/>
                  <Feedback style={{top: '0'}} />
                </Col>
              </FormGroup>
            </Col>
            <Col xs={12}>
              Привяжите учетную запись в соц. сети и легко входите через нее
              в Личный кабинет на нашем сайте.
            </Col>
            {socButtons}
          </Row>
          <Row className='lkbody-profile-group no-form-group-margin'>
            <h3>Периодичность информационной email - рассылки</h3>
            <Col xs={12} className="small negative-top-margin">
              * Выберите удобную для Вас периодичность получения полезной
              информации по Вашей недвижимости
            </Col>
            <Col xsOffset={1} xs={3}>
              <h4>Общая информация</h4>
              {subscribeOptions}
            </Col>
            <Col xsOffset={1} xs={3}>
              <h4>Избранное</h4>
              {subscribeFavorites}
            </Col>
            <Col xsOffset={1} xs={3}>
              <h4>Подписки</h4>
              {subscribeSearches}
            </Col>
          </Row>
          <Row className='lkbody-profile-group'><Col xs={12}>&nbsp;</Col></Row>
          <Row className='lkbody-profile-group'>
            <div className='form-group'>
              <Col xsOffset={2} xs={8} className='text-center'>
                <Button
                  bsStyle='default'
                  className='btn-gray'
                  type='button'
                  onClick={this.onProfileReset.bind(this, 'all')}>
                  Отменить изменения
                </Button>
                <Button
                  bsStyle='primary'
                  type='button'
                  onClick={this.onProfileUpdate.bind(this, 'all')}>
                  Сохранить все
                </Button>
              </Col>
              <Col xsOffset={4} xs={4} className='text-center'>
                {false ? (
                  <Button
                    bsStyle='link'
                    type='button'
                    onClick={this.onProfileReset.bind(this)}>
                    Удалить свой профиль
                  </Button>
                ) : null}
              </Col>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

class LKProfilePassword extends Component {
  static propTypes = {
    onPasswordChange: React.PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: '',
      newPassword: '',
      repPassword: ''
    };
  }

  passwordValidation(ref, help = 0) {
    const results = {
      empty: [null, ''],
      success: ['success', ''],
      warning: ['warning', 'Слишком простой пароль, используйте буквы и цифры'],
      warning2: ['warning', 'Пароли не совпадают'],
      error: ['error', 'Короткий пароль, должно быть не менее 6 символов']
    };
    let result;
    const length = this.state[ref] ? this.state[ref].length : 0;

    if(length < 1) {
      result = results.empty[help];
    } else if(length < 6) {
      result = results.error[help];
    } else if(ref === 'newPassword' && !testPassword(this.state[ref])) {
      result = results.warning[help];
    } else if(ref === 'repPassword' &&
      this.state.newPassword !== this.state.repPassword) {
      result = results.warning2[help];
    } else {
      result = results.success[help];
    }
    return result;
  }

  handleChange(e) {
    const field = e.target.dataset.field;
    const value = e.target.value;

    this.setState(() => ({
      [field]: value || ''
    }));
  }

  onPasswordChange() {
    if(!testPassword(this.state.newPassword)) {
      WidgetsActions.set('notify',[{
        msg: 'Слишком простой пароль. Пароль должен быть не короче 6 символов и содержать буквы и цифры.', // eslint-disable-line max-len
        type: 'dang'
      }]);
    } else if(this.state.newPassword !== this.state.repPassword) {
      WidgetsActions.set('notify',[{
        msg: 'Пароли не совпадают',
        type: 'dang'
      }]);
    } else {
      this.props.onPasswordChange(this.state);
      this.setState(() => ({
        oldPassword: ''
      }));
    }
  }

  render() {
    return(
      <div className='lkbody-profile-passwordform'>
        <FormGroup>
          <Col xs={4}>
            <ControlLabel>Старый пароль</ControlLabel>
          </Col>
          <Col xs={8}>
            <FormControl type='password'
              value={this.state.oldPassword}
              data-field='oldPassword'
              placeholder='Старый пароль'
              bsStyle={null}
              onChange={this.handleChange.bind(this)} />
            <Feedback />
          </Col>
        </FormGroup>
        <FormGroup
          validationState={this.passwordValidation('newPassword')}>
          <Col xs={4}>
            <ControlLabel>Новый пароль</ControlLabel>
          </Col>
          <Col xs={8}>
            <FormControl type='password'
              value={this.state.newPassword}
              data-field='newPassword' placeholder='Новый пароль'
              onChange={this.handleChange.bind(this)}/>
              <Feedback />
              <HelpBlock>{this.passwordValidation('newPassword', 1)}</HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup validationState={this.passwordValidation('repPassword')}>
          <Col xs={4}>
            <ControlLabel>Повторите пароль</ControlLabel>
          </Col>
          <Col xs={8}>
            <FormControl type='password'
              value={this.state.repPassword}
              data-field='repPassword' placeholder='Повторите пароль'
              onChange={this.handleChange.bind(this)} />
            <Feedback />
            <HelpBlock>{this.passwordValidation('repPassword', 1)}</HelpBlock>
          </Col>
        </FormGroup>
        <Col xs={12}>
          <Button
            className='pull-right btn-gray'
            bsStyle='default'
            type='button'
            onClick={this.onPasswordChange.bind(this)}>
            Сменить пароль
          </Button>
        </Col>
      </div>
    );
  }
}

export default LKProfile;
