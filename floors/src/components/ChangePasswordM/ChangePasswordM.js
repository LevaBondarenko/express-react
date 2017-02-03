/**
 * ChangePasswordM widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';
import s from './ChangePasswordM.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {
  userDataChangePassword, userDataUpdateUser, userDataConfirmByCode
} from '../../actionCreators/UserDataActions';
import {setCookie} from '../../utils/Helpers';

class ChangePasswordM extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    actions: PropTypes.object,
    lkPage: PropTypes.string,
    userdata: PropTypes.object,
    isAuthorized: PropTypes.bool,
    tempHash: PropTypes.oneOfType([
      PropTypes.string, PropTypes.bool
    ]),
    lastError: PropTypes.object,
    mode: PropTypes.string
  };

  static defaultProps = {
    mode: 'auto'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    super(props);
    this.state = {
      authHash: null,
      stage: 0,
      error: false,
      mode: props.mode,
      password: '',
      password2: ''
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentDidMount() {
    const locHash = window.location.hash.replace('#', '');
    const locHashParts = locHash.split('/');
    let mode = this.props.mode, hash = null, email = null;

    if(mode === 'auto') {
      if(locHashParts.length === 3 &&
        ['changepassword', 'confirmemail'].indexOf(locHashParts[0]) > -1) {
        mode = locHashParts[0];
        hash = locHashParts[1];
        email = atob(locHashParts[2]);
      } else {
        this.setState(() => ({stage: 99, mode: mode}));
      }
    } else if(locHashParts.length === 2) {
      hash = locHashParts[0];
      email = atob(locHashParts[1]);
    } else {
      this.setState(() => ({stage: 99, mode: mode}));
    }

    if(email && hash) {
      this.props.actions
        .userDataConfirmByCode('email', hash, email, mode === 'changepassword');
      this.setState(() => ({stage: 1, mode: mode}));
    } else {
      this.setState(() => ({stage: 99, mode: mode}));
    }
  }

  componentWillReceiveProps(nextProps) {
    const {lastError, tempHash, isAuthorized} = nextProps;
    const {stage, mode} = this.state;

    if(lastError.error) {
      this.setState(() => ({stage: 99, error: lastError.message}));
    } else if(stage === 1) {
      if(mode === 'changepassword') {
        tempHash && this.setState(() => ({
          stage: 2,
          authHash: tempHash
        }));
      } else {
        this.setState(() => ({stage: 3}));
      }
    } else if(stage === 2 && isAuthorized) {
      this.setState(() => ({stage: 4}));
    }
  }

  handleChange = e => {
    const {value, dataset: {field}} = e.target;

    this.setState(() => ({[field]: value, error: false}));
  }

  changePassword = () => {
    const {password, password2, authHash} = this.state;
    const cookieDomain = window.location.host.replace(/^[^.]*/, '');

    if(password.length < 6) {
      this.setState(() => ({error: 'Слишком простой пароль'}));
    } else if(password !== password2) {
      this.setState(() => ({error: 'Пароли не совпадают'}));
    } else {
      setCookie('auth_hash', authHash, {
        domain: cookieDomain,
        expireDays: 1,
        path: '/'
      });
      this.props.actions.userDataUpdateUser({password: password});
    }
  }

  render() {
    const {lkPage} = this.props;
    const {password, password2, stage, error, mode} = this.state;
    const title = mode === 'changepassword' ?
      'Смена пароля' : 'Подтверждение Email';
    let body = null;

    switch(stage) {
    case 0:
      body = (
        <div className={s.root}>
          <div className={s.title}>{title}</div>
          <div className={s.loading}>
            <i className='fa fa-spinner fa-pulse fa-2x'/>
          </div>
        </div>
      );
      break;
    case 1:
      body = (
        <div className={s.root}>
          <div className={s.title}>{title}</div>
          <div className={s.loading}>
            Проверка ссылки <i className='fa fa-spinner fa-pulse'/>
          </div>
        </div>
      );
      break;
    case 2:
      body = (
        <div className={s.root}>
          <div className={s.title}>{title}</div>
          <div className={s.successMessage}>
            Задайте новый пароль. Для надежности используйте не менее 6
            символов, заглавные и строчные буквы, цифры.
          </div>
          <div className={s.form}>
            <input
              type='password'
              className={classNames('form-control', s.input)}
              value={password}
              data-field='password'
              onChange={this.handleChange}
              placeholder='Новый пароль'/>
            <input
              type='password'
              className={classNames('form-control', s.input)}
              value={password2}
              data-field='password2'
              onChange={this.handleChange}
              placeholder='Повторите пароль'/>
            <div className={s.validation}>{error}</div>
            <button
              className={classNames(s.button, 'mobile-primary-button')}
              onClick={this.changePassword}>
              Сменить пароль
            </button>
          </div>
        </div>
      );
      break;
    case 3:
      body = (
        <div className={s.root}>
          <div className={s.title}>{title}</div>
          <div className={s.successMessage}>
            Спасибо!<br/>Ваш адрес электронной почты подтвержден!
          </div>
          <div className={s.form}>
            <a href={lkPage}
              className={classNames(s.button, 'mobile-primary-button')}>
              Перейти в Личный кабинет
            </a>
          </div>
        </div>
      );
      break;
    case 4:
      body = (
        <div className={s.root}>
          <div className={s.title}>{title}</div>
          <div className={s.successMessage}>
            Ваш пароль был изменен!
          </div>
          <div className={s.form}>
            <a href={lkPage}
              className={classNames(s.button, 'mobile-primary-button')}>
              Перейти в Личный кабинет
            </a>
          </div>
        </div>
      );
      break;
    default:
      body = (
        <div className={s.root}>
          <div className={s.title}>{title}</div>
          <div className={s.errorMessage}>
            {error === 'wrong code' ? (
              <span>
                Ошибка: Ссылка не действительна или устарела!
              </span>
            ) : (
              <span>
                Ошибка: Попробуйте перезагрузить страницу или обратиться
                в техническую поддержку
              </span>
            )}
          </div>
        </div>
      );
    }

    return body;
  }

}

export default connect(
  state => {
    const lkSettings = state.settings.get('lkSettings').toJS();

    return {
      lkPage: lkSettings.lkPage,
      isAuthorized: state.userData.get('isAuthorized') || false,
      userdata: state.userData.get('userdata') ?
        state.userData.get('userdata').toJS() : {},
      lastError: state.userData.get('lastError') ?
        state.userData.get('lastError').toJS() : {error: false},
      tempHash: state.userData.get('tempHash') || false
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
)(ChangePasswordM);

//cc340f8ddbfd0308dd6825f82739c4698a0613312725923b628b3a57c3a6a676