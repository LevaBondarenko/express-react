/**
 * Authorization Panel Register Form component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {testPhone, testEmail, testPassword} from '../../utils/Helpers';
import Basil from 'basil.js';
import {map} from 'lodash';
import ga from '../../utils/ga';
/**
 * React/Flux entities
 */
import UserTypes from '../../constants/UserTypes';
import UserActions from '../../actions/UserActions';

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import FormControl, {Feedback} from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';

class AuthPanelRegisterForm extends Component {
  static propTypes = {
    lkSettings: React.PropTypes.object,
    auth_uri: React.PropTypes.object, //eslint-disable-line camelcase
    id: React.PropTypes.string,
    showForm: React.PropTypes.string,
    profilePath: React.PropTypes.string
  };
  constructor(props) {
    super(props);
    this.state = {
      login: {
        value: '',
        style: null,
        help: ''
      },
      password: {
        value: '',
        style: null,
        help: ''
      },
      password2: {
        value: '',
        style: null,
        help: ''
      },
      accept: {
        value: false,
        style: 'form-group',
        help: ''
      }
    };
  }

  register(e) {
    let allok = true;
    const state = this.state;
    const cleanedPhone = state.login.value.replace(/[^0-9+]*/g, '');
    const email = testEmail(state.login.value);
    const phone = testPhone(cleanedPhone, true);
    const inviteForm = this.props.showForm === UserTypes.FORM_INVITE;

    if(!phone && !email) {
      state.login.help = 'Телефон или EMail введены некорректно';
      state.login.style = 'error';
      allok = false;
    }
    if(this.state.password.value.length < 6) {
      state.password.style = 'error';
      state.password.help = 'короткий пароль, должно быть не менее 6 символов';
      allok = false;
    }
    if(this.state.password.value !== this.state.password2.value) {
      state.password2.style = 'error';
      state.password2.help = 'пароли не совпадают';
      allok = false;
    }
    if(allok) {
      UserActions.register(
        phone ? this.state.login.value : null,
        email ? this.state.login.value : null,
        this.state.password.value,
        this.props.lkSettings,
        this.props.profilePath
      );
    } else {
      this.setState(state);
    }
    inviteForm ? ga('button', 'lk_signup_promo') : ga('button', 'lk_signup');
    e.preventDefault();
  }

  authSocial(s, e) {
    const basil = new Basil({namespace: 'etagi_com'});
    const retPath = window.location.href;
    const cookieDomain = window.location.host.replace(/^[^.]*/, '');
    const inviteForm = this.props.showForm === UserTypes.FORM_INVITE;

    // trackEvent
    switch (s) {
    case 'google':
      inviteForm ? ga('button', 'lk_signup_promo_social_googleplus') :
        ga('button', 'lk_signup_social_googleplus');
      break;
    case 'vk':
      inviteForm ? ga('button', 'lk_signup_promo_social_vkontakte') :
        ga('button', 'lk_signup_social_vkontakte');
      break;
    case 'facebook':
      inviteForm ? ga('button', 'lk_signup_promo_social_facebook') :
        ga('button', 'lk_signup_social_facebook');
      break;
    case 'odnoklassniki':
      inviteForm ? ga('button', 'lk_signup_promo_social_odnoklassniki') :
        ga('button', 'lk_signup_social_odnoklassniki');
      break;
    default: //
    }

    basil.set('authSocial', s);
    basil.set('auth_ret_page', retPath, {
      domain: cookieDomain,
      namespace: '',
      storages: ['cookie']
    });
    window.location = this.props.auth_uri[s];
    e.preventDefault();
  }

  login(e) {
    UserActions.showLogin();
    ga('button', 'lk_enter_registration');
    if(this.props.showForm === UserTypes.FORM_INVITE &&
      this.props.lkSettings.invite.enabled) {
      UserActions.scheduleShowInvite();
    }
    e.preventDefault();
  }

  restore(e) {
    UserActions.showRestore();
    ga('link', 'lk_enter_forgot_password');
    if(this.props.showForm === UserTypes.FORM_INVITE &&
      this.props.lkSettings.invite.enabled) {
      UserActions.scheduleShowInvite();
    }
    e.preventDefault();
  }

  handleChange(e) {
    let style, help;
    const state = this.state;

    if(e.target.value.length === 0) {
      style = null;
      help = '';
    } else {
      switch(e.target.dataset.name) {
      case 'login':
        const cleanedPhone = e.target.value.replace(/[^0-9+]*/g, '');

        if(testPhone(cleanedPhone, true) || testEmail(e.target.value)) {
          help = '';
          style = 'success';
        }
        break;
      case 'password':
        if(e.target.value.length < 6) {
          style = 'error';
          help = 'короткий пароль, должно быть не менее 6 символов';
        } else if(!testPassword(e.target.value)) {
          style = 'warning';
          help = 'простой пароль, используйте буквы и цифры';
        } else {
          style = 'success';
          help = '';
        }
        break;
      case 'password2':
        if(e.target.value === state.password.value) {
          style = 'success';
          help = '';
        } else {
          style = 'error';
          help = 'пароли не совпадают';
        }
        break;
      default:
        //do nothing
      }
    }
    this.setState({
      [e.target.dataset.name]: {
        value: e.target.value,
        style: style,
        help: help
      }
    });
  }

  toggleAccept() {
    this.setState(() => ({
      accept: {
        value: !this.state.accept.value,
        help: this.state.accept.value ?
          'Для регистрации Вы должны согласиться с нашими условиями' :  '',
        style: this.state.accept.value ? 'has-error' : 'has-success'
      }
    }));
  }

  render() {
    const {socProps} = UserActions;
    const basil = new Basil({namespace: 'etagi_com'});
    const authSocial = basil.get('authSocial') || false;
    const bigSocButton = authSocial ?
      (<Row className='socails-buttons-bigbutton'><Col xs={12}>
        <Button
          onClick={this.authSocial.bind(this, authSocial)}
          className={socProps[authSocial].class}
          bsStyle='default'>
          <i className={socProps[authSocial].icon}/>
          <span>{socProps[authSocial].title}</span>
        </Button>
      </Col></Row>) : null;
    const socButtons = map(this.props.auth_uri, (item, key) =>{
      const size = authSocial ? 4 : 6;

      return authSocial === key ? null : (
        <Col xs={size} key={key}>
          <Button
            onClick={this.authSocial.bind(this, key)}
            className={socProps[key].class}
            bsStyle='default'>
            <i className={socProps[key].icon}/>
            <span>{socProps[key].title}</span>
          </Button>
        </Col>
      );
    });

    return (
      <form
        className="auth-form form-horizontal"
        autoComplete='off'
        onSubmit={this.register.bind(this)}
      >
        <Row>
          <Col xs={12}>
            <h2>
              Зарегистрируйтесь сейчас
            </h2>
          </Col>
        </Row>
        <Row>
            <Col xs={12}>через аккаунт социальной сети:</Col>
        </Row>
        {bigSocButton}
        <Row className='socails-buttons'>
          {socButtons}
        </Row>
        <div className='background-line'>
            <span>или с использованием телефона или EMail:</span>
        </div>
        <Row>
          <FormGroup className='col-xs-12'
            validationState={this.state.login.style}>
            <FormControl
              type='text'
              placeholder="Телефон или Ваш почтовый ящик"
              ref='login'
              id="login"
              data-name='login'
              required='on'
              onChange={this.handleChange.bind(this)}
              value={this.state.login.value}/>
            <Feedback />
            <HelpBlock> {this.state.login.help}</HelpBlock>
          </FormGroup>
          <FormGroup className='col-xs-12'
             validationState={this.state.password.style}>
            <FormControl
              type='password'
              placeholder="Ваш пароль"
              ref='password'
              id="password"
              data-name='password'
              required='on'
              onChange={this.handleChange.bind(this)}
              value={this.state.password.value}/>
            <Feedback />
            <HelpBlock> {this.state.password.help} </HelpBlock>
          </FormGroup>
          <FormGroup  className='col-xs-12'
            validationState={this.state.password2.style}>
            <FormControl
              type='password'
              placeholder="Повторите пароль"
              ref='password2'
              id="password"
              data-name='password2'
              required='on'
              onChange={this.handleChange.bind(this)}
              value={this.state.password2.value}/>
            <Feedback />
            <HelpBlock> {this.state.password2.help} </HelpBlock>
          </FormGroup>
        </Row>
        <Row>
          <Col xsOffset={3} xs={5} style={{padding: '0 4px'}}>
            <a href="#auth-register" onClick={this.login.bind(this)}>
              Уже зарегистрирован
            </a>
          </Col>
          <Col xs={4} style={{padding: '0 4px'}}>
            <a href="#auth-restore" onClick={this.restore.bind(this)}>
              Забыли пароль?
            </a>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
              <Button type='submit' bsStyle='primary'>
                Зарегистрироваться
              </Button>
          </Col>
        </Row>
        <Row>
          <div className='col-xs-12 form-group small'>
            <span>
              Нажимая кнопку "Зарегистрироваться",
              вы соглашаетесь с условиями&nbsp;
              <a href='/user_agreement/'>Пользовательского соглашения</a>
            </span>
          </div>
        </Row>
      </form>
    );
  }
}

export default AuthPanelRegisterForm;
