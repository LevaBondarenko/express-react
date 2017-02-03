/**
 * Authorization Panel Login Form component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {testPhone, testEmail} from '../../utils/Helpers';
import ga from '../../utils/ga';
import Basil from 'basil.js';
import {map} from 'lodash';

/**
 * React/Flux entities
 */
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

class AuthPanelLoginForm extends Component {
  static propTypes = {
    lkSettings: React.PropTypes.object,
    id: React.PropTypes.string,
    auth_uri: React.PropTypes.object //eslint-disable-line camelcase
  };
  constructor(props) {
    super(props);
    this.state = {
      login: '',
      loginHelp: '',
      password: ''
    };
  }

  authorize(e) {
    const cleanedPhone = this.state.login.replace(/[^0-9+]*/g, '');

    if(testPhone(cleanedPhone, true) || testEmail(this.state.login)) {
      UserActions.login(
        this.state.login,
        this.state.password,
        this.props.lkSettings
      );
      ga('link', 'lk_enter');
    } else {
      this.setState(() => ({
        loginHelp: 'Телефон или EMail введены некорректно',
        loginState: 'error'
      }));
    }
    e.preventDefault();
  }

  register(e) {
    UserActions.showRegister();
    ga('button', 'lk_enter_registration');
    e.preventDefault();
  }

  restore(e) {
    UserActions.showRestore();
    ga('link', 'lk_enter_forgot_password');
    e.preventDefault();
  }

  authSocial(s, e) {
    const basil = new Basil({namespace: 'etagi_com'});
    const retPath = window.location.href;
    const cookieDomain = window.location.host.replace(/^[^.]*/, '');

    // trackEvent
    switch (s) {
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

    basil.set('authSocial', s);
    basil.set('auth_ret_page', retPath, {
      domain: cookieDomain,
      namespace: '',
      storages: ['cookie']
    });
    window.location = this.props.auth_uri[s];
    e.preventDefault();
  }

  handleChange(event) {
    if(event.target.dataset.name === 'login') {
      const cleanedPhone = event.target.value.replace(/[^0-9+]*/g, '');
      let help, state;

      if(testPhone(cleanedPhone, true) || testEmail(event.target.value)) {
        help = '';
        state = 'success';
      }

      this.setState({
        loginHelp: help,
        loginState: state,
        [event.target.dataset.name]: event.target.value
      });
    } else {
      this.setState({
        [event.target.dataset.name]: event.target.value
      });
    }
  }

  render() {
    const {socProps} = UserActions;
    const {id} = this.props;
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
        <Col xs={size} key={`${id}-${key}`}>
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
        onSubmit={this.authorize.bind(this)}
      >
        <Row>
          <Col xs={12}>
            <h2>
              Войти в Личный кабинет
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
            <span>или аккаунт личного кабинета:</span>
        </div>
        <Row>
          <FormGroup className='col-xs-12'
            validationState={this.state.loginState}>
            <FormControl
              type='text'
              placeholder="Телефон или Ваш почтовый ящик"
              ref='login'
              id="login"
              data-name='login'
              required='on'
              className='col-xs-12'
              onChange={this.handleChange.bind(this)}
              value={this.state.login}
            />
            <Feedback />
            <HelpBlock>{this.state.loginHelp}</HelpBlock>
          </FormGroup>
          <FormGroup className='col-xs-12'>
            <FormControl
              type='password'
              placeholder="Ваш пароль"
              ref='password'
              id="password"
              data-name='password'
              required='on'
              onChange={this.handleChange.bind(this)}
              value={this.state.password}
            />
          </FormGroup>
        </Row>
        <Row>
            <Col xsOffset={3} xs={5} style={{padding: '0 4px'}}>
              <a href="#auth-register" onClick={this.register.bind(this)}>
                Зарегистрируйтесь
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
                <Button type='submit' bsStyle='primary'>Войти</Button>
            </Col>
        </Row>
      </form>
    );
  }
}

export default AuthPanelLoginForm;
