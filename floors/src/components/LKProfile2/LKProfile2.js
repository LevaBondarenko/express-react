/**
 * LKProfile2 widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import createFragment from 'react-addons-create-fragment';
import {size, clone} from 'lodash';
import classNames from 'classnames';
import {
  testEmail, testPhone, phoneFormatter
} from '../../utils/Helpers';
import {getApiMediaUrl} from '../../utils/mediaHelpers';
import {getCode} from '../../utils/lkHelpers';
import {loadImage, uploadToPics} from '../../utils/requestHelpers';
import s from './LKProfile2.scss';
import ContextType from '../../utils/contextType';
import Image from '../../shared/Image';
import CompactDropdown from '../../shared/CompactDropdown';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormChangePassword from './FormChangePassword';
import FormContacts from './FormContacts';
import FormPhoneConfirm from './FormPhoneConfirm';
import FormEmailConfirm from './FormEmailConfirm';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {
  userDataChangePassword, userDataUpdateUser, userDataConfirmByCode
} from '../../actionCreators/UserDataActions';

class LKProfile2 extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    actions: PropTypes.object,
    userdata: PropTypes.object,
    metadata: PropTypes.object,
    lastError: PropTypes.object,
    lkShow: PropTypes.string,
    countryCode: PropTypes.object,
    mediaSource: PropTypes.number,
    confirmEmailPage: PropTypes.string,
    confirmEmailTemplate: PropTypes.number
  };

  static defaultProps = {};

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      userdata: clone(props.userdata),
      metadata: clone(props.metadata),
      isLoading: false,
      isComplete: false,
      phoneCode: '------',
      nothing2Update: false,
      showPhoneConfirm: false,
      showEmailConfirm: false,
      oldPassword: '',
      newPassword: '',
      newPassword2: '',
      codeSended: 0,
      lastError: {},
      validationError: {},
      ...this.getDateParts(props.userdata.birthday)
    };
    this.timer = null;
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    const {isComplete, isLoading} = this.state;

    this.setState(() => ({
      userdata: clone(nextProps.userdata),
      metadata: clone(nextProps.metadata),
      lastError: nextProps.lastError,
      validationError: {},
      isLoading: false,
      isComplete: isComplete ? isComplete : isLoading,
      showPhoneConfirm: false,
      showEmailConfirm: false,
      ...this.getDateParts(nextProps.userdata.birthday)
    }));
    this.clearLastError(3000);
  }

  clearLastError = delay => {
    setTimeout(() => {
      this.setState(() => ({
        isComplete: false,
        lastError: {error: false},
        nothing2Update: false
      }));
    }, delay);
  }

  get profileComment() {
    const {
      userdata: {f, i, photo, phone, email}, countryCode: {avail}
    } = this.props;
    let result = null;

    if(!size(f) || !size(i) || i === 'Пользователь' ||
      !size(photo) || photo === 'no_photo') {
      result = 'Заполните информацию о себе и добавьте фотографию';
    } else if(!testPhone(phone, true, avail)) {
      result = 'Укажите номер своего телефона для удобства авторизации и безопасности аккаунта'; //eslint-disable-line max-len
    } else if(!testEmail(email)) {
      result = 'Укажите адрес своей электронной почты для дополнительной безопасности вашего аккаунта'; //eslint-disable-line max-len
    }

    return result;
  }

  isValidDate = date => {
    return !isNaN(date.getTime());
  }

  getDateParts = dateStr => {
    const date = new Date(dateStr);
    let result = null;

    if(dateStr && this.isValidDate(date)) {
      const birthdayDate = new Date(dateStr);

      result = {
        day: birthdayDate.getDate(),
        month: birthdayDate.getMonth(),
        year: birthdayDate.getFullYear()
      };
    }

    return result;
  }

  get username() {
    const {userdata: {f, i, o}} = this.props;

    return `${i}${(o && ` ${o}`)}${(f && ` ${f}`)}`;
  }

  get photoUrl() {
    const {userdata: {photo}, mediaSource} = this.props;
    const avaFromPics = (/pics2.etagi.com\/lk\//).test(photo) ||
      (/cdn-media.etagi.com\/content\/media\/lk\//).test(photo);

    return avaFromPics ? photo : getApiMediaUrl(
      avaFromPics ? 'lk' : '160160',
      avaFromPics ? '' : 'profile',
      photo && photo.length ? photo : 'no_photo',
      mediaSource);
  }

  get monthOptions() {
    const months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

    return createFragment({
      monthOptions: months.map((item, key) => {
        return(
          <option key={`month-${key}`} value={key}>{item}</option>
        );
      })
    });
  }

  get sexOptions() {
    const sexes = [
      {title: 'Мужской', value: 1},
      {title: 'Женский', value: 2},
    ];
    const {userdata: {sex}} = this.state;

    return createFragment({
      sexOptions: sexes.map(item => {
        return (
          <div key={`sex-${item.value}`}>
            <input
              id={`sex-${item.value}`}
              type='radio'
              data-type='userdata'
              data-field='sex'
              checked={sex === item.value}
              onChange={this.onChange}
              value={item.value}/>
            <label htmlFor={`sex-${item.value}`}>
              <i/>
              <span>{item.title}</span>
            </label>
          </div>
        );
      })
    });
  }

  get contactStatuses() {
    const {
      userdata: {
        phone: storedPhone, phone_confirm_code: phoneCode,
        email: storedEmail, email_confirm_token: emailCode,
      },
      metadata: {
        phone_ext: storedPhoneExt
      }
    } = this.props;
    const {
      userdata: {email, phone}, metadata: {phone_ext: phoneExt}
    } = this.state;

    return {
      phone: phone === storedPhone ? (
        storedPhone === (phoneCode && phoneCode.toString()) ?
        'confirmed' : 'saved'
      ) : 'changed',
      email: email === storedEmail ? (
        storedEmail === emailCode ?
        'confirmed' : 'saved'
      ) : 'changed',
      phone_ext: phoneExt === storedPhoneExt ? 'saved' : 'changed' //eslint-disable-line camelcase
    };
  }

  getAvatar = () => {
    this.refs.inputfile.click();
  }

  loadAvatar = e => {
    const {files} = e.target;

    if(files[0].type !== 'image/png' &&
      files[0].type !== 'image/jpeg' &&
      files[0].type !== 'image/gif') {
      this.setState(() => ({
        error: 'Ошибка загрузки фото, необходимо изображение в формате jpg, gif, png.' //eslint-disable-line max-len
      }));
    } else {
      loadImage(files[0]).then(response => {
        uploadToPics(response.file, response.result).then(response => {
          if(response.status) {
            const {userdata} = this.state;
            const imgSymbols = response.filename.toString().substr(0, 2);

            userdata.photo = `https://cdn-media.etagi.com/content/media/lk/${imgSymbols[0]}/${imgSymbols}/${response.filename}`;
            this.setState(() => ({userdata: userdata}));
            this.updateProfile();
          } else {
            this.setState(() => ({
              error: 'Ошибка загрузки фото, если ошибка повторяется - обратитесь в службу поддержки.' //eslint-disable-line max-len
            }));
          }
        }, (error) => {
          this.setState(() => ({
            error: `Ошибка загрузки фото (${error.err}), если ошибка повторяется - обратитесь в службу поддержки`, // eslint-disable-line max-len
          }));
        });
      }, (error) => {
        this.setState(() => ({
          error: `Ошибка чтения файла: ${error.name}`
        }));
      });
    }
  }

  getPhoneCode = () => {
    const {userdata: {phone}, codeSended} = this.state;

    if(codeSended) {
      this.setState(() => ({showPhoneConfirm: true}));
    } else {
      getCode('phone', phone).then(res => {
        if(res.ok) {
          this.setState(() => ({
            codeSended: 600,
            showPhoneConfirm: true
          }));
          this.timer = setInterval(this.tick, 1000);
        } else {
          this.setState(() => ({
            codeSended: 0,
            lastResult: res.result,
            showPhoneConfirm: true
          }));
        }
      });
    }
  }

  getEmailToken = () => {
    const {userdata: {email}} = this.state;
    const {protocol, host} = window.location;
    const {confirmEmailPage, confirmEmailTemplate} = this.props;
    const baseurl = `${protocol}//${host}${confirmEmailPage}#`;

    getCode('email', email, baseurl, confirmEmailTemplate).then(res => {
      if(res.ok) {
        this.setState(() => ({
          showEmailConfirm: true
        }));
      } else {
        this.setState(() => ({
          lastResult: res.result
        }));
      }
    });
  }

  tick = () => {
    let {codeSended} = this.state;

    codeSended--;
    this.setState(() => ({codeSended: codeSended}));
    if(codeSended < 1 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onChange = e => {
    const {type, field} = e.target.dataset || {};
    const {value} = e.target || {};
    const intValues = ['sex'];
    let value2set = intValues.indexOf(field) > -1 ? parseInt(value) : value;

    if(type) {
      const fields = this.state[type];
      const {countryCode} = this.props;

      if(field === 'phone') {
        value2set = phoneFormatter(
          value2set,
          countryCode.current,
          countryCode.avail
        ).replace(/[^0-9+]*/g, '').replace(/^\+?7/g, '8');
      }
      fields[field] = value2set;
      this.setState(() => ({[type]: fields, validationError: {}}));
    } else {
      if(field === 'phoneCode') {
        value2set =
          (`------${value2set.replace(/\D/g, '').slice(0, 6)}`).slice(-6);
      }
      this.setState(() => ({[field]: value2set, validationError: {}}));
    }
  }

  onBirthdateChange = e => {
    const {field} = e.target.dataset || {};
    const {value} = e.target || {};
    const {userdata, day, month, year} = this.state;
    const {birthday} = userdata;
    const date = new Date(birthday);
    const cleanedValue = parseInt(value.replace(/\D/g, ''));

    switch(field) {
    case 'day' :
      date.setMonth(month);
      date.setFullYear(year);
      date.setDate(`0${cleanedValue}`.substr(-2));
      break;
    case 'month' :
      date.setDate(day);
      date.setFullYear(year);
      date.setMonth(`0${cleanedValue}`.substr(-2));
      break;
    case 'year' :
      date.setDate(day);
      date.setMonth(month);
      date.setFullYear(
        cleanedValue > 1900 ? `000${cleanedValue}`.substr(-4) : 'dermo'
      );
      break;
    default :
      //do nothing
    }
    userdata.birthday = this.isValidDate(date) ?
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` : null;
    this.setState(() => ({userdata: userdata, [field]: value}));
  }

  changePassword = () => {
    const {oldPassword, newPassword, newPassword2} = this.state;

    if(newPassword !== newPassword2) {
      this.setState(() => ({
        lastError: {
          error: true,
          message: 'Пароли не совпадают'
        }
      }));
      this.clearLastError(3000);
    } else if(newPassword.length < 6) {
      this.setState(() => ({
        lastError: {
          error: true,
          message: 'Новый пароль слишком простой'
        }
      }));
      this.clearLastError(3000);
    } else {
      this.setState(() => ({isLoading: true, oldPassword: ''}));
      this.props.actions.userDataChangePassword(oldPassword, newPassword);
    }
  }

  contactAction = e => {
    const {isLoading} = this.state;
    const {contact, action} = e.target.dataset || {};
    const status = action ? action : (contact && this.contactStatuses[contact]);

    if(isLoading) {
      return;
    }
    switch(status) {
    case 'changed':
      this.updateProfile(contact);
      break;
    case 'saved':
      if(['phone', 'email'].indexOf(contact) > -1) {
        contact === 'phone' && this.getPhoneCode();
        contact === 'email' && this.getEmailToken();
      }
      break;
    case 'cancelConfirmation':
      this.setState(() => ({
        showPhoneConfirm: false,
        showEmailConfirm: false
      }));
      break;
    case 'requestPhoneCode':
      this.getPhoneCode();
      break;
    case 'sendPhoneCode':
      const {userdata: {phone}, phoneCode} = this.state;

      this.setState(() => ({isLoading: true}));
      this.props.actions.userDataConfirmByCode('phone', phoneCode, phone);
      break;
    default:
      //do nothing
    }
  }

  updateProfile = (what = 'all') => {
    const fieldsToUpdate = what === 'all' ? [] : what.split(',');
    const {userdata, metadata, countryCode: {avail}} = this.props;
    const {userdata: tUserdata, metadata: tMetadata} = this.state;
    const updatingData = {}, validationError = {};

    this.setState(() => ({isLoading: true}));
    Object.keys(tUserdata).forEach(key => {
      if(!tUserdata[key] ||
        (key === 'phone' && !testPhone(tUserdata[key], true, avail)) ||
        (key === 'email' && !testEmail(tUserdata[key]))) {
        validationError[key] = true;
      } else if(tUserdata[key] !== userdata[key] &&
        (fieldsToUpdate.length < 1 || fieldsToUpdate.indexOf(key) > -1)) {
        updatingData[key] = tUserdata[key];
      }
    });
    Object.keys(tMetadata).forEach(key => {
      if(!tMetadata[key]) {
        validationError[key] = true;
      }
      if(tMetadata[key] !== metadata[key] && tMetadata[key] &&
        (fieldsToUpdate.length < 1 || fieldsToUpdate.indexOf(key) > -1)) {
        updatingData[key] = tMetadata[key];
      }
    });

    if(size(updatingData)) {
      this.props.actions.userDataUpdateUser(updatingData);
      this.setState(() => ({validationError: validationError}));
    } else {
      this.setState(() => ({
        nothing2Update: true,
        isLoading: false,
        validationError: validationError
      }));
      this.clearLastError(3000);
    }
  }

  render() {
    const {
      context, lkShow, userdata: {photo}, countryCode
    } = this.props;
    const {
      isLoading, isComplete, lastError, validationError,
      userdata: {f, i, o, phone, email, birthday},
      metadata: {phone_ext: phoneExt},
      oldPassword, newPassword, newPassword2, nothing2Update,
      phoneCode, showPhoneConfirm, showEmailConfirm, codeSended,
      newPhoto, day, month, year
    } = this.state;
    const emptyPhoto = !size(photo) || photo === 'no_photo';
    const {profileComment} = this;
    const birthdayParts = this.getDateParts(birthday);
    const phoneFormatted = phoneFormatter(
      phone, countryCode.current, countryCode.avail
    );
    let saveButtonTitle = 'Сохранить все';

    isLoading && (saveButtonTitle = <i className='fa fa-spin fa-spinner'/>);
    isComplete && (saveButtonTitle = 'Готово');
    nothing2Update && (saveButtonTitle = 'Изменений не обнаружено');
    lastError.error && (saveButtonTitle = lastError.message);

    return lkShow === 'profile' ? (
      <div className={s.root}>
        <div className={s.title}>
          Мой профиль
        </div>
        {profileComment ? (
          <div className={s.comment}>
            {profileComment}
          </div>
        ) : null}
        <div className={s.avatar} onClick={this.getAvatar}>
          <div className={s.avatarBlock}>
            <Image
              image={this.photoUrl}
              visual='lk'
              width={100}
              height={100}
              alt={this.username}
              className='img-circle'/>
            <div className={s.photoComment}>
              {emptyPhoto ? 'Добавить фотографию' : 'Изменить фотографию'}
            </div>
            <input
              className={s.inputFile}
              ref='inputfile'
              type='file'
              accept='.jpg,.jpeg,.gif,.png'
              value={newPhoto}
              onChange={this.loadAvatar}/>
          </div>
        </div>
        <div className={s.fio}>
          <FormControl
            componentClass='input'
            data-type='userdata'
            data-field='f'
            value={f || ''}
            onChange={this.onChange}
            placeholder='Фамилия'/>
          <FormControl
            componentClass='input'
            data-type='userdata'
            data-field='i'
            value={i || ''}
            onChange={this.onChange}
            placeholder='Имя'/>
          <FormControl
            componentClass='input'
            data-type='userdata'
            data-field='o'
            value={o || ''}
            onChange={this.onChange}
            placeholder='Отчество'/>
        </div>
        <div className={s.birthday}>
          <span>Дата рождения</span>
          <div className={s.birthdayDate}>
            <FormControl
              componentClass='input'
              className={s.day}
              data-field='day'
              value={birthdayParts ? birthdayParts.day : day}
              onChange={this.onBirthdateChange}/>
            <FormControl
              componentClass='select'
              className={s.month}
              data-field='month'
              value={birthdayParts ? birthdayParts.month : month}
              onChange={this.onBirthdateChange}>
              {this.monthOptions}
            </FormControl>
            <FormControl
              componentClass='input'
              className={s.year}
              data-field='year'
              value={birthdayParts ? birthdayParts.year : year}
              onChange={this.onBirthdateChange}/>
          </div>
        </div>
        <div className={s.sex}>
          <span>Пол</span>
          <div className={s.sexValues}>
            {this.sexOptions}
          </div>
        </div>
        <CompactDropdown
          context={context}
          title='Изменение пароля'
          className={s.blockContainer}
          titleClassName={s.titleBlockContainer}>
          <FormChangePassword
            submit={this.changePassword}
            onChange={this.onChange}
            isLoading={isLoading}
            isComplete={isComplete}
            lastError={lastError}
            newPassword2={newPassword2}
            newPassword={newPassword}
            oldPassword={oldPassword}/>
        </CompactDropdown>
        <CompactDropdown
          context={context}
          title='Контактная информация'
          className={s.blockContainer}
          titleClassName={s.titleBlockContainer}>
          <FormContacts
            onChange={this.onChange}
            contactAction={this.contactAction}
            isLoading={isLoading}
            statuses={this.contactStatuses}
            phone={phoneFormatted || ''}
            email={email || ''}
            phoneExt={phoneExt || ''}
            validationError={validationError}/>
        </CompactDropdown>
        <div className={s.submitAll}>
          <button
            className={classNames(s.button, 'mobile-primary-button')}
            onClick={this.updateProfile.bind(this, 'all')}>
            {saveButtonTitle}
          </button>
        </div>
        {showPhoneConfirm ? (
          <FormPhoneConfirm
            onChange={this.onChange}
            contactAction={this.contactAction}
            isLoading={isLoading}
            phone={phone}
            phoneCode={phoneCode}
            codeSended={codeSended}/>
        ) : null}
        {showEmailConfirm ? (
          <FormEmailConfirm
            contactAction={this.contactAction}
            isLoading={isLoading}
            email={email}/>
        ) : null}
      </div>
    ) : null;
  }
}

export default connect(
  state => {
    const lkSettings = state.settings.get('lkSettings').toJS();

    return {
      lkShow: state.ui.get('lkShow'),
      userdata: state.userData.get('userdata') ?
        state.userData.get('userdata').toJS() : {},
      metadata: state.userData.get('metadata') ?
        state.userData.get('metadata').toJS() : {},
      lastError: state.userData.get('lastError') ?
        state.userData.get('lastError').toJS() : {error: false},
      countryCode: state.settings.get('countryCode').toJS(),
      mediaSource: state.settings.get('mediaSource'),
      confirmEmailPage: lkSettings.lkConfirmEmailPage,
      confirmEmailTemplate: lkSettings.lkConfirmEmailTemplate
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        updateInUiState,
        userDataChangePassword,
        userDataUpdateUser,
        userDataConfirmByCode
      }, dispatch)
    };
  }
)(LKProfile2);
