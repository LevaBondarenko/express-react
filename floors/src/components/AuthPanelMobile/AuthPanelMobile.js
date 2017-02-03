/**
 * AuthPanelMobile widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import {
  setCookie, testPhone, testEmail
} from '../../utils/Helpers';
import ga from '../../utils/ga';
import AuthPanelMobileMenu from './AuthPanelMobileMenu';
import AuthPanelMobileLogin from './AuthPanelMobileLogin';
import AuthPanelMobileRegister from './AuthPanelMobileRegister';
import AuthPanelMobileRestore from './AuthPanelMobileRestore';
import s from './AuthPanelMobile.scss';
import ContextType from '../../utils/contextType';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {
  initUserDataState, updateInUserDataState, userLogout, userLogin, userRegister
} from '../../actionCreators/UserDataActions';

class AuthPanelMobile extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    actions: PropTypes.object,
    userData: PropTypes.object,
    favorites: PropTypes.array,
    myobjects: PropTypes.array,
    searches: PropTypes.array,
    isAuthorized: PropTypes.bool,
    show: PropTypes.string,
    lkSettings: PropTypes.object,
    mediaSource: PropTypes.number
  };

  static defaultProps = {
    profilePath: '/my/'
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      login: '',
      password: '',
      password2: '',
      error: null
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps() {
    this.setState(() => ({error: null}));
  }

  get enabledModules() {
    const {lkSettings: {modules}} = this.props;

    return modules
      .filter(item => {
        return item.name !== 'profile' && item.enabled;
      })
      .map(item => item.name);
  }

  componentDidMount() {
    this.props.actions.initUserDataState(this.enabledModules);
  }

  onChange = e => {
    const {value, dataset: {field}} = e.target;

    this.setState(() => ({
      [field]: value
    }));
  }

  logout = e => {
    e.preventDefault();
    this.props.actions.updateInUiState(['mobileShow'], () => (null));
    this.props.actions.userLogout();
  }

  login = e => {
    e.preventDefault();
    const {login, password} = this.state;
    const cleanedPhone = login.replace(/[^0-9+]*/g, '');
    const isEmail = testEmail(login);
    const isPhone = testPhone(cleanedPhone, true);
    let error = null;

    if(!isEmail && !isPhone) {
      error = 'Телефон или EMail введены некорректно';
    }

    if(!error) {
      this.props.actions.updateInUiState(['mobileShow'], () => (null));
      this.props.actions.userLogin(login, password, this.enabledModules);
      this.setState(() => ({login: '', password: '', error: error}));
    } else {
      this.setState(() => ({error: error}));
    }
  }

  register = e => {
    e.preventDefault();
    const {login, password, password2} = this.state;
    const cleanedPhone = login.replace(/[^0-9+]*/g, '');
    const isEmail = testEmail(login);
    const isPhone = testPhone(cleanedPhone, true);
    let error = null;

    if(!isEmail && !isPhone) {
      error = 'Телефон или EMail введены некорректно';
    }

    if(password.length < 6) {
      error = 'короткий пароль, должно быть не менее 6 символов';
    }

    if(password !== password2) {
      error = 'пароли не совпадают';
    }

    this.setState(() => ({error: error}));
    if(!error) {
      this.props.actions.updateInUiState(['mobileShow'], () => (null));
      this.props.actions.userRegister(
        isPhone ? login : null,
        isEmail ? login : null,
        password,
        this.enabledModules
      );
      this.setState(() => ({
        login: '', password: '', password2: '', error: error
      }));
    } else {
      this.setState(() => ({error: error}));
    }
  }

  authSocial = e => {
    const {link, social} = e.target.dataset || {};

    if(link) {
      const retPath = window.location.href;
      const cookieDomain = window.location.host.replace(/^[^.]*/, '');

      setCookie('auth_ret_page', retPath, {
        domain: cookieDomain,
        expireDays: 1,
        path: '/'
      });

      // trackEvent
      switch (social) {
      case 'google':
        ga('button', 'lk_enter_social_googleplus');
        break;
      case 'vk':
        ga('button', 'lk_enter_social_vkontakte');
        break;
      case 'facebook':
        ga('button', 'lk_enter_social_facebook');
        break;
      case 'odnoklassniki':
        ga('button', 'lk_enter_social_odnoklassniki');
        break;
      default: //
      }

      this.props.actions.updateInUiState(['mobileShow'], () => (null));
      window.location = link;
    }
  }

  switchDialog = e => {
    const {show} = e.target.dataset || {};

    this.props.actions.updateInUiState(['mobileShow'],
      () => (show ? show : null));
  }

  render() {
    const {show, isAuthorized} = this.props;
    let block = null;

    if(!isAuthorized) {
      switch(show) {
      case 'lk':
        block = (
          <AuthPanelMobileLogin
            {...this.props}
            {...this.state}
            onChange={this.onChange}
            doLogin={this.login}
            authSocial={this.authSocial}
            switchDialog={this.switchDialog}/>
        );
        break;
      case 'lkRegister':
        block = (
          <AuthPanelMobileRegister
            {...this.props}
            {...this.state}
            onChange={this.onChange}
            doRegister={this.register}
            authSocial={this.authSocial}
            switchDialog={this.switchDialog}/>
        );
        break;
      case 'lkRestore':
        block = (
          <AuthPanelMobileRestore {...this.props} onChange={this.onChange}/>
        );
        break;
      default:
        //do nothing
      }
    } else if(['lk', 'lkRegister', 'lkRestore'].indexOf(show) > -1) {
      block = (
        <AuthPanelMobileMenu
          {...this.props}
          logout={this.logout}
          switchDialog={this.switchDialog}/>
      );
    }

    return (
      <div className={s.root}>
        {block}
      </div>
    );
  }

}

export default connect(
  state => {
    return {
      show: state.ui.get('mobileShow'),
      isAuthorized: state.userData.get('isAuthorized') || false,
      userData: state.userData.get('userdata') ?
        state.userData.get('userdata').toJS() : {},
      favorites: state.userData.get('favorites') ?
        state.userData.get('favorites').toJS() : [],
      searches: state.userData.get('searches') ?
        state.userData.get('searches').toJS() : [],
      myobjects: state.userData.get('myobjects') ?
        state.userData.get('myobjects').toJS() : [],
      lkSettings: state.settings.get('lkSettings').toJS(),
      mediaSource: state.settings.get('mediaSource'),
      countryCode: state.settings.get('countryCode').toJS()
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        updateInUiState,
        updateInUserDataState,
        initUserDataState,
        userLogout,
        userLogin,
        userRegister
      }, dispatch)
    };
  }
)(AuthPanelMobile);
